import { supabase } from "@/lib/supabase/client"
import { upsertLectureContent, getLectureContent, deleteLectureContent } from "./lecture-contents"

export interface Lecture {
  id: string
  title: string
  instructor?: string
  instructor_id?: string | null
  description?: string
  thumbnail_url?: string
  video_url?: string
  duration?: number
  price?: number
  is_published?: boolean
  created_at?: string
  updated_at?: string
  content?: string // Rich text content from lecture_contents table
  // UI-only fields (not in database)
  category?: string
  tags?: string[]
  views?: number
  location?: string
  capacity?: number
  status?: string
  date?: string
  registrations?: number
}

// Get all lectures with content
export async function getLectures() {
  const { data, error } = await supabase
    .from("lectures")
    .select(`
      *
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching lectures:", error)
    throw new Error("Failed to fetch lectures")
  }

  // Get content for each lecture and map to UI format
  const lecturesWithContent = await Promise.all(
    data.map(async (lecture) => {
      const content = await getLectureContent(lecture.id)

      // Get instructor name if instructor_id exists
      let instructorName = "TBD"
      if (lecture.instructor_id) {
        const { data: instructorData } = await supabase
          .from("authors")
          .select("name")
          .eq("id", lecture.instructor_id)
          .single()

        if (instructorData) {
          instructorName = instructorData.name
        }
      }

      return {
        ...lecture,
        instructor: instructorName,
        content: content?.content || "",
        // Map database fields to UI expected fields
        date: lecture.created_at ? new Date(lecture.created_at).toISOString().split("T")[0] : "",
        duration: lecture.duration?.toString() || "",
        registrations: 0, // UI-only field
        capacity: 0, // UI-only field
        status: lecture.is_published ? "published" : "draft",
        location: "", // UI-only field
        category: lecture.category || "beginner", // Use actual category from DB
        tags: lecture.tags || [], // Use actual tags from DB
        views: lecture.views || 0, // Use actual views from DB
      }
    }),
  )

  return lecturesWithContent as Lecture[]
}

// Get a single lecture by ID with content
export async function getLecture(id: string) {
  const { data, error } = await supabase.from("lectures").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching lecture:", error)
    throw new Error("Failed to fetch lecture")
  }

  // Get content
  const content = await getLectureContent(id)

  // Get instructor name if instructor_id exists
  let instructorName = "TBD"
  if (data.instructor_id) {
    const { data: instructorData } = await supabase.from("authors").select("name").eq("id", data.instructor_id).single()

    if (instructorData) {
      instructorName = instructorData.name
    }
  }

  return {
    ...data,
    instructor: instructorName,
    content: content?.content || "",
    // Map database fields to UI expected fields
    date: data.created_at ? new Date(data.created_at).toISOString().split("T")[0] : "",
    duration: data.duration?.toString() || "",
    registrations: 0, // UI-only field
    capacity: 0, // UI-only field
    status: data.is_published ? "published" : "draft",
    location: "", // UI-only field
    category: data.category || "beginner", // Use actual category from DB
    tags: data.tags || [], // Use actual tags from DB
    views: data.views || 0, // Use actual views from DB
  } as Lecture
}

// Create a new lecture with content
export async function createLecture(lecture: Omit<Lecture, "id" | "created_at" | "updated_at">) {
  // For now, always set instructor_id to null to avoid foreign key issues
  // Users can edit the lecture later to add an instructor
  const lectureData = {
    title: lecture.title,
    description: lecture.description || null,
    thumbnail_url: lecture.thumbnail_url || null,
    video_url: lecture.video_url || null,
    duration: lecture.duration ? Number.parseInt(lecture.duration.toString()) : null,
    duration_minutes: lecture.duration ? Number.parseInt(lecture.duration.toString()) : null,
    price: lecture.price || 0,
    is_published: lecture.status !== "draft",
    instructor_id: null, // Always null for new lectures
    category: lecture.category || null,
    tags: lecture.tags || null,
    views: 0,
  }

  console.log("Creating lecture with data:", lectureData)

  const { data, error } = await supabase.from("lectures").insert([lectureData]).select()

  if (error) {
    console.error("Error creating lecture:", error)
    throw new Error(`Failed to create lecture: ${error.message}`)
  }

  const newLecture = data[0]

  // Save content if provided
  if (lecture.content) {
    await upsertLectureContent(newLecture.id, lecture.content)
  }

  return {
    ...newLecture,
    content: lecture.content || "",
  } as Lecture
}

// Update an existing lecture with content
export async function updateLecture(id: string, lecture: Partial<Omit<Lecture, "id" | "created_at" | "updated_at">>) {
  // Only update fields that exist in the database schema
  const lectureData: any = {}

  if (lecture.title !== undefined) lectureData.title = lecture.title
  if (lecture.description !== undefined) lectureData.description = lecture.description
  if (lecture.thumbnail_url !== undefined) lectureData.thumbnail_url = lecture.thumbnail_url
  if (lecture.video_url !== undefined) lectureData.video_url = lecture.video_url
  if (lecture.duration !== undefined) {
    const durationValue = lecture.duration ? Number.parseInt(lecture.duration.toString()) : null
    lectureData.duration = durationValue
    lectureData.duration_minutes = durationValue
  }
  if (lecture.price !== undefined) lectureData.price = lecture.price
  if (lecture.status !== undefined) lectureData.is_published = lecture.status !== "draft"
  if (lecture.category !== undefined) lectureData.category = lecture.category
  if (lecture.tags !== undefined) lectureData.tags = lecture.tags

  // Handle instructor update carefully
  if (lecture.instructor_id !== undefined) {
    if (!lecture.instructor_id || lecture.instructor_id.trim() === "") {
      lectureData.instructor_id = null
    } else {
      // Validate that the instructor_id exists
      const { data: instructorData, error: instructorError } = await supabase
        .from("authors")
        .select("id")
        .eq("id", lecture.instructor_id.trim())
        .single()

      if (instructorError || !instructorData) {
        console.error("Error validating instructor:", instructorError)
        throw new Error("Invalid instructor selected. Please choose a valid instructor from the dropdown.")
      } else {
        lectureData.instructor_id = lecture.instructor_id.trim()
      }
    }
  }

  // Always update the updated_at timestamp
  lectureData.updated_at = new Date().toISOString()

  const { data, error } = await supabase.from("lectures").update(lectureData).eq("id", id).select()

  if (error) {
    console.error("Error updating lecture:", error)
    if (error.message.includes("foreign key constraint")) {
      throw new Error("Invalid instructor selected. Please choose a valid instructor from the dropdown.")
    }
    throw new Error("Failed to update lecture")
  }

  // Update content if provided
  if (lecture.content !== undefined) {
    if (lecture.content) {
      await upsertLectureContent(id, lecture.content)
    } else {
      await deleteLectureContent(id)
    }
  }

  return data[0] as Lecture
}

// Delete a lecture and its content
export async function deleteLecture(id: string) {
  // Delete content first
  await deleteLectureContent(id)

  const { error } = await supabase.from("lectures").delete().eq("id", id)

  if (error) {
    console.error("Error deleting lecture:", error)
    throw new Error("Failed to delete lecture")
  }

  return true
}

// Export the createLecture function that was already defined

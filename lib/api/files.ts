import { createClient } from "@/lib/supabase/client"

export interface FileRecord {
  id: string
  filename: string
  file_path: string
  file_type: string
  file_size: number
  entity_type: string
  entity_id: string
  uploaded_by?: string
  created_at?: string
}

export interface CreateFileData {
  filename: string
  file_path: string
  file_type: string
  file_size: number
  entity_type: string
  entity_id: string
  uploaded_by?: string
}

export async function uploadFile(bucket: string, path: string, file: File): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  })

  if (error) {
    console.error("Error uploading file:", error)
    throw error
  }

  return data.path
}

export async function createFileRecord(fileData: CreateFileData): Promise<FileRecord> {
  const supabase = createClient()

  const { data, error } = await supabase.from("files").insert([fileData]).select().single()

  if (error) {
    console.error("Error creating file record:", error)
    throw error
  }

  return data
}

export async function getFilesByEntity(entityType: string, entityId: string): Promise<FileRecord[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching files:", error)
    throw error
  }

  return data || []
}

export async function deleteFile(id: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.from("files").delete().eq("id", id)

  if (error) {
    console.error("Error deleting file record:", error)
    throw error
  }
}

export async function getFileUrl(bucket: string, path: string): Promise<string> {
  const supabase = createClient()

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)

  return data.publicUrl
}

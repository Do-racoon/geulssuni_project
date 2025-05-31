import { supabase } from "@/lib/supabase/client"

export interface Author {
  id: string
  name: string
  profession?: string
  experience?: string
  number_of_works: number
  quote?: string
  instagram_url?: string
  image_url?: string
  image_position_x: number
  image_position_y: number
  likes: number
  created_at?: string
  updated_at?: string
  status?: string
  featured?: boolean
  hashtags?: string[]
}

export async function getAuthors() {
  console.log("getAuthors 호출됨")
  const { data, error } = await supabase.from("authors").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("저자 목록 가져오기 오류:", error)
    throw new Error(`저자 목록을 가져오는데 실패했습니다: ${error.message}`)
  }

  console.log("저자 목록 가져오기 성공:", data)
  return data as Author[]
}

export async function getAuthor(id: string) {
  const { data, error } = await supabase.from("authors").select("*").eq("id", id).single()

  if (error) {
    console.error("저자 가져오기 오류:", error)
    throw new Error(`저자를 가져오는데 실패했습니다: ${error.message}`)
  }

  return data as Author
}

export async function createAuthor(author: Omit<Author, "id" | "created_at" | "updated_at">) {
  console.log("createAuthor 호출됨:", author)

  // 필수 필드 검증
  if (!author.name) {
    throw new Error("이름은 필수 항목입니다")
  }

  // 데이터 타입 변환 및 정리
  const authorData = {
    name: author.name,
    profession: author.profession || null,
    experience: author.experience || null,
    number_of_works: author.number_of_works || 0,
    quote: author.quote || null,
    instagram_url: author.instagram_url || null,
    image_url: author.image_url || null,
    image_position_x: author.image_position_x || 50,
    image_position_y: author.image_position_y || 50,
    likes: author.likes || 0,
    status: "active", // 기본 상태 추가
  }

  console.log("Supabase에 저장할 저자 데이터:", authorData)

  try {
    const { data, error } = await supabase.from("authors").insert([authorData]).select()

    if (error) {
      console.error("Supabase 저자 생성 오류:", error)
      throw new Error(`저자 생성에 실패했습니다: ${error.message}`)
    }

    if (!data || data.length === 0) {
      throw new Error("저자 데이터가 생성되지 않았습니다")
    }

    console.log("저자 생성 성공:", data[0])
    return data[0] as Author
  } catch (error) {
    console.error("저자 생성 중 예외 발생:", error)
    throw error
  }
}

export async function updateAuthor(id: string, author: Partial<Omit<Author, "id" | "created_at" | "updated_at">>) {
  const { data, error } = await supabase
    .from("authors")
    .update({ ...author, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("저자 업데이트 오류:", error)
    throw new Error(`저자 업데이트에 실패했습니다: ${error.message}`)
  }

  return data as Author
}

export async function deleteAuthor(id: string) {
  const { error } = await supabase.from("authors").delete().eq("id", id)

  if (error) {
    console.error("저자 삭제 오류:", error)
    throw new Error(`저자 삭제에 실패했습니다: ${error.message}`)
  }

  return true
}

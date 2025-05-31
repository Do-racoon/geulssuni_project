import { supabase } from "@/lib/supabase/client"

export interface Writer {
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

export async function getWriters() {
  console.log("getWriters 호출됨 - authors 테이블에서 조회")
  const { data, error } = await supabase.from("authors").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("저자 목록 가져오기 오류:", error)
    throw new Error(`저자 목록을 가져오는데 실패했습니다: ${error.message}`)
  }

  console.log("저자 목록 가져오기 성공:", data)
  return data as Writer[]
}

export async function getWriter(id: string) {
  console.log("getWriter 호출됨 - authors 테이블에서 조회:", id)
  const { data, error } = await supabase.from("authors").select("*").eq("id", id).single()

  if (error) {
    console.error("저자 가져오기 오류:", error)
    throw new Error(`저자를 가져오는데 실패했습니다: ${error.message}`)
  }

  return data as Writer
}

export async function createWriter(writer: Omit<Writer, "id" | "created_at" | "updated_at">) {
  console.log("createWriter 호출됨 - authors 테이블에 저장:", writer)

  // 필수 필드 검증
  if (!writer.name) {
    throw new Error("이름은 필수 항목입니다")
  }

  // 데이터 타입 변환
  const writerData = {
    name: writer.name,
    profession: writer.profession || null,
    experience: writer.experience || null,
    number_of_works: writer.number_of_works || 0,
    quote: writer.quote || null,
    instagram_url: writer.instagram_url || null,
    image_url: writer.image_url || null,
    image_position_x: writer.image_position_x || 50,
    image_position_y: writer.image_position_y || 50,
    likes: writer.likes || 0,
  }

  console.log("저자 생성 데이터:", writerData)

  const { data, error } = await supabase.from("authors").insert([writerData]).select()

  if (error) {
    console.error("저자 생성 오류:", error)
    throw new Error(`저자 생성에 실패했습니다: ${error.message}`)
  }

  console.log("저자 생성 성공:", data)
  return data[0] as Writer
}

export async function updateWriter(id: string, writer: Partial<Omit<Writer, "id" | "created_at" | "updated_at">>) {
  console.log("updateWriter 호출됨 - authors 테이블 업데이트:", id, writer)

  const { data, error } = await supabase
    .from("authors")
    .update({ ...writer, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("저자 업데이트 오류:", error)
    throw new Error(`저자 업데이트에 실패했습니다: ${error.message}`)
  }

  console.log("저자 업데이트 성공:", data)
  return data as Writer
}

export async function deleteWriter(id: string) {
  console.log("deleteWriter 호출됨 - authors 테이블에서 삭제:", id)

  const { error } = await supabase.from("authors").delete().eq("id", id)

  if (error) {
    console.error("저자 삭제 오류:", error)
    throw new Error(`저자 삭제에 실패했습니다: ${error.message}`)
  }

  console.log("저자 삭제 성공")
  return true
}

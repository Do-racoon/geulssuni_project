import { supabase } from "../supabase/server"

// 서버 사이드에서 직접 DB 조회
export async function getSetting(key: string, fallback = ""): Promise<string> {
  try {
    const { data, error } = await supabase.from("global_settings").select("value").eq("key", key).single()

    if (error) {
      console.error(`Error fetching setting ${key}:`, error)
      return fallback
    }

    return data?.value || fallback
  } catch (error) {
    console.error(`Error in getSetting for ${key}:`, error)
    return fallback
  }
}

// 모든 설정 가져오기 (서버 사이드)
export async function getAllSettings(): Promise<Record<string, string>> {
  try {
    const { data, error } = await supabase.from("global_settings").select("key, value")

    if (error) {
      console.error("Error fetching all settings:", error)
      return {}
    }

    const settings: Record<string, string> = {}
    data.forEach((item) => {
      settings[item.key] = item.value
    })

    return settings
  } catch (error) {
    console.error("Error in getAllSettings:", error)
    return {}
  }
}

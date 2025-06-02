import { supabase } from "@/lib/supabase/client"

export interface DashboardStats {
  totalSessions: number
  totalBookViews: number
  totalLectureViews: number
  totalPostViews: number
  monthlyActivity: Array<{
    date: string
    users: number
    posts: number
    views: number
  }>
  recentActivity: Array<{
    id: string
    type: "user_registration" | "post_created" | "lecture_created" | "book_created"
    description: string
    user_name: string
    created_at: string
  }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // 병렬로 모든 데이터 가져오기
    const [
      sessionsResult,
      bookViewsResult,
      lectureViewsResult,
      postViewsResult,
      monthlyActivityResult,
      recentUsersResult,
      recentPostsResult,
      recentLecturesResult,
      recentBooksResult,
    ] = await Promise.all([
      // 총 세션 수 (활성 사용자)
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),

      // 총 도서 조회수
      supabase
        .from("books")
        .select("views")
        .not("views", "is", null),

      // 총 강의 조회수
      supabase
        .from("lectures")
        .select("views")
        .not("views", "is", null),

      // 총 게시글 조회수
      supabase
        .from("board_posts")
        .select("views")
        .not("views", "is", null),

      // 월별 활동 데이터 (최근 30일)
      supabase.rpc("get_monthly_activity"),

      // 최근 회원가입 (5명)
      supabase
        .from("users")
        .select("id, name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5),

      // 최근 게시글 (5개)
      supabase
        .from("board_posts")
        .select(`
          id, title, created_at,
          author:users!author_id(name)
        `)
        .order("created_at", { ascending: false })
        .limit(5),

      // 최근 강의 (3개)
      supabase
        .from("lectures")
        .select("id, title, instructor, created_at")
        .order("created_at", { ascending: false })
        .limit(3),

      // 최근 도서 (3개)
      supabase
        .from("books")
        .select("id, title, author, created_at")
        .order("created_at", { ascending: false })
        .limit(3),
    ])

    // 조회수 합계 계산
    const totalBookViews = bookViewsResult.data?.reduce((sum, book) => sum + (book.views || 0), 0) || 0
    const totalLectureViews = lectureViewsResult.data?.reduce((sum, lecture) => sum + (lecture.views || 0), 0) || 0
    const totalPostViews = postViewsResult.data?.reduce((sum, post) => sum + (post.views || 0), 0) || 0

    // 최근 활동 통합
    const recentActivity = []

    // 회원가입 활동
    recentUsersResult.data?.forEach((user) => {
      recentActivity.push({
        id: user.id,
        type: "user_registration" as const,
        description: `${user.name}님이 회원가입했습니다`,
        user_name: user.name,
        created_at: user.created_at,
      })
    })

    // 게시글 작성 활동
    recentPostsResult.data?.forEach((post) => {
      recentActivity.push({
        id: post.id,
        type: "post_created" as const,
        description: `"${post.title}" 게시글이 작성되었습니다`,
        user_name: post.author?.name || "Unknown",
        created_at: post.created_at,
      })
    })

    // 강의 생성 활동
    recentLecturesResult.data?.forEach((lecture) => {
      recentActivity.push({
        id: lecture.id,
        type: "lecture_created" as const,
        description: `"${lecture.title}" 강의가 추가되었습니다`,
        user_name: lecture.instructor,
        created_at: lecture.created_at,
      })
    })

    // 도서 생성 활동
    recentBooksResult.data?.forEach((book) => {
      recentActivity.push({
        id: book.id,
        type: "book_created" as const,
        description: `"${book.title}" 도서가 추가되었습니다`,
        user_name: book.author,
        created_at: book.created_at,
      })
    })

    // 시간순 정렬
    recentActivity.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return {
      totalSessions: sessionsResult.count || 0,
      totalBookViews,
      totalLectureViews,
      totalPostViews,
      monthlyActivity: monthlyActivityResult.data || [],
      recentActivity: recentActivity.slice(0, 10), // 최근 10개만
    }
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)

    // 폴백 데이터
    return {
      totalSessions: 0,
      totalBookViews: 0,
      totalLectureViews: 0,
      totalPostViews: 0,
      monthlyActivity: [],
      recentActivity: [],
    }
  }
}

// 월별 활동 데이터를 위한 SQL 함수 생성이 필요한 경우 대체 방법
export async function getMonthlyActivityFallback() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const [usersData, postsData] = await Promise.all([
      supabase.from("users").select("created_at").gte("created_at", thirtyDaysAgo.toISOString()),

      supabase.from("board_posts").select("created_at, views").gte("created_at", thirtyDaysAgo.toISOString()),
    ])

    // 날짜별로 그룹화
    const activityMap = new Map()

    usersData.data?.forEach((user) => {
      const date = new Date(user.created_at).toISOString().split("T")[0]
      if (!activityMap.has(date)) {
        activityMap.set(date, { date, users: 0, posts: 0, views: 0 })
      }
      activityMap.get(date).users++
    })

    postsData.data?.forEach((post) => {
      const date = new Date(post.created_at).toISOString().split("T")[0]
      if (!activityMap.has(date)) {
        activityMap.set(date, { date, users: 0, posts: 0, views: 0 })
      }
      activityMap.get(date).posts++
      activityMap.get(date).views += post.views || 0
    })

    return Array.from(activityMap.values()).sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error("Error fetching monthly activity:", error)
    return []
  }
}

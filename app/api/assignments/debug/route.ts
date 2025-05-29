import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 디버그 API 호출됨")

    // 1. 모든 board_posts 테이블 데이터 확인
    const { data: allPosts, error: allError } = await supabase.from("board_posts").select("*")

    if (allError) {
      console.error("전체 게시글 조회 오류:", allError)
      return NextResponse.json({ error: "전체 게시글 조회 오류" }, { status: 500 })
    }

    // 2. 타입별 게시글 수 확인
    const typeCount: Record<string, number> = {}
    allPosts?.forEach((post) => {
      typeCount[post.type] = (typeCount[post.type] || 0) + 1
    })

    // 3. assignments 테이블 확인
    const { data: assignments, error: assignError } = await supabase.from("assignments").select("*")

    if (assignError) {
      console.error("과제 테이블 조회 오류:", assignError)
      return NextResponse.json({ error: "과제 테이블 조회 오류" }, { status: 500 })
    }

    // 4. assignment 타입 조인 쿼리
    const { data: joinedAssignmentData, error: joinAssignmentError } = await supabase
      .from("board_posts")
      .select(`
        *,
        assignments(*),
        author:users!author_id(name, email)
      `)
      .eq("type", "assignment")

    if (joinAssignmentError) {
      console.error("assignment 조인 쿼리 오류:", joinAssignmentError)
    }

    // 5. qna 타입 조인 쿼리
    const { data: joinedQnaData, error: joinQnaError } = await supabase
      .from("board_posts")
      .select(`
        *,
        assignments(*),
        author:users!author_id(name, email)
      `)
      .eq("type", "qna")

    if (joinQnaError) {
      console.error("qna 조인 쿼리 오류:", joinQnaError)
    }

    // 6. 불일치 항목 확인
    const postIds = new Set(allPosts.map((post) => post.id))
    const assignmentPostIds = new Set(assignments.map((a) => a.post_id))

    // assignments에는 있지만 board_posts에 없는 항목
    const missingPosts = [...assignmentPostIds].filter((id) => !postIds.has(id))

    // board_posts에는 있지만 assignments에 연결되지 않은 항목
    const postsWithoutAssignments = allPosts
      .filter((post) => (post.type === "assignment" || post.type === "qna") && !assignmentPostIds.has(post.id))
      .map((post) => post.id)

    // 7. 샘플 데이터 (각 타입별 1개씩)
    const sampleAssignment = joinedAssignmentData && joinedAssignmentData.length > 0 ? joinedAssignmentData[0] : null

    const sampleQna = joinedQnaData && joinedQnaData.length > 0 ? joinedQnaData[0] : null

    // 8. 디버그 정보 반환
    const debugInfo = {
      allPostsCount: allPosts?.length || 0,
      assignmentPostsCount: allPosts?.filter((post) => post.type === "assignment").length || 0,
      qnaPostsCount: allPosts?.filter((post) => post.type === "qna").length || 0,
      assignmentsCount: assignments?.length || 0,
      joinedAssignmentDataCount: joinedAssignmentData?.length || 0,
      joinedQnaDataCount: joinedQnaData?.length || 0,
      typeCount,
      missingPosts,
      postsWithoutAssignments,
      sampleData: {
        sampleAssignment,
        sampleQna,
      },
    }

    return NextResponse.json({ debug: debugInfo })
  } catch (error) {
    console.error("💥 디버그 API 오류:", error)
    return NextResponse.json({ error: "서버 오류가 발생했습니다", details: error.message }, { status: 500 })
  }
}

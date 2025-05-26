"use client"

export default function EnvGuidePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">환경변수 설정 가이드</h1>

      <div className="space-y-6">
        {/* 필수 환경변수 */}
        <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-green-800 mb-4">✅ 필수 환경변수 (이미 설정됨)</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-green-700">NEXT_PUBLIC_SUPABASE_URL</h3>
              <p className="text-sm text-green-600">Supabase 프로젝트 URL (이미 연결됨)</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-700">NEXT_PUBLIC_SUPABASE_ANON_KEY</h3>
              <p className="text-sm text-green-600">Supabase 익명 키 (이미 연결됨)</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-700">SUPABASE_SERVICE_ROLE_KEY</h3>
              <p className="text-sm text-green-600">Supabase 서비스 역할 키 (이미 연결됨)</p>
            </div>
            <div>
              <h3 className="font-semibold text-green-700">VERCEL_REGION</h3>
              <p className="text-sm text-green-600">Vercel 리전 설정 (이미 연결됨)</p>
            </div>
          </div>
        </div>

        {/* 선택적 환경변수 */}
        <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-blue-800 mb-4">🔧 선택적 환경변수 (자동 설정됨)</h2>
          <p className="text-blue-700 mb-4">
            다음 환경변수들은 설정하지 않아도 자동으로 감지되거나 기본값이 사용됩니다:
          </p>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-blue-700">NEXT_PUBLIC_APP_URL (선택사항)</h3>
              <p className="text-sm text-blue-600 mb-2">앱의 기본 URL</p>
              <div className="bg-gray-100 p-2 rounded text-sm">
                <p>
                  <strong>자동 감지:</strong>
                </p>
                <p>• 개발환경: http://localhost:3000</p>
                <p>• Vercel 배포: https://your-project.vercel.app</p>
                <p>• 수동 설정 시: 원하는 도메인 입력</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded border">
              <h3 className="font-semibold text-blue-700">NEXT_PUBLIC_API_URL (선택사항)</h3>
              <p className="text-sm text-blue-600 mb-2">API 엔드포인트 URL</p>
              <div className="bg-gray-100 p-2 rounded text-sm">
                <p>
                  <strong>자동 설정:</strong> {"{APP_URL}/api"}
                </p>
                <p>• 개발환경: http://localhost:3000/api</p>
                <p>• Vercel 배포: https://your-project.vercel.app/api</p>
              </div>
            </div>
          </div>
        </div>

        {/* 현재 설정 상태 */}
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 현재 설정 상태</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold">환경</h4>
              <p className="text-sm text-gray-600">{process.env.NODE_ENV || "development"}</p>
            </div>
            <div className="bg-white p-3 rounded border">
              <h4 className="font-semibold">현재 URL</h4>
              <p className="text-sm text-gray-600">
                {typeof window !== "undefined" ? window.location.origin : "서버사이드"}
              </p>
            </div>
          </div>
        </div>

        {/* 다음 단계 */}
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-yellow-800 mb-4">🚀 다음 단계</h2>
          <ol className="list-decimal list-inside space-y-2 text-yellow-700">
            <li>Supabase 대시보드에서 이메일 인증 활성화</li>
            <li>/supabase-setup 페이지에서 설정 확인</li>
            <li>/simple-login 페이지에서 로그인 테스트</li>
            <li>관리자 계정 생성 및 로그인</li>
          </ol>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-wrap gap-4 justify-center">
          <a
            href="/supabase-setup"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Supabase 설정 확인
          </a>
          <a
            href="/simple-login"
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            로그인 페이지로 이동
          </a>
          <a
            href="/final-check"
            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            최종 시스템 점검
          </a>
        </div>
      </div>
    </div>
  )
}

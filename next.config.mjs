/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // 파일 업로드 크기 제한 설정
  api: {
    bodyParser: {
      sizeLimit: '50mb',
    },
  },
  // 서버리스 함수 크기 제한 설정
  serverRuntimeConfig: {
    maxDuration: 30,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

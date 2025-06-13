import { getSetting } from "@/lib/api/settings"
import PopularContent from "@/components/popular-content"
import DynamicTitle from "@/components/dynamic-title"
import HeroVideo from "@/components/hero-video"

export default async function Home() {
  // 서버 사이드에서 설정값 가져오기
  const siteName = await getSetting("site_name", "글쓰니")
  const siteDescription = await getSetting("site_description", "글쓰기 교육 플랫폼")
  const heroVideoUrl = await getSetting("hero_video_url", "/videos/background-ocean.mp4")
  const heroFallbackImage = await getSetting("hero_fallback_image", "/images/hero-fallback.jpg")

  return (
    <div className="min-h-screen">
      <DynamicTitle />

      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* 비디오 배경 컴포넌트 */}
        <HeroVideo videoUrl={heroVideoUrl} fallbackImage={heroFallbackImage} />

        {/* Dark Overlay for better text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>

        {/* Content */}
        <div className="relative z-20 text-center space-y-8 px-4">
          <h1 className="text-6xl md:text-8xl font-light tracking-wider text-white drop-shadow-lg">{siteName}</h1>
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {siteDescription}
          </p>
        </div>
      </section>

      {/* Popular Content Section */}
      <PopularContent />
    </div>
  )
}

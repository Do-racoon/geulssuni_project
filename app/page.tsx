import { getSetting } from "@/lib/api/settings"
import PopularContent from "@/components/popular-content"

export default async function Home() {
  // 서버 사이드에서 설정값 가져오기
  const siteName = await getSetting("site_name", "글쓰니")
  const siteDescription = await getSetting("site_description", "글쓰기 교육 플랫폼")

  return (
    <div className="min-h-screen">
      {/* Hero Section with Video Background */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video */}
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
          <source src="/videos/background-ocean.mp4" type="video/mp4" />
        </video>

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

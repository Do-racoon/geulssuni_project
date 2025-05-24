import Header from "@/components/header"
import PopularContent from "@/components/popular-content"
import ScrollToTop from "@/components/scroll-to-top"
import TalkButton from "@/components/talk-button"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <PopularContent />
      <ScrollToTop />
      <TalkButton />
    </main>
  )
}

import { Suspense } from "react"
import FaqSection from "@/components/faq/faq-section"
import { getFAQs } from "@/lib/api/faqs"

async function FaqContent() {
  try {
    const faqs = await getFAQs() // removed publishedOnly parameter

    return <FaqSection faqs={faqs} />
  } catch (error) {
    console.error("Error loading FAQs:", error)
    return (
      <div className="text-center py-12">
        <p className="text-red-500 mb-4">FAQ를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-gray-400">페이지를 새로고침하거나 잠시 후 다시 시도해주세요.</p>
      </div>
    )
  }
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-4xl font-light text-center mb-16 tracking-widest uppercase">Frequently Asked Questions</h1>
        <Suspense
          fallback={
            <div className="text-center py-12">
              <p className="text-gray-500">FAQ를 불러오는 중...</p>
            </div>
          }
        >
          <FaqContent />
        </Suspense>
      </div>
    </main>
  )
}

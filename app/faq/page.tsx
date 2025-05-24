import type { Metadata } from "next"
import FaqSection from "@/components/faq/faq-section"

export const metadata: Metadata = {
  title: "FAQ | Creative Agency",
  description: "Frequently asked questions about our services, authors, and technical details",
}

export default function FaqPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-4xl font-light text-center mb-16 tracking-widest uppercase">Frequently Asked Questions</h1>
        <FaqSection />
      </div>
    </main>
  )
}

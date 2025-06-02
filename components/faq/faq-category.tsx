"use client"

import { useState } from "react"
import { Plus, Minus } from "lucide-react"
import type { FAQ } from "@/data/faq-data"

interface FaqCategoryProps {
  faqs: FAQ[]
}

export default function FaqCategory({ faqs }: FaqCategoryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={faq.id} className="border border-gray-200">
          <button
            className="flex justify-between items-center w-full p-6 text-left focus:outline-none"
            onClick={() => toggleFaq(index)}
            aria-expanded={openIndex === index}
          >
            <span className="text-lg font-light">{faq.question}</span>
            {openIndex === index ? (
              <Minus className="h-5 w-5 flex-shrink-0" />
            ) : (
              <Plus className="h-5 w-5 flex-shrink-0" />
            )}
          </button>
          {openIndex === index && (
            <div className="p-6 pt-0">
              <p className="text-gray-700">{faq.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

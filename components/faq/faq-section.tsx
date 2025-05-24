"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import FaqCategory from "./faq-category"
import { faqData } from "@/data/faq-data"
import NoResults from "./no-results"

export default function FaqSection() {
  const [activeCategory, setActiveCategory] = useState<"all" | "payment" | "author" | "technical" | "general">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNoResults, setShowNoResults] = useState(false)

  // Filter FAQs based on category and search query
  const filteredFaqs = faqData.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesSearch
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowNoResults(filteredFaqs.length === 0)

    // Auto-scroll to no results section if no results found
    if (filteredFaqs.length === 0) {
      setTimeout(() => {
        document.getElementById("no-results")?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    }
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowNoResults(false)
            }}
            placeholder="Search for keywords..."
            className="w-full border border-gray-200 p-4 pl-12 focus:outline-none focus:ring-1 focus:ring-black"
          />
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-4 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-black text-white text-sm"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center mb-12 overflow-x-auto">
        <div className="inline-flex border border-black">
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeCategory === "all" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => setActiveCategory("all")}
          >
            All
          </button>
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeCategory === "payment" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => setActiveCategory("payment")}
          >
            Payment
          </button>
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeCategory === "author" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => setActiveCategory("author")}
          >
            Author
          </button>
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeCategory === "technical" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => setActiveCategory("technical")}
          >
            Technical
          </button>
          <button
            className={`px-6 py-2 text-sm uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeCategory === "general" ? "bg-black text-white" : "bg-white text-black"
            }`}
            onClick={() => setActiveCategory("general")}
          >
            General
          </button>
        </div>
      </div>

      {/* FAQ Items */}
      <div className="max-w-3xl mx-auto">
        {filteredFaqs.length > 0 ? (
          <FaqCategory faqs={filteredFaqs} />
        ) : (
          showNoResults && <NoResults searchQuery={searchQuery} />
        )}
      </div>
    </div>
  )
}

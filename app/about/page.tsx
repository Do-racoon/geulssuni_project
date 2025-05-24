"use client"

import { useState } from "react"
import Image from "next/image"
import CompanyIntro from "@/components/about/company-intro"
import AuthorShowcase from "@/components/about/author-showcase"
import PortfolioHighlights from "@/components/about/portfolio-highlights"
import AuthorDetailModal from "@/components/about/author-detail-modal"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

// Creative thinking features moved from home page
const features = [
  {
    icon: "/images/creative-icon.svg",
    title: "Creative Thinking",
    description: "Innovative solutions that challenge conventional boundaries and inspire new perspectives.",
  },
  {
    icon: "/images/design-icon.svg",
    title: "Elegant Design",
    description: "Refined aesthetics that embody sophistication, clarity, and timeless visual appeal.",
  },
  {
    icon: "/images/strategy-icon.svg",
    title: "Strategic Vision",
    description: "Forward-thinking approaches that align creative direction with meaningful outcomes.",
  },
]

export default function AboutPage() {
  const [selectedAuthor, setSelectedAuthor] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("philosophy")

  const handleAuthorClick = (author: any) => {
    setSelectedAuthor(author)
    setIsModalOpen(true)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] mb-16 overflow-hidden rounded-lg">
        <Image src="/placeholder.svg?height=800&width=1600" alt="About Us" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-4">About Our Agency</h1>
            <p className="text-lg md:text-xl">
              We are a collective of creative minds dedicated to transforming ideas into impactful realities.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex border-b">
          <Button
            variant="ghost"
            className={`px-6 py-2 ${activeSection === "philosophy" ? "border-b-2 border-black" : ""}`}
            onClick={() => setActiveSection("philosophy")}
          >
            Our Philosophy
          </Button>
          <Button
            variant="ghost"
            className={`px-6 py-2 ${activeSection === "authors" ? "border-b-2 border-black" : ""}`}
            onClick={() => setActiveSection("authors")}
          >
            Our Authors
          </Button>
          <Button
            variant="ghost"
            className={`px-6 py-2 ${activeSection === "portfolio" ? "border-b-2 border-black" : ""}`}
            onClick={() => setActiveSection("portfolio")}
          >
            Portfolio
          </Button>
        </div>
      </div>

      {/* Philosophy Section */}
      {activeSection === "philosophy" && (
        <div className="mb-16 animate-fadeIn">
          <CompanyIntro />

          <Separator className="my-16" />

          {/* Creative Thinking Section (moved from home page) */}
          <div className="py-12">
            <h2 className="text-3xl font-light text-center mb-12 tracking-wider">Our Approach</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-6">
                    <Image
                      src={feature.icon || "/placeholder.svg?height=64&width=64"}
                      alt={feature.title}
                      width={64}
                      height={64}
                      className="mx-auto"
                    />
                  </div>
                  <h3 className="text-xl font-light mb-3 tracking-wider uppercase">{feature.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed max-w-xs mx-auto font-light">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Authors Section */}
      {activeSection === "authors" && (
        <div className="mb-16 animate-fadeIn">
          <AuthorShowcase onAuthorClick={handleAuthorClick} />
        </div>
      )}

      {/* Portfolio Section */}
      {activeSection === "portfolio" && (
        <div className="mb-16 animate-fadeIn">
          <PortfolioHighlights />
        </div>
      )}

      {selectedAuthor && (
        <AuthorDetailModal author={selectedAuthor} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  )
}

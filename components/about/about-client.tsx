"use client"

import { useState } from "react"
import Image from "next/image"
import CompanyIntro from "./company-intro"
import AuthorShowcase from "./author-showcase"
import PortfolioHighlights from "./portfolio-highlights"
import PhotoGallery from "./photo-gallery"
import AuthorDetailModal from "./author-detail-modal"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface AboutClientProps {
  authors: any[]
  portfolio: any[]
  photos: any[]
  features: any[]
}

export default function AboutClient({ authors, portfolio, photos, features }: AboutClientProps) {
  const [selectedAuthor, setSelectedAuthor] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("intro")

  const handleAuthorClick = (author: any) => {
    setSelectedAuthor(author)
    setIsModalOpen(true)
  }

  return (
    <>
      {/* Navigation Tabs */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex border-b">
          <Button
            variant="ghost"
            className={`px-6 py-2 ${activeSection === "intro" ? "border-b-2 border-black" : ""}`}
            onClick={() => setActiveSection("intro")}
          >
            Intro
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
          <Button
            variant="ghost"
            className={`px-6 py-2 ${activeSection === "photos" ? "border-b-2 border-black" : ""}`}
            onClick={() => setActiveSection("photos")}
          >
            Photos
          </Button>
        </div>
      </div>

      {/* Intro Section */}
      {activeSection === "intro" && (
        <div className="mb-16 animate-fadeIn">
          <CompanyIntro />

          <Separator className="my-16" />

          {/* Creative Thinking Section */}
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
          <AuthorShowcase authors={authors} onAuthorClick={handleAuthorClick} />
        </div>
      )}

      {/* Portfolio Section */}
      {activeSection === "portfolio" && (
        <div className="mb-16 animate-fadeIn">
          <PortfolioHighlights portfolio={portfolio} />
        </div>
      )}

      {/* Photos Section */}
      {activeSection === "photos" && (
        <div className="mb-16 animate-fadeIn">
          <PhotoGallery photos={photos} />
        </div>
      )}

      {selectedAuthor && (
        <AuthorDetailModal author={selectedAuthor} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  )
}

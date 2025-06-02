"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

interface PortfolioItem {
  id: string
  title: string
  description: string
  image: string
  category: string
  externalLink: string
}

// Sample data - in a real app, this would come from a database
const portfolioItems: PortfolioItem[] = [
  {
    id: "portfolio-1",
    title: "Monochrome Editorial",
    description: "A minimalist editorial design exploring the interplay of typography and negative space.",
    image: "/images/portfolio-1.jpg",
    category: "Editorial Design",
    externalLink: "https://example.com/portfolio/1",
  },
  {
    id: "portfolio-2",
    title: "Architectural Forms",
    description: "Photographic study of architectural elements and their geometric relationships.",
    image: "/images/portfolio-2.jpg",
    category: "Photography",
    externalLink: "https://example.com/portfolio/2",
  },
  {
    id: "portfolio-3",
    title: "Typography Collection",
    description: "Custom typeface design for contemporary fashion brands.",
    image: "/images/portfolio-3.jpg",
    category: "Typography",
    externalLink: "https://example.com/portfolio/3",
  },
  {
    id: "portfolio-4",
    title: "Brand Identity System",
    description: "Comprehensive identity system for a luxury hospitality brand.",
    image: "/images/portfolio-4.jpg",
    category: "Branding",
    externalLink: "https://example.com/portfolio/4",
  },
  {
    id: "portfolio-5",
    title: "Abstract Compositions",
    description: "Series exploring form, texture, and composition through abstract photography.",
    image: "/images/portfolio-5.jpg",
    category: "Photography",
    externalLink: "https://example.com/portfolio/5",
  },
  {
    id: "portfolio-6",
    title: "Packaging Design",
    description: "Minimalist packaging design for an artisanal cosmetics line.",
    image: "/images/portfolio-6.jpg",
    category: "Packaging",
    externalLink: "https://example.com/portfolio/6",
  },
]

export default function PortfolioHighlights() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-light text-center mb-16 tracking-widest uppercase">Portfolio Highlights</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioItems.map((item) => (
            <a
              key={item.id}
              href={item.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="relative aspect-square w-full overflow-hidden">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {hoveredItem === item.id && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 transition-opacity duration-300">
                    <div className="text-white">
                      <div className="text-xs uppercase tracking-wider mb-2">{item.category}</div>
                      <h3 className="text-xl font-light mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-300 mb-4">{item.description}</p>
                      <div className="flex items-center text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        <span>View Project</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

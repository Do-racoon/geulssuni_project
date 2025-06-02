"use client"

import { useState } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"

interface PortfolioItem {
  id: string
  title: string
  short_description: string
  thumbnail_url: string
  category: string
  link: string
  created_at?: string
}

interface PortfolioHighlightsProps {
  portfolio: PortfolioItem[]
}

export default function PortfolioHighlights({ portfolio = [] }: PortfolioHighlightsProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Enhanced Header with decorative elements */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-32"></div>
            <div className="mx-6 flex space-x-2">
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-32"></div>
          </div>
          <h2 className="text-3xl font-light tracking-widest uppercase">Portfolio Highlights</h2>
          <div className="mt-4 flex items-center justify-center">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-40"></div>
          </div>
        </div>

        {portfolio.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No portfolio items available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {portfolio.map((item) => (
              <a
                key={item.id}
                href={item.link || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <div className="relative overflow-hidden border border-gray-200 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                  {/* Top decorative border */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={item.thumbnail_url || "/placeholder.svg?height=400&width=400&query=portfolio"}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Enhanced overlay with geometric elements */}
                    {hoveredItem === item.id && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col justify-end p-6 transition-opacity duration-300">
                        {/* Decorative corner elements */}
                        <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-white/50"></div>
                        <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-white/50"></div>
                        <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-white/50"></div>
                        <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-white/50"></div>

                        <div className="text-white relative z-10">
                          <div className="flex items-center mb-2">
                            <div className="text-xs uppercase tracking-wider">{item.category}</div>
                            <div className="ml-2 h-px bg-white/50 flex-1"></div>
                          </div>
                          <h3 className="text-xl font-light mb-2">{item.title}</h3>
                          <div className="h-px bg-white/30 w-16 mb-3"></div>
                          <p className="text-sm text-gray-300 mb-4 leading-relaxed line-clamp-3">
                            {item.short_description}
                          </p>
                          <div className="flex items-center text-xs border border-white/30 px-3 py-1 inline-flex rounded">
                            <ExternalLink className="h-3 w-3 mr-2" />
                            <span>View Project</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Side decorative lines */}
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  {/* Bottom decorative border */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-300 via-gray-500 to-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

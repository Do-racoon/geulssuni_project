"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"

interface PortfolioItem {
  id: string
  title: string
  category: string
  image_url: string
  link: string
  featured: boolean
}

export default function Portfolio() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const { data, error } = await supabase
          .from("portfolio")
          .select("id, title, category, image_url, link, featured")
          .eq("status", "published")
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })

        if (error) throw error
        setPortfolioItems(data || [])
      } catch (error) {
        console.error("Error fetching portfolio:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-light text-center mb-16 tracking-widest uppercase">Portfolio</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid-gallery">
            {portfolioItems.map((item) => (
              <a
                key={item.id}
                href={item.link}
                className="block relative aspect-square w-full image-focus"
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Image
                  src={item.image_url || "/placeholder.svg"}
                  alt={item.title}
                  fill
                  className="object-cover monochrome"
                />
                {hoveredItem === item.id && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center transition-opacity duration-300">
                    <div className="text-center px-4">
                      <h3 className="text-white text-xl font-light tracking-wider uppercase mb-2">{item.title}</h3>
                      <div className="w-12 h-px bg-white mx-auto mb-2"></div>
                      <p className="text-white/80 text-sm">View Project</p>
                    </div>
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

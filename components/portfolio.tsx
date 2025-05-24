"use client"

import { useState } from "react"
import Image from "next/image"

type PortfolioItem = {
  id: number
  title: string
  image: string
  link: string
}

const portfolioItems: PortfolioItem[] = [
  {
    id: 1,
    title: "Monochrome Editorial",
    image: "/images/portfolio-1.jpg",
    link: "#",
  },
  {
    id: 2,
    title: "Architectural Minimalism",
    image: "/images/portfolio-2.jpg",
    link: "#",
  },
  {
    id: 3,
    title: "Fashion Collection",
    image: "/images/portfolio-3.jpg",
    link: "#",
  },
  {
    id: 4,
    title: "Abstract Compositions",
    image: "/images/portfolio-4.jpg",
    link: "#",
  },
  {
    id: 5,
    title: "Brand Identity",
    image: "/images/portfolio-5.jpg",
    link: "#",
  },
  {
    id: 6,
    title: "Luxury Packaging",
    image: "/images/portfolio-6.jpg",
    link: "#",
  },
]

export default function Portfolio() {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null)

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-3xl font-light text-center mb-16 tracking-widest uppercase">Portfolio</h2>

        <div className="grid-gallery">
          {portfolioItems.map((item) => (
            <a
              key={item.id}
              href={item.link}
              className="block relative aspect-square w-full image-focus"
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Image src={item.image || "/placeholder.svg"} alt={item.title} fill className="object-cover monochrome" />
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
      </div>
    </section>
  )
}

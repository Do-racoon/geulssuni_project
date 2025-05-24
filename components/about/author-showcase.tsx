"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import AuthorDetailModal from "./author-detail-modal"

export interface Author {
  id: string
  name: string
  image: string
  role: string
  experience: string
  quote: string
  portfolioCount: number
  likes: number
  instagramUrl: string
}

// Sample data - in a real app, this would come from a database
const authors: Author[] = [
  {
    id: "author-1",
    name: "Alexandra Reeves",
    image: "/images/profile-1.jpg",
    role: "Creative Director",
    experience: "15+ years in editorial design and creative direction",
    quote: "Design is not just what it looks like and feels like. Design is how it works.",
    portfolioCount: 24,
    likes: 256,
    instagramUrl: "https://instagram.com/alexandrareeves",
  },
  {
    id: "author-2",
    name: "Thomas Noir",
    image: "/images/profile-2.jpg",
    role: "Typography Specialist",
    experience: "12 years specializing in typography and brand identity",
    quote: "Typography is what language looks like.",
    portfolioCount: 18,
    likes: 189,
    instagramUrl: "https://instagram.com/thomasnoir",
  },
  {
    id: "author-3",
    name: "Elise Laurent",
    image: "/images/profile-3.jpg",
    role: "Visual Storyteller",
    experience: "10+ years in photography and visual narrative",
    quote: "A photograph is a secret about a secret. The more it tells you, the less you know.",
    portfolioCount: 32,
    likes: 142,
    instagramUrl: "https://instagram.com/eliselaurent",
  },
  {
    id: "author-4",
    name: "Marcus Chen",
    image: "/images/profile-4.jpg",
    role: "Design Educator",
    experience: "8 years teaching design principles and creative writing",
    quote: "Education is not the filling of a pail, but the lighting of a fire.",
    portfolioCount: 15,
    likes: 98,
    instagramUrl: "https://instagram.com/marcuschen",
  },
]

export default function AuthorShowcase() {
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)

  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-light text-center mb-16 tracking-widest uppercase">Our Authors</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {authors.map((author, index) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-white cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
              onClick={() => setSelectedAuthor(author)}
            >
              <div className="relative aspect-square w-full">
                <Image src={author.image || "/placeholder.svg"} alt={author.name} fill className="object-cover" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-light tracking-wider">{author.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{author.role}</p>
                <div className="mt-4 text-xs text-gray-500">{author.portfolioCount} works</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {selectedAuthor && <AuthorDetailModal author={selectedAuthor} onClose={() => setSelectedAuthor(null)} />}
    </section>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import AuthorModal from "./author-modal"

export type Author = {
  id: number
  name: string
  image: string
  profileImage: string
  hashtags: string[]
  likes: number
  instagramUrl: string
}

const authors: Author[] = [
  {
    id: 1,
    name: "Alexandra Reeves",
    image: "/images/author-1.jpg",
    profileImage: "/images/profile-1.jpg",
    hashtags: ["#minimal", "#editorial", "#portrait"],
    likes: 1243,
    instagramUrl: "https://instagram.com",
  },
  {
    id: 2,
    name: "Thomas Noir",
    image: "/images/author-2.jpg",
    profileImage: "/images/profile-2.jpg",
    hashtags: ["#monochrome", "#architecture", "#modern"],
    likes: 982,
    instagramUrl: "https://instagram.com",
  },
  {
    id: 3,
    name: "Elise Laurent",
    image: "/images/author-3.jpg",
    profileImage: "/images/profile-3.jpg",
    hashtags: ["#fashion", "#elegant", "#design"],
    likes: 1567,
    instagramUrl: "https://instagram.com",
  },
  {
    id: 4,
    name: "Marcus Chen",
    image: "/images/author-4.jpg",
    profileImage: "/images/profile-4.jpg",
    hashtags: ["#abstract", "#minimal", "#composition"],
    likes: 1105,
    instagramUrl: "https://instagram.com",
  },
]

export default function Authors() {
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null)

  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-3xl font-light text-center mb-16 tracking-widest uppercase">Our Authors</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {authors.map((author) => (
            <div
              key={author.id}
              className="bg-white cursor-pointer content-card shadow-sm hover:shadow-md transition-shadow duration-300"
              onClick={() => setSelectedAuthor(author)}
            >
              <div className="relative h-60 w-full overflow-hidden">
                <Image
                  src={author.image || "/placeholder.svg"}
                  alt={author.name}
                  fill
                  className="object-cover monochrome hover:filter-none transition-all duration-500"
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="text-lg font-light tracking-wider uppercase">{author.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{author.hashtags.join(" ")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAuthor && <AuthorModal author={selectedAuthor} onClose={() => setSelectedAuthor(null)} />}
    </section>
  )
}

"use client"
import Image from "next/image"
import { motion } from "framer-motion"

interface AuthorShowcaseProps {
  authors: any[]
  onAuthorClick: (author: any) => void
}

export default function AuthorShowcase({ authors, onAuthorClick }: AuthorShowcaseProps) {
  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-light text-center mb-16 tracking-widest uppercase">Our Authors</h2>

        {authors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No authors found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {authors.map((author, index) => (
              <motion.div
                key={author.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-white cursor-pointer transition-transform duration-300 hover:scale-[1.02]"
                onClick={() => onAuthorClick(author)}
              >
                <div className="relative aspect-square w-full">
                  <Image
                    src={author.image_url || "/placeholder.svg?height=400&width=400"}
                    alt={author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-light tracking-wider">{author.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{author.profession || "Author"}</p>
                  <div className="mt-4 text-xs text-gray-500">{author.number_of_works || 0} works</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

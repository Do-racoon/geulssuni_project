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
        {/* Enhanced Header with decorative lines */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-24"></div>
            <div className="mx-4 w-2 h-2 bg-gray-400 rotate-45"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-24"></div>
          </div>
          <h2 className="text-3xl font-light tracking-widest uppercase">Our Authors</h2>
          <div className="mt-4 flex items-center justify-center">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-400 to-transparent w-32"></div>
          </div>
        </div>

        {authors.length === 0 ? (
          <div className="text-center py-12">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
              <p className="text-gray-500 text-lg">No authors found.</p>
              <div className="mt-4 h-px bg-gray-200 w-16 mx-auto"></div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {authors.map((author, index) => (
              <motion.div
                key={author.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group cursor-pointer"
                onClick={() => onAuthorClick(author)}
              >
                {/* Card with enhanced borders and shadows */}
                <div className="bg-white border border-gray-200 transition-all duration-300 hover:border-gray-400 hover:shadow-lg relative overflow-hidden">
                  {/* Top decorative line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                  <div className="relative aspect-square w-full overflow-hidden">
                    <Image
                      src={author.image_url || "/placeholder.svg?height=400&width=400"}
                      alt={author.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                  </div>

                  <div className="p-6 relative">
                    {/* Side decorative lines */}
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <h3 className="text-xl font-light tracking-wider mb-1">{author.name}</h3>
                    <div className="h-px bg-gray-200 w-8 mb-2 group-hover:w-12 transition-all duration-300"></div>
                    <p className="text-sm text-gray-600">{author.profession || "Author"}</p>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">{author.number_of_works || 0} works</div>
                        <div className="w-4 h-4 border border-gray-300 rotate-45 group-hover:rotate-90 transition-transform duration-300"></div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom decorative line */}
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-gray-200 via-gray-400 to-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

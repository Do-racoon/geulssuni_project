import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Eye, BookOpen, Clock, Heart } from "lucide-react"

// This would typically come from a database or API
const getContentItem = (id: string) => {
  const contentItems = [
    {
      id: "1",
      type: "lecture",
      title: "The Art of Minimalism",
      author: "Alexandra Reeves",
      authorId: "1",
      thumbnail: "/images/lecture-1.jpg",
      views: 12450,
      engagement: 89,
      duration: "45 min",
      featured: true,
      description:
        "An in-depth exploration of minimalist principles in design and how they can be applied to create impactful visual experiences. This lecture covers historical context, key practitioners, and practical techniques.",
      date: "March 15, 2023",
      likes: 342,
      related: [3, 5],
    },
    {
      id: "2",
      type: "book",
      title: "Design Principles",
      author: "Thomas Noir",
      authorId: "2",
      thumbnail: "/images/book-1.jpg",
      views: 9870,
      engagement: 92,
      duration: "320 pages",
      featured: true,
      description:
        "A comprehensive guide to fundamental design principles that form the foundation of all visual communication. This book explores composition, hierarchy, balance, contrast, and other essential concepts through practical examples and case studies.",
      date: "January 10, 2023",
      likes: 287,
      related: [4, 6],
    },
    {
      id: "3",
      type: "lecture",
      title: "Creative Direction",
      author: "Elise Laurent",
      authorId: "3",
      thumbnail: "/images/lecture-2.jpg",
      views: 8540,
      engagement: 78,
      duration: "60 min",
      featured: false,
      description:
        "Learn the art and science of creative direction from an industry veteran. This lecture covers the role of a creative director, team management, client relationships, and maintaining a consistent vision throughout projects.",
      date: "April 22, 2023",
      likes: 198,
      related: [1, 5],
    },
    {
      id: "4",
      type: "book",
      title: "Modern Typography",
      author: "Marcus Chen",
      authorId: "4",
      thumbnail: "/images/book-2.jpg",
      views: 7650,
      engagement: 85,
      duration: "280 pages",
      featured: false,
      description:
        "An exploration of contemporary typography practices and their application in digital and print media. This book examines typeface selection, pairing, hierarchy, and layout considerations for effective communication.",
      date: "February 5, 2023",
      likes: 231,
      related: [2, 6],
    },
    {
      id: "5",
      type: "lecture",
      title: "Visual Storytelling",
      author: "Alexandra Reeves",
      authorId: "1",
      thumbnail: "/images/lecture-3.jpg",
      views: 6980,
      engagement: 91,
      duration: "50 min",
      featured: false,
      description:
        "Discover how to craft compelling visual narratives that engage audiences and communicate complex ideas. This lecture explores storyboarding, visual metaphors, pacing, and emotional resonance in visual communication.",
      date: "May 8, 2023",
      likes: 176,
      related: [1, 3],
    },
    {
      id: "6",
      type: "book",
      title: "The Essence of Form",
      author: "Thomas Noir",
      authorId: "2",
      thumbnail: "/images/book-3.jpg",
      views: 5430,
      engagement: 87,
      duration: "210 pages",
      featured: false,
      description:
        "An examination of form as a fundamental element of design across disciplines. This book analyzes how form influences function, perception, and meaning, with examples from product design, architecture, and visual arts.",
      date: "June 17, 2023",
      likes: 154,
      related: [2, 4],
    },
  ]

  return contentItems.find((item) => item.id === id)
}

export default function ContentPage({ params }: { params: { id: string } }) {
  const content = getContentItem(params.id)

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light mb-4">Content not found</h1>
          <Link href="/" className="text-sm underline">
            Return to home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-12 px-4">
        <Link href="/" className="inline-flex items-center text-sm mb-8 hover:underline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="relative aspect-[16/9] w-full mb-8">
              <Image
                src={content.thumbnail || "/placeholder.svg"}
                alt={content.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            <h1 className="text-3xl font-light tracking-wider mb-4">{content.title}</h1>

            <div className="flex items-center justify-between mb-8">
              <Link href={`/authors/${content.authorId}`} className="text-sm hover:underline">
                by {content.author}
              </Link>

              <div className="text-sm text-gray-500">{content.date}</div>
            </div>

            <div className="prose max-w-none mb-12">
              <p className="text-gray-700 leading-relaxed">{content.description}</p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu
                sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla
                enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Suspendisse in urna ligula, a volutpat mauris. Sed enim mi, bibendum eu pulvinar vel, sodales vitae dui.
                Pellentesque sed sapien lorem, at lacinia urna. In hac habitasse platea dictumst. Vivamus vel justo in
                leo laoreet ullamcorper non vitae lorem. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="border border-gray-200 p-6 mb-8">
              <h3 className="text-lg font-light tracking-wider mb-4 uppercase">Details</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span className="text-sm">Views</span>
                  </div>
                  <span className="text-sm">{content.views.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span className="text-sm">Likes</span>
                  </div>
                  <span className="text-sm">{content.likes.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {content.type === "lecture" ? <Clock className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                    <span className="text-sm">Duration</span>
                  </div>
                  <span className="text-sm">{content.duration}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Engagement</span>
                  <span className="text-sm">{content.engagement}%</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 p-6">
              <h3 className="text-lg font-light tracking-wider mb-4 uppercase">Related Content</h3>

              <div className="space-y-4">
                {content.related.map((relatedId) => {
                  const relatedItem = getContentItem(relatedId.toString())
                  if (!relatedItem) return null

                  return (
                    <Link key={relatedId} href={`/content/${relatedId}`} className="flex gap-4 group">
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <Image
                          src={relatedItem.thumbnail || "/placeholder.svg"}
                          alt={relatedItem.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium group-hover:underline">{relatedItem.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">by {relatedItem.author}</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

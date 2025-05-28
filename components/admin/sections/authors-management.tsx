"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, Filter } from "lucide-react"
import Image from "next/image"
import AddAuthorModal from "../modals/add-author-modal"
import { getAuthors, deleteAuthor, type Author } from "@/lib/api/authors"
import { toast } from "@/hooks/use-toast"

// Sample data - in a real app, this would come from an API
const authors = [
  {
    id: "author-1",
    name: "Alexandra Reeves",
    image: "/images/author-1.jpg",
    profileImage: "/images/profile-1.jpg",
    hashtags: ["#minimal", "#editorial", "#portrait"],
    likes: 1243,
    instagramUrl: "https://instagram.com",
    bio: "Editorial photographer specializing in minimalist portraits.",
    featured: true,
    status: "active",
  },
  {
    id: "author-2",
    name: "Thomas Noir",
    image: "/images/author-2.jpg",
    profileImage: "/images/profile-2.jpg",
    hashtags: ["#monochrome", "#architecture", "#modern"],
    likes: 982,
    instagramUrl: "https://instagram.com",
    bio: "Architectural photographer with a focus on monochrome and modern structures.",
    featured: true,
    status: "active",
  },
  {
    id: "author-3",
    name: "Elise Laurent",
    image: "/images/author-3.jpg",
    profileImage: "/images/profile-3.jpg",
    hashtags: ["#fashion", "#elegant", "#design"],
    likes: 1567,
    instagramUrl: "https://instagram.com",
    bio: "Fashion photographer and designer with an elegant aesthetic.",
    featured: false,
    status: "active",
  },
  {
    id: "author-4",
    name: "Marcus Chen",
    image: "/images/author-4.jpg",
    profileImage: "/images/profile-4.jpg",
    hashtags: ["#abstract", "#minimal", "#composition"],
    likes: 1105,
    instagramUrl: "https://instagram.com",
    bio: "Abstract artist focusing on minimal compositions and visual storytelling.",
    featured: false,
    status: "active",
  },
  {
    id: "author-5",
    name: "Sophia Williams",
    image: "/placeholder.svg?height=400&width=300",
    profileImage: "/placeholder.svg?height=200&width=200",
    hashtags: ["#typography", "#branding", "#design"],
    likes: 876,
    instagramUrl: "https://instagram.com",
    bio: "Typography specialist and brand designer with a clean aesthetic.",
    featured: false,
    status: "pending",
  },
]

export default function AuthorsManagement() {
  const [authorsList, setAuthorsList] = useState<Author[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Author>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterFeatured, setFilterFeatured] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    try {
      setIsLoading(true)
      const data = await getAuthors()
      setAuthorsList(data)
    } catch (error) {
      console.error("Error loading authors:", error)
      toast({
        title: "Error",
        description: "Failed to load authors",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort authors
  const filteredAuthors = authorsList
    .filter((author) => {
      const matchesSearch =
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (author.profession && author.profession.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesStatus = filterStatus === "all" || author.status === filterStatus
      const matchesFeatured =
        filterFeatured === "all" || (filterFeatured === "featured" ? author.featured : !author.featured)

      return matchesSearch && matchesStatus && matchesFeatured
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof Author) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDeleteAuthor = async (authorId: string) => {
    if (confirm("Are you sure you want to delete this author? This action cannot be undone.")) {
      try {
        setIsLoading(true)
        await deleteAuthor(authorId)
        await loadAuthors()
        toast({
          title: "Author deleted",
          description: "The author has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting author:", error)
        toast({
          title: "Error",
          description: "Failed to delete author",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-light">Authors Management</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search authors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1 px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-md"
            >
              <Plus className="h-4 w-4" />
              <span>New Author</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuthors.map((author) => (
          <div key={author.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6 flex items-center">
              <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 relative">
                <Image
                  src={author.profileImage || "/placeholder.svg"}
                  alt={author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="ml-4">
                <h3 className="font-medium">{author.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{author.bio}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {author.hashtags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
              <span
                className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  author.status === "active"
                    ? "bg-green-100 text-green-800"
                    : author.status === "inactive"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {author.status.charAt(0).toUpperCase() + author.status.slice(1)}
              </span>
              <div className="flex items-center space-x-2">
                <button className="text-gray-600 hover:text-gray-900">
                  <Edit className="h-4 w-4" />
                </button>
                <button onClick={() => handleDeleteAuthor(author.id)} className="text-red-600 hover:text-red-900">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAuthors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No authors found matching your criteria.</p>
        </div>
      )}

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        Showing {filteredAuthors.length} of {authorsList.length} authors
      </div>

      {showAddModal && <AddAuthorModal onClose={() => setShowAddModal(false)} />}
    </div>
  )
}

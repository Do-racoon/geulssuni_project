"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter } from "lucide-react"

// Sample data - in a real app, this would come from an API
const boardPosts = [
  {
    id: "post-1",
    title: "Design Principles for Minimalist Layouts",
    category: "design",
    author: "Thomas Noir",
    createdAt: "2023-05-15",
    comments: 12,
    likes: 48,
    isPinned: true,
    status: "published",
  },
  {
    id: "post-2",
    title: "The Art of Black and White Photography",
    category: "photography",
    author: "Alexandra Reeves",
    createdAt: "2023-05-10",
    comments: 8,
    likes: 36,
    isPinned: false,
    status: "published",
  },
  {
    id: "post-3",
    title: "Typography Trends for 2023",
    category: "design",
    author: "Elise Laurent",
    createdAt: "2023-05-05",
    comments: 15,
    likes: 52,
    isPinned: false,
    status: "published",
  },
  {
    id: "post-4",
    title: "Creative Writing Exercises for Beginners",
    category: "writing",
    author: "Marcus Chen",
    createdAt: "2023-04-28",
    comments: 6,
    likes: 24,
    isPinned: false,
    status: "published",
  },
  {
    id: "post-5",
    title: "Discussion: Future of Digital Art",
    category: "discussion",
    author: "John Doe",
    createdAt: "2023-04-20",
    comments: 32,
    likes: 67,
    isPinned: false,
    status: "published",
  },
  {
    id: "post-6",
    title: "Draft: Upcoming Photography Workshop",
    category: "photography",
    author: "Admin",
    createdAt: "2023-05-18",
    comments: 0,
    likes: 0,
    isPinned: false,
    status: "draft",
  },
]

interface FreeBoardManagementProps {
  onAddPost: () => void
  onEditPost: (postId: string) => void
}

export default function FreeBoardManagement({ onAddPost, onEditPost }: FreeBoardManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof (typeof boardPosts)[0]>("createdAt")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort posts
  const filteredPosts = boardPosts
    .filter((post) => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || post.category === filterCategory
      const matchesStatus = filterStatus === "all" || post.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof (typeof boardPosts)[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDeletePost = (postId: string) => {
    // In a real app, this would call an API to delete the post
    if (confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      console.log(`Delete post with ID: ${postId}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-black"
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
            onClick={onAddPost}
            className="flex items-center gap-1 px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-md"
          >
            <Plus className="h-4 w-4" />
            <span>New Post</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-gray-200">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Categories</option>
                <option value="design">Design</option>
                <option value="photography">Photography</option>
                <option value="writing">Writing</option>
                <option value="discussion">Discussion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("title")}
                >
                  <div className="flex items-center">
                    Title
                    {sortField === "title" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    Category
                    {sortField === "category" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("author")}
                >
                  <div className="flex items-center">
                    Author
                    {sortField === "author" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === "createdAt" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "status" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium flex items-center">
                      {item.isPinned && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded mr-2">Pinned</span>
                      )}
                      {item.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      <span className="mr-3">💬 {item.comments}</span>
                      <span>❤️ {item.likes}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2 justify-end">
                      <button onClick={() => onEditPost(item.id)} className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeletePost(item.id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No posts found matching your criteria.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredPosts.length} of {boardPosts.length} posts
        </div>
      </div>
    </div>
  )
}

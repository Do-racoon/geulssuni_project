"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter, ShoppingCart } from "lucide-react"
import Image from "next/image"
import AddBookModal from "../modals/add-book-modal"
import EditBookModal from "../modals/edit-book-modal"
import { toast } from "@/hooks/use-toast"

// Sample data - in a real app, this would come from an API
const books = [
  {
    id: "book-1",
    title: "The Art of Minimalism",
    author: "Thomas Noir",
    category: "Design",
    image: "/images/book-1.jpg",
    publishDate: "2023-01-15",
    price: 29.99,
    sales: 124,
    status: "published",
  },
  {
    id: "book-2",
    title: "Typography Essentials",
    author: "Alexandra Reeves",
    category: "Typography",
    image: "/images/book-2.jpg",
    publishDate: "2022-11-20",
    price: 24.99,
    sales: 98,
    status: "published",
  },
  {
    id: "book-3",
    title: "Black & White Photography",
    author: "Marcus Chen",
    category: "Photography",
    image: "/images/book-3.jpg",
    publishDate: "2023-03-10",
    price: 34.99,
    sales: 76,
    status: "published",
  },
  {
    id: "book-4",
    title: "Fashion Design Principles",
    author: "Elise Laurent",
    category: "Fashion",
    image: "/placeholder.svg?height=400&width=300",
    publishDate: "2023-02-25",
    price: 39.99,
    sales: 52,
    status: "published",
  },
  {
    id: "book-5",
    title: "Modern Brand Identity",
    author: "Alexandra Reeves",
    category: "Branding",
    image: "/placeholder.svg?height=400&width=300",
    publishDate: "2023-04-05",
    price: 27.99,
    sales: 0,
    status: "draft",
  },
]

export default function BookManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof (typeof books)[0]>("publishDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<(typeof books)[0] | null>(null)
  const [booksList, setBooksList] = useState(books)

  // Filter and sort books
  const filteredBooks = booksList
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || book.category === filterCategory
      const matchesStatus = filterStatus === "all" || book.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof (typeof books)[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleEditBook = (book: (typeof books)[0]) => {
    setSelectedBook(book)
    setShowEditModal(true)
  }

  const handleSaveBook = (updatedBook: any) => {
    setBooksList(booksList.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
    setShowEditModal(false)
  }

  const handleDeleteBook = (bookId: string) => {
    // In a real app, this would call an API to delete the book
    if (confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      setBooksList(booksList.filter((book) => book.id !== bookId))
      toast({
        title: "Book deleted",
        description: "The book has been deleted successfully.",
      })
    }
  }

  // Get unique categories for filter
  const categories = [...new Set(booksList.map((book) => book.category))]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Book Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-black text-white px-4 py-2 text-sm rounded-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Book
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-sm border border-gray-200 px-4 py-2 rounded-md"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cover
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center">
                    Price
                    {sortField === "price" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("sales")}
                >
                  <div className="flex items-center">
                    Sales
                    {sortField === "sales" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-16 w-12 rounded overflow-hidden">
                      <Image src={book.image || "/placeholder.svg"} alt={book.title} fill className="object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">
                      Published: {new Date(book.publishDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">{book.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">${book.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {book.sales}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditBook(book)} className="text-gray-600 hover:text-gray-900 mr-3">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteBook(book.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No books found matching your criteria.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredBooks.length} of {booksList.length} books
        </div>
      </div>

      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} />}
      {showEditModal && selectedBook && (
        <EditBookModal book={selectedBook} onClose={() => setShowEditModal(false)} onSave={handleSaveBook} />
      )}
    </div>
  )
}

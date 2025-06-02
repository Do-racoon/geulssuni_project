"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter, ShoppingCart } from "lucide-react"
import Image from "next/image"
import AddBookModal from "../modals/add-book-modal"
import EditBookModal from "../modals/edit-book-modal"
import { toast } from "@/hooks/use-toast"
import { getBooks, deleteBook, type Book } from "@/lib/api/books"

export default function BookManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Book>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [booksList, setBooksList] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load books from database
  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      const books = await getBooks()
      setBooksList(books)
    } catch (err) {
      console.error("Error loading books:", err)
      setError("Failed to load books")
      toast({
        title: "Error",
        description: "Failed to load books from database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Filter and sort books
  const filteredBooks = booksList
    .filter((book) => {
      const matchesSearch =
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || book.category === filterCategory
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "published" && book.is_published) ||
        (filterStatus === "draft" && !book.is_published)

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof Book) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleEditBook = (book: Book) => {
    setSelectedBook(book)
    setShowEditModal(true)
  }

  const handleSaveBook = (updatedBook: Book) => {
    setBooksList(booksList.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
    setShowEditModal(false)
    toast({
      title: "Success",
      description: "Book updated successfully",
    })
  }

  const handleAddBook = (newBook: Book) => {
    setBooksList([newBook, ...booksList])
    setShowAddModal(false)
    toast({
      title: "Success",
      description: "Book added successfully",
    })
  }

  const handleDeleteBook = async (bookId: string) => {
    if (confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      try {
        await deleteBook(bookId)
        setBooksList(booksList.filter((book) => book.id !== bookId))
        toast({
          title: "Success",
          description: "Book deleted successfully",
        })
      } catch (err) {
        console.error("Error deleting book:", err)
        toast({
          title: "Error",
          description: "Failed to delete book",
          variant: "destructive",
        })
      }
    }
  }

  // Get unique categories for filter
  const categories = [...new Set(booksList.map((book) => book.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading books...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-lg text-red-600 mb-4">{error}</div>
        <button onClick={loadBooks} className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Book Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-black text-white px-4 py-2 text-sm rounded-md hover:bg-gray-800 transition-colors"
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
              className="flex items-center text-sm border border-gray-200 px-4 py-2 rounded-md hover:bg-gray-50"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("views")}
                >
                  <div className="flex items-center">
                    Views
                    {sortField === "views" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("sales_count")}
                >
                  <div className="flex items-center">
                    Sales
                    {sortField === "sales_count" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("is_published")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "is_published" &&
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
                    <div className="relative h-16 w-12 rounded overflow-hidden bg-gray-100">
                      {book.cover_url ? (
                        <Image
                          src={book.cover_url || "/placeholder.svg"}
                          alt={book.title}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=64&width=48&text=No+Image"
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
                          No Image
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">
                      Created: {book.created_at ? new Date(book.created_at).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {book.category ? (
                      <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">{book.category}</span>
                    ) : (
                      <span className="text-gray-400 text-sm">No category</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{book.views || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      {book.sales_count || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        book.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {book.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditBook(book)}
                      className="text-gray-600 hover:text-gray-900 mr-3 p-1 rounded hover:bg-gray-100"
                      title="Edit book"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      title="Delete book"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBooks.length === 0 && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {searchTerm || filterCategory !== "all" || filterStatus !== "all"
                ? "No books found matching your criteria."
                : "No books available. Add your first book!"}
            </p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredBooks.length} of {booksList.length} books
        </div>
      </div>

      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} onSave={handleAddBook} />}
      {showEditModal && selectedBook && (
        <EditBookModal book={selectedBook} onClose={() => setShowEditModal(false)} onSave={handleSaveBook} />
      )}
    </div>
  )
}

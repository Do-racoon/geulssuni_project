"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Eye, BookOpen, RefreshCw } from "lucide-react"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"
import AddBookModal from "../modals/add-book-modal"
import EditBookModal from "../modals/edit-book-modal"

interface Book {
  id: string
  title: string
  author: string
  description?: string
  cover_url?: string
  views: number
  category?: string
  pages?: number
  purchase_link?: string
  tags?: string[]
  is_published: boolean
  created_at?: string
  updated_at?: string
  sales_count?: number
  external_link?: string
}

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      console.log("Loading books...")

      const response = await fetch("/api/books", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API response error:", response.status, errorText)
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Books loaded:", data?.length || 0)
      setBooks(data || [])
    } catch (error) {
      console.error("Error loading books:", error)
      toast({
        title: "Error",
        description: "Failed to load books. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadBooks()
    setRefreshing(false)
    toast({
      title: "Refreshed",
      description: "Books list has been refreshed.",
    })
  }

  const handleCreate = async (bookData: any) => {
    try {
      console.log("Creating book:", bookData)

      const response = await fetch("/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Create book error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to create book")
      }

      const newBook = await response.json()
      console.log("Book created successfully:", newBook)

      setBooks((prev) => [newBook, ...prev])

      toast({
        title: "Success",
        description: "Book created successfully!",
      })

      setShowAddModal(false)
    } catch (error) {
      console.error("Error creating book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create book",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (book: Book) => {
    console.log("Editing book:", book)
    setEditingBook(book)
  }

  const handleUpdate = async (updatedBook: Book) => {
    try {
      console.log("Updating book:", updatedBook)

      const response = await fetch(`/api/books/${updatedBook.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedBook),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Update book error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to update book")
      }

      const updated = await response.json()
      console.log("Book updated successfully:", updated)

      setBooks((prev) => prev.map((book) => (book.id === updated.id ? updated : book)))

      toast({
        title: "Success",
        description: "Book updated successfully!",
      })

      setEditingBook(null)
    } catch (error) {
      console.error("Error updating book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update book",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return

    try {
      console.log("Deleting book:", id)

      const response = await fetch(`/api/books/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Delete book error:", errorData)
        throw new Error(errorData.details || errorData.error || "Failed to delete book")
      }

      setBooks((prev) => prev.filter((book) => book.id !== id))

      toast({
        title: "Success",
        description: "Book deleted successfully!",
      })
    } catch (error) {
      console.error("Error deleting book:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete book",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Books Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-3">Loading books...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Books Management ({books.length})</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Book
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book) => (
              <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                    {book.cover_url ? (
                      <Image
                        src={book.cover_url || "/placeholder.svg"}
                        alt={book.title}
                        width={64}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <BookOpen className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2 mb-1">{book.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{book.author}</p>
                    {book.category && (
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mb-2">
                        {book.category}
                      </span>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {book.views || 0}
                      </div>
                      {book.pages && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {book.pages}p
                        </div>
                      )}
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          book.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {book.is_published ? "Published" : "Draft"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" onClick={() => handleEdit(book)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(book.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No books found. Create your first book!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showAddModal && <AddBookModal onClose={() => setShowAddModal(false)} onSave={handleCreate} />}

      {editingBook && <EditBookModal book={editingBook} onClose={() => setEditingBook(null)} onSave={handleUpdate} />}
    </>
  )
}

"use client"

import { useState, useEffect } from "react"
import { getBooks, createBook, updateBook, deleteBook, type Book } from "@/lib/api/books"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, Eye, BookOpen } from "lucide-react"
import Image from "next/image"
// import 추가
import { getInstructors } from "@/lib/api/instructors"

export default function BooksManagement() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  // instructors state 추가
  const [instructors, setInstructors] = useState<any[]>([])

  // useEffect에 강사 로드 추가
  useEffect(() => {
    loadBooks()
    loadInstructors()
  }, [])

  const loadBooks = async () => {
    try {
      setLoading(true)
      const data = await getBooks()
      setBooks(data)
    } catch (error) {
      console.error("Error loading books:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadInstructors = async () => {
    try {
      const data = await getInstructors()
      setInstructors(data)
    } catch (error) {
      console.error("Error loading instructors:", error)
    }
  }

  const handleCreate = () => {
    setEditingBook({
      id: "",
      title: "",
      author: "",
      description: "",
      cover_url: "",
      views: 0,
      category: "",
      pages: 0,
      is_published: true,
      purchase_link: "",
      tags: [],
      external_link: "",
      sales_count: 0,
    })
    setIsCreating(true)
  }

  const handleEdit = (book: Book) => {
    setEditingBook(book)
    setIsCreating(false)
  }

  const handleSave = async () => {
    if (!editingBook) return

    try {
      if (isCreating) {
        const { id, views, created_at, updated_at, ...bookData } = editingBook
        await createBook(bookData)
      } else {
        const { id, created_at, updated_at, ...bookData } = editingBook
        await updateBook(editingBook.id, bookData)
      }

      await loadBooks()
      setEditingBook(null)
      setIsCreating(false)
    } catch (error) {
      console.error("Error saving book:", error)
      alert("Failed to save book")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this book?")) return

    try {
      await deleteBook(id)
      await loadBooks()
    } catch (error) {
      console.error("Error deleting book:", error)
      alert("Failed to delete book")
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Books Management</CardTitle>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Book
        </Button>
      </CardHeader>
      <CardContent>
        {editingBook && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">{isCreating ? "Create New Book" : "Edit Book"}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Book title"
                />
              </div>
              {/* editingBook에서 author 필드를 드롭다운으로 변경 */}
              <div>
                <label className="block text-sm font-medium mb-1">Author</label>
                <select
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select an author</option>
                  {instructors.map((instructor) => (
                    <option key={instructor.id} value={instructor.name}>
                      {instructor.name} - {instructor.profession}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={editingBook.category || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, category: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="작법서">작법서</option>
                  <option value="에세이">에세이</option>
                  <option value="소설">소설</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Pages</label>
                <input
                  type="number"
                  value={editingBook.pages || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, pages: Number.parseInt(e.target.value) || 0 })}
                  className="w-full p-2 border rounded-md"
                  placeholder="Number of pages"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Cover URL</label>
                <input
                  type="url"
                  value={editingBook.cover_url || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, cover_url: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Purchase Link</label>
                <input
                  type="url"
                  value={editingBook.purchase_link || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, purchase_link: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com/buy"
                />
              </div>
              {/* External Link 필드 추가 */}
              <div>
                <label className="block text-sm font-medium mb-1">External Link</label>
                <input
                  type="url"
                  value={editingBook.external_link || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, external_link: e.target.value })}
                  className="w-full p-2 border rounded-md"
                  placeholder="https://example.com/external-link"
                />
              </div>
              {/* Sales Count 필드 추가 */}
              <div>
                <label className="block text-sm font-medium mb-1">Sales Count</label>
                <input
                  type="number"
                  value={editingBook.sales_count || 0}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, sales_count: Number.parseInt(e.target.value) || 0 })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="Number of sales"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editingBook.tags ? editingBook.tags.join(", ") : ""}
                  onChange={(e) =>
                    setEditingBook({ ...editingBook, tags: e.target.value.split(",").map((tag) => tag.trim()) })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="design, creativity, visual arts"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={editingBook.description || ""}
                  onChange={(e) => setEditingBook({ ...editingBook, description: e.target.value })}
                  className="w-full p-2 border rounded-md h-24"
                  placeholder="Book description"
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingBook.is_published}
                    onChange={(e) => setEditingBook({ ...editingBook, is_published: e.target.checked })}
                  />
                  <span className="text-sm font-medium">Published</span>
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave}>Save</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingBook(null)
                  setIsCreating(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

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
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {book.category}
                    </span>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {book.views}
                    </div>
                    {book.pages && (
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {book.pages}p
                      </div>
                    )}
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
  )
}

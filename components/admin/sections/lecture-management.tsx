"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter, Calendar, Users, Copy } from "lucide-react"
import Image from "next/image"
import AddLectureModal from "../modals/add-lecture-modal"
import EditLectureModal from "../modals/edit-lecture-modal"
import CopyLectureModal from "../modals/copy-lecture-modal"
import { toast } from "@/hooks/use-toast"
import { getLectures, updateLecture, deleteLecture, createLecture, type Lecture } from "@/lib/api/lectures"

export default function LectureManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof Lecture>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCopyModal, setShowCopyModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLecture, setSelectedLecture] = useState<Lecture | null>(null)
  const [lecturesList, setLecturesList] = useState<Lecture[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLectures()
  }, [])

  useEffect(() => {
    const handleLectureUpdated = () => {
      loadLectures()
    }

    window.addEventListener("lecture-updated", handleLectureUpdated)
    return () => {
      window.removeEventListener("lecture-updated", handleLectureUpdated)
    }
  }, [])

  const loadLectures = async () => {
    try {
      setIsLoading(true)
      const data = await getLectures()
      setLecturesList(data)
    } catch (error) {
      console.error("Error loading lectures:", error)
      toast({
        title: "Error",
        description: "Failed to load lectures",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort lectures
  const filteredLectures = lecturesList
    .filter((lecture) => {
      const matchesSearch =
        lecture.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || lecture.category === filterCategory
      const matchesStatus = filterStatus === "all" || lecture.is_published === (filterStatus === "published")

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof Lecture) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleEditLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture)
    setShowEditModal(true)
  }

  const handleCopyLecture = (lecture: Lecture) => {
    setSelectedLecture(lecture)
    setShowCopyModal(true)
  }

  const handleSaveLecture = async (updatedLecture: any) => {
    try {
      setIsLoading(true)
      await updateLecture(updatedLecture.id, updatedLecture)
      await loadLectures()
      setShowEditModal(false)
      toast({
        title: "Lecture updated",
        description: "The lecture has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating lecture:", error)
      toast({
        title: "Error",
        description: "Failed to update lecture",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteLecture = async (lectureId: string) => {
    if (confirm("Are you sure you want to delete this lecture? This action cannot be undone.")) {
      try {
        setIsLoading(true)
        await deleteLecture(lectureId)
        await loadLectures()
        toast({
          title: "Lecture deleted",
          description: "The lecture has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting lecture:", error)
        toast({
          title: "Error",
          description: "Failed to delete lecture",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddLecture = async (lectureData: any) => {
    try {
      setIsLoading(true)
      await createLecture(lectureData)
      await loadLectures()
      setShowAddModal(false)
      toast({
        title: "Lecture added",
        description: "The lecture has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding lecture:", error)
      toast({
        title: "Error",
        description: "Failed to add lecture",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get unique categories for filter
  const categories = [...new Set(lecturesList.map((lecture) => lecture.category).filter(Boolean))]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading lectures...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold mb-2">Lecture Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-black text-white px-4 py-2 text-sm rounded-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Lecture
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search lectures..."
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
                  Thumbnail
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
                  onClick={() => handleSort("instructor")}
                >
                  <div className="flex items-center">
                    Instructor
                    {sortField === "instructor" &&
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
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center">
                    Created
                    {sortField === "created_at" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
              {filteredLectures.map((lecture) => (
                <tr key={lecture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-12 w-16 rounded overflow-hidden bg-gray-100">
                      {lecture.thumbnail_url ? (
                        <Image
                          src={lecture.thumbnail_url || "/placeholder.svg"}
                          alt={lecture.title || "Lecture thumbnail"}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            // Fallback to placeholder if image fails to load
                            e.currentTarget.src = "/placeholder.svg?height=48&width=64&text=No+Image"
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
                    <div className="font-medium text-gray-900">{lecture.title}</div>
                    {/* duration 표시 제거 */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{lecture.instructor || "TBD"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">
                      {lecture.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {lecture.created_at ? new Date(lecture.created_at).toLocaleDateString() : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {lecture.views || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lecture.is_published ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {lecture.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditLecture(lecture)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                      title="Edit lecture"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleCopyLecture(lecture)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                      title="Copy lecture"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLecture(lecture.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete lecture"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLectures.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No lectures found matching your criteria.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredLectures.length} of {lecturesList.length} lectures
        </div>
      </div>

      {showEditModal && selectedLecture && (
        <EditLectureModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          lecture={selectedLecture}
          onUpdate={handleSaveLecture}
        />
      )}
      {showCopyModal && selectedLecture && (
        <CopyLectureModal
          lecture={selectedLecture}
          onClose={() => setShowCopyModal(false)}
          onSuccess={() => loadLectures()}
        />
      )}
      {showAddModal && (
        <AddLectureModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddLecture} />
      )}
    </div>
  )
}

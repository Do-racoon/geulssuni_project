"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter, Calendar, Users } from "lucide-react"
import Image from "next/image"
import AddLectureModal from "../modals/add-lecture-modal"
import EditLectureModal from "../modals/edit-lecture-modal"
import { toast } from "@/hooks/use-toast"

// Sample data - in a real app, this would come from an API
const lectures = [
  {
    id: "lecture-1",
    title: "Introduction to Minimalist Design",
    instructor: "Thomas Noir",
    category: "Design",
    image: "/images/lecture-1.jpg",
    date: "2023-06-15",
    duration: "2 hours",
    registrations: 24,
    capacity: 30,
    status: "upcoming",
  },
  {
    id: "lecture-2",
    title: "Advanced Typography Techniques",
    instructor: "Alexandra Reeves",
    category: "Typography",
    image: "/images/lecture-2.jpg",
    date: "2023-05-20",
    duration: "3 hours",
    registrations: 18,
    capacity: 20,
    status: "completed",
  },
  {
    id: "lecture-3",
    title: "Composition in Black and White Photography",
    instructor: "Marcus Chen",
    category: "Photography",
    image: "/images/lecture-3.jpg",
    date: "2023-07-10",
    duration: "2.5 hours",
    registrations: 15,
    capacity: 25,
    status: "upcoming",
  },
  {
    id: "lecture-4",
    title: "Editorial Design Masterclass",
    instructor: "Elise Laurent",
    category: "Design",
    image: "/placeholder.svg?height=400&width=600",
    date: "2023-06-25",
    duration: "4 hours",
    registrations: 12,
    capacity: 15,
    status: "upcoming",
  },
  {
    id: "lecture-5",
    title: "Fashion Photography Essentials",
    instructor: "Alexandra Reeves",
    category: "Photography",
    image: "/placeholder.svg?height=400&width=600",
    date: "2023-05-05",
    duration: "3 hours",
    registrations: 20,
    capacity: 20,
    status: "completed",
  },
]

export default function LectureManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof (typeof lectures)[0]>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLecture, setSelectedLecture] = useState<(typeof lectures)[0] | null>(null)
  const [lecturesList, setLecturesList] = useState(lectures)

  // Filter and sort lectures
  const filteredLectures = lecturesList
    .filter((lecture) => {
      const matchesSearch =
        lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lecture.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || lecture.category === filterCategory
      const matchesStatus = filterStatus === "all" || lecture.status === filterStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof (typeof lectures)[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleEditLecture = (lecture: (typeof lectures)[0]) => {
    setSelectedLecture(lecture)
    setShowEditModal(true)
  }

  const handleSaveLecture = (updatedLecture: any) => {
    setLecturesList(lecturesList.map((lecture) => (lecture.id === updatedLecture.id ? updatedLecture : lecture)))
    setShowEditModal(false)
  }

  const handleDeleteLecture = (lectureId: string) => {
    // In a real app, this would call an API to delete the lecture
    if (confirm("Are you sure you want to delete this lecture? This action cannot be undone.")) {
      setLecturesList(lecturesList.filter((lecture) => lecture.id !== lectureId))
      toast({
        title: "Lecture deleted",
        description: "The lecture has been deleted successfully.",
      })
    }
  }

  // Get unique categories for filter
  const categories = [...new Set(lecturesList.map((lecture) => lecture.category))]

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
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                  Image
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
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center">
                    Date
                    {sortField === "date" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registrations
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
              {filteredLectures.map((lecture) => (
                <tr key={lecture.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-12 w-16 rounded overflow-hidden">
                      <Image
                        src={lecture.image || "/placeholder.svg"}
                        alt={lecture.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lecture.title}</div>
                    <div className="text-sm text-gray-500">{lecture.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{lecture.instructor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-800">{lecture.category}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(lecture.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {lecture.registrations}/{lecture.capacity}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lecture.status === "upcoming"
                          ? "bg-green-100 text-green-800"
                          : lecture.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditLecture(lecture)}
                      className="text-gray-600 hover:text-gray-900 mr-3"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteLecture(lecture.id)} className="text-red-600 hover:text-red-900">
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

      {showAddModal && <AddLectureModal onClose={() => setShowAddModal(false)} />}
      {showEditModal && selectedLecture && (
        <EditLectureModal
          lecture={selectedLecture}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveLecture}
        />
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter, Calendar, Users } from "lucide-react"

// Sample data - in a real app, this would come from an API
const assignments = [
  {
    id: "assignment-1",
    title: "Minimalist Poster Design",
    classLevel: "intermediate",
    instructor: "Thomas Noir",
    dueDate: "2023-06-30",
    createdAt: "2023-05-15",
    submissions: 8,
    totalStudents: 24,
    isCompleted: false,
  },
  {
    id: "assignment-2",
    title: "Typography Exploration",
    classLevel: "advanced",
    instructor: "Alexandra Reeves",
    dueDate: "2023-06-15",
    createdAt: "2023-05-10",
    submissions: 12,
    totalStudents: 18,
    isCompleted: false,
  },
  {
    id: "assignment-3",
    title: "Black and White Photography",
    classLevel: "beginner",
    instructor: "Marcus Chen",
    dueDate: "2023-05-25",
    createdAt: "2023-05-05",
    submissions: 15,
    totalStudents: 15,
    isCompleted: true,
  },
  {
    id: "assignment-4",
    title: "Editorial Layout Design",
    classLevel: "intermediate",
    instructor: "Elise Laurent",
    dueDate: "2023-07-10",
    createdAt: "2023-04-28",
    submissions: 5,
    totalStudents: 22,
    isCompleted: false,
  },
  {
    id: "assignment-5",
    title: "Fashion Photography Basics",
    classLevel: "beginner",
    instructor: "Alexandra Reeves",
    dueDate: "2023-05-20",
    createdAt: "2023-04-20",
    submissions: 20,
    totalStudents: 20,
    isCompleted: true,
  },
]

interface AssignmentBoardManagementProps {
  onAddPost: () => void
  onEditPost: (postId: string) => void
}

export default function AssignmentBoardManagement({ onAddPost, onEditPost }: AssignmentBoardManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof (typeof assignments)[0]>("dueDate")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterClassLevel, setFilterClassLevel] = useState<string>("all")
  const [filterCompletion, setFilterCompletion] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort assignments
  const filteredAssignments = assignments
    .filter((assignment) => {
      const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesClassLevel = filterClassLevel === "all" || assignment.classLevel === filterClassLevel
      const matchesCompletion =
        filterCompletion === "all" ||
        (filterCompletion === "completed" ? assignment.isCompleted : !assignment.isCompleted)

      return matchesSearch && matchesClassLevel && matchesCompletion
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof (typeof assignments)[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDeleteAssignment = (assignmentId: string) => {
    // In a real app, this would call an API to delete the assignment
    if (confirm("Are you sure you want to delete this assignment? This action cannot be undone.")) {
      console.log(`Delete assignment with ID: ${assignmentId}`)
    }
  }

  const toggleCompletionStatus = (assignmentId: string) => {
    // In a real app, this would call an API to update the assignment status
    console.log(`Toggle completion status for assignment with ID: ${assignmentId}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search assignments..."
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
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-b border-gray-200">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Class Level</label>
              <select
                value={filterClassLevel}
                onChange={(e) => setFilterClassLevel(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Status</label>
              <select
                value={filterCompletion}
                onChange={(e) => setFilterCompletion(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
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
                  onClick={() => handleSort("classLevel")}
                >
                  <div className="flex items-center">
                    Level
                    {sortField === "classLevel" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
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
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("dueDate")}
                >
                  <div className="flex items-center">
                    Due Date
                    {sortField === "dueDate" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Submissions</th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("isCompleted")}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === "isCompleted" &&
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
              {filteredAssignments.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{item.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 capitalize">{item.classLevel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{item.instructor}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 mr-1" />
                      {item.submissions}/{item.totalStudents}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCompletionStatus(item.id)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        item.isCompleted ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {item.isCompleted ? "Completed" : "Active"}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2 justify-end">
                      <button onClick={() => onEditPost(item.id)} className="text-gray-600 hover:text-gray-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredAssignments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No assignments found matching your criteria.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredAssignments.length} of {assignments.length} assignments
        </div>
      </div>
    </div>
  )
}

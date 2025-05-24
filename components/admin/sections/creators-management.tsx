"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter } from "lucide-react"

// Sample data - in a real app, this would come from an API
const creators = [
  {
    id: "creator-1",
    name: "Thomas Noir",
    specialty: "Photography",
    email: "thomas.noir@example.com",
    phone: "+1 (555) 456-7890",
    projects: 12,
    status: "active",
    joinDate: "2022-03-15",
  },
  {
    id: "creator-2",
    name: "Alexandra Reeves",
    specialty: "Editorial Design",
    email: "alexandra.reeves@example.com",
    phone: "+1 (555) 234-5678",
    projects: 8,
    status: "active",
    joinDate: "2022-05-20",
  },
  {
    id: "creator-3",
    name: "Elise Laurent",
    specialty: "Fashion",
    email: "elise.laurent@example.com",
    phone: "+1 (555) 876-5432",
    projects: 15,
    status: "active",
    joinDate: "2021-11-10",
  },
  {
    id: "creator-4",
    name: "Marcus Chen",
    specialty: "Abstract Art",
    email: "marcus.chen@example.com",
    phone: "+1 (555) 345-6789",
    projects: 7,
    status: "inactive",
    joinDate: "2022-01-05",
  },
  {
    id: "creator-5",
    name: "Sophia Williams",
    specialty: "Typography",
    email: "sophia.williams@example.com",
    phone: "+1 (555) 987-6543",
    projects: 5,
    status: "pending",
    joinDate: "2023-02-18",
  },
]

export default function CreatorsManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof (typeof creators)[0]>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterSpecialty, setFilterSpecialty] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Filter and sort creators
  const filteredCreators = creators
    .filter((creator) => {
      const matchesSearch =
        creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSpecialty = filterSpecialty === "all" || creator.specialty === filterSpecialty
      const matchesStatus = filterStatus === "all" || creator.status === filterStatus

      return matchesSearch && matchesSpecialty && matchesStatus
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: keyof (typeof creators)[0]) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDeleteCreator = (creatorId: string) => {
    // In a real app, this would call an API to delete the creator
    if (confirm("Are you sure you want to delete this creator? This action cannot be undone.")) {
      console.log(`Delete creator with ID: ${creatorId}`)
    }
  }

  // Get unique specialties for filter
  const specialties = [...new Set(creators.map((creator) => creator.specialty))]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-light">Creators Management</h2>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search creators..."
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

            <button className="flex items-center gap-1 px-3 py-2 bg-black text-white hover:bg-gray-800 rounded-md">
              <Plus className="h-4 w-4" />
              <span>New Creator</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("specialty")}
                >
                  <div className="flex items-center">
                    Specialty
                    {sortField === "specialty" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("projects")}
                >
                  <div className="flex items-center">
                    Projects
                    {sortField === "projects" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("joinDate")}
                >
                  <div className="flex items-center">
                    Joined
                    {sortField === "joinDate" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ChevronDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </th>
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
                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCreators.map((creator) => (
                <tr key={creator.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0"></div>
                      <div className="ml-4">
                        <div className="text-sm font-medium">{creator.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{creator.specialty}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{creator.email}</div>
                    <div className="text-sm text-gray-500">{creator.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{creator.projects}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(creator.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        creator.status === "active"
                          ? "bg-green-100 text-green-800"
                          : creator.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {creator.status.charAt(0).toUpperCase() + creator.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-600 hover:text-gray-900 mr-3">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCreator(creator.id)}
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

        {filteredCreators.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No creators found matching your criteria.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredCreators.length} of {creators.length} creators
        </div>
      </div>
    </div>
  )
}

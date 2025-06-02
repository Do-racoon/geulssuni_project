"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Edit, Trash2, ChevronDown, ChevronUp, Filter } from "lucide-react"
import AddFaqModal from "../modals/add-faq-modal"
import EditFaqModal from "../modals/edit-faq-modal"
import { getFAQs, deleteFAQ, type FAQ } from "@/lib/api/faqs"
import { toast } from "@/hooks/use-toast"

export default function FaqManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<"question" | "category" | "id">("id")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null)
  const [faqList, setFaqList] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFAQs()

    // 모달에서 데이터 업데이트 시 새로고침
    const handleFAQUpdate = () => {
      loadFAQs()
    }

    window.addEventListener("faq-updated", handleFAQUpdate)

    return () => {
      window.removeEventListener("faq-updated", handleFAQUpdate)
    }
  }, [])

  const loadFAQs = async () => {
    try {
      setIsLoading(true)
      const data = await getFAQs()
      setFaqList(data)
    } catch (error) {
      console.error("Error loading FAQs:", error)
      toast({
        title: "Error",
        description: "Failed to load FAQs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter and sort FAQs
  const filteredFaqs = faqList
    .filter((faq) => {
      const matchesSearch =
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === "all" || faq.category === filterCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const fieldA = a[sortField]
      const fieldB = b[sortField]

      if (fieldA < fieldB) return sortDirection === "asc" ? -1 : 1
      if (fieldA > fieldB) return sortDirection === "asc" ? 1 : -1
      return 0
    })

  const handleSort = (field: "question" | "category" | "id") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleDeleteFaq = async (faqId: string) => {
    if (confirm("Are you sure you want to delete this FAQ? This action cannot be undone.")) {
      try {
        setIsLoading(true)
        await deleteFAQ(faqId)
        await loadFAQs()
        toast({
          title: "FAQ deleted",
          description: "The FAQ has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting FAQ:", error)
        toast({
          title: "Error",
          description: "Failed to delete FAQ",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEditFaq = (faqId: string) => {
    setEditingFaqId(faqId)
  }

  const handleCloseEditModal = () => {
    setEditingFaqId(null)
  }

  // Get unique categories for filter
  const categories = [...new Set(faqList.map((faq) => faq.category))]

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-light">FAQ Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center bg-black text-white px-4 py-2 text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New FAQ
        </button>
      </div>

      <div className="bg-white rounded-md shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search FAQs..."
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
            <div className="mt-4">
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
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("question")}
                >
                  <div className="flex items-center">
                    Question
                    {sortField === "question" &&
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Answer Preview
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{faq.question}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        faq.category === "payment"
                          ? "bg-green-100 text-green-800"
                          : faq.category === "author"
                            ? "bg-blue-100 text-blue-800"
                            : faq.category === "technical"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-md">{faq.answer}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditFaq(faq.id)} className="text-gray-600 hover:text-gray-900 mr-3">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDeleteFaq(faq.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredFaqs.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No FAQs found matching your criteria.</p>
          </div>
        )}

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
          Showing {filteredFaqs.length} of {faqList.length} FAQs
        </div>
      </div>

      {showAddModal && <AddFaqModal onClose={() => setShowAddModal(false)} />}
      {editingFaqId && <EditFaqModal faqId={editingFaqId} onClose={handleCloseEditModal} />}
    </div>
  )
}

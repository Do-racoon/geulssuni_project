"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Upload, File, FileText, FileIcon as FilePdf, FileArchive } from "lucide-react"
import RichTextEditor from "@/components/RichTextEditor"

interface EditAssignmentModalProps {
  assignmentId: string
  onClose: () => void
  onUpdate: () => void
}

interface Author {
  id: string
  name: string
}

export default function EditAssignmentModal({ assignmentId, onClose, onUpdate }: EditAssignmentModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [richDescription, setRichDescription] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [instructorId, setInstructorId] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [maxSubmissions, setMaxSubmissions] = useState(1)
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([])
  const [authors, setAuthors] = useState<Author[]>([])

  useEffect(() => {
    loadAssignmentData()
    loadAuthors()
  }, [assignmentId])

  const loadAssignmentData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/assignments-table/${assignmentId}`)
      if (!response.ok) throw new Error("Failed to fetch assignment")

      const assignment = await response.json()

      setTitle(assignment.title || "")
      setDescription(assignment.description || "")
      setRichDescription(assignment.description || "")
      setClassLevel(assignment.class_level || "beginner")
      setInstructorId(assignment.instructor_id || "")
      setMaxSubmissions(assignment.max_submissions || 1)
      setPassword(assignment.password || "")

      // 날짜 형식 변환 (YYYY-MM-DD)
      if (assignment.due_date) {
        const date = new Date(assignment.due_date)
        const formattedDate = date.toISOString().split("T")[0]
        setDueDate(formattedDate)
      }
    } catch (error) {
      console.error("Error loading assignment:", error)
      alert("과제 정보를 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const loadAuthors = async () => {
    try {
      const response = await fetch("/api/authors")
      if (!response.ok) throw new Error("Failed to fetch authors")

      const authorsData = await response.json()
      setAuthors(authorsData)
    } catch (error) {
      console.error("Error loading authors:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }))
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const getFileIcon = (file: { name: string; type: string }) => {
    const extension = file.name.split(".").pop()?.toLowerCase()

    switch (extension) {
      case "pdf":
        return <FilePdf className="h-4 w-4 text-red-500" />
      case "txt":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "hwp":
        return <FileArchive className="h-4 w-4 text-green-500" />
      default:
        return <File className="h-4 w-4 text-gray-500" />
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      const updateData = {
        title,
        description: useRichEditor ? richDescription : description,
        class_level: classLevel,
        instructor_id: instructorId,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        max_submissions: maxSubmissions,
        password: password || null,
      }

      const response = await fetch(`/api/assignments-table/${assignmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update assignment")
      }

      alert("과제가 성공적으로 업데이트되었습니다.")
      onUpdate() // 부모 컴포넌트 새로고침
      onClose()
    } catch (error) {
      console.error("Error updating assignment:", error)
      alert("과제 업데이트 중 오류가 발생했습니다.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Assignment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "details" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("details")}
            >
              Assignment Details
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "content" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("content")}
            >
              Assignment Content
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === "files" ? "border-b-2 border-black text-black" : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("files")}
            >
              Files
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === "details" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700 mb-1">
                    Class Level
                  </label>
                  <select
                    id="classLevel"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-1">
                    Instructor
                  </label>
                  <select
                    id="instructor"
                    value={instructorId}
                    onChange={(e) => setInstructorId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  >
                    <option value="">Select Instructor</option>
                    {authors.map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label htmlFor="maxSubmissions" className="block text-sm font-medium text-gray-700 mb-1">
                    Max Submissions
                  </label>
                  <input
                    type="number"
                    id="maxSubmissions"
                    value={maxSubmissions}
                    onChange={(e) => setMaxSubmissions(Number.parseInt(e.target.value) || 1)}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password (Optional)
                </label>
                <input
                  type="text"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Leave empty for no password"
                />
                <p className="mt-1 text-xs text-gray-500">Students will need this password to access the assignment.</p>
              </div>
            </div>
          )}

          {activeTab === "content" && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Assignment Description
                  </label>
                  <div className="flex items-center">
                    <label className="text-sm text-gray-600 mr-2">Use rich editor</label>
                    <input
                      type="checkbox"
                      checked={useRichEditor}
                      onChange={() => setUseRichEditor(!useRichEditor)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                  </div>
                </div>

                {useRichEditor ? (
                  <RichTextEditor initialContent={richDescription} onChange={setRichDescription} />
                ) : (
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    required={!useRichEditor}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Files</label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500 mb-2">Drag and drop files here, or click to select files</p>
                  <p className="text-xs text-gray-400 mb-4">Supports: PDF, TXT, HWP, and other document formats</p>
                  <label className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-800">
                    Select Files
                    <input type="file" multiple onChange={handleFileChange} className="hidden" />
                  </label>
                </div>
              </div>

              {files.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files</h3>
                  <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <li key={index} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          {getFileIcon(file)}
                          <span className="ml-2 text-sm">{file.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

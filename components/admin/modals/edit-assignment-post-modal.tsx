"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Upload, File, FileText, FileIcon as FilePdf, FileArchive } from "lucide-react"
import { getAssignmentPost } from "@/data/board-posts"
import RichTextEditor from "@/components/rich-text-editor"

interface EditAssignmentPostModalProps {
  postId: string
  onClose: () => void
}

export default function EditAssignmentPostModal({ postId, onClose }: EditAssignmentPostModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [richDescription, setRichDescription] = useState("")
  const [classLevel, setClassLevel] = useState("")
  const [instructor, setInstructor] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [instructorMemo, setInstructorMemo] = useState("")
  const [isCompleted, setIsCompleted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [useRichEditor, setUseRichEditor] = useState(true)
  const [activeTab, setActiveTab] = useState("details")
  const [files, setFiles] = useState<{ name: string; size: number; type: string }[]>([])

  useEffect(() => {
    // In a real app, this would fetch the assignment from an API
    const assignment = getAssignmentPost(postId)

    if (assignment) {
      setTitle(assignment.title)
      setDescription(assignment.description)
      setRichDescription(assignment.description) // Assuming we'd store HTML content
      setClassLevel(assignment.classLevel)
      setInstructor(assignment.instructor)
      setDueDate(assignment.dueDate)
      setInstructorMemo(assignment.instructorMemo || "")
      setIsCompleted(assignment.isCompleted)

      // Mock files for demo
      setFiles([
        { name: "assignment-brief.pdf", size: 245000, type: "application/pdf" },
        { name: "reference-material.txt", size: 12400, type: "text/plain" },
        { name: "template.hwp", size: 156000, type: "application/x-hwp" },
      ])
    }

    setLoading(false)
  }, [postId])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, this would call an API to update the assignment
    console.log({
      id: postId,
      title,
      description: useRichEditor ? richDescription : description,
      classLevel,
      instructor,
      dueDate,
      instructorMemo,
      isCompleted,
      files: files.map((f) => f.name),
    })

    onClose()
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
                  <input
                    type="text"
                    id="instructor"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="text"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="e.g., June 30, 2023"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={isCompleted ? "completed" : "pending"}
                    onChange={(e) => setIsCompleted(e.target.value === "completed")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="instructorMemo" className="block text-sm font-medium text-gray-700 mb-1">
                  Instructor Memo (Optional)
                </label>
                <textarea
                  id="instructorMemo"
                  value={instructorMemo}
                  onChange={(e) => setInstructorMemo(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
                <p className="mt-1 text-xs text-gray-500">This memo is only visible to instructors and admins.</p>
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
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-black text-white rounded-md text-sm font-medium hover:bg-gray-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

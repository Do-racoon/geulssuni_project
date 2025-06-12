"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input } from "@nextui-org/react"
import { X, ImageIcon } from "lucide-react"
import Image from "next/image"
import RichTextEditor from "@/components/RichTextEditor"

interface AddLectureModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (lectureData: {
    title: string
    description: string
    contact_url: string
    thumbnail_url?: string
  }) => void
}

const AddLectureModal: React.FC<AddLectureModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contactUrl, setContactUrl] = useState("")
  const [defaultContactUrl, setDefaultContactUrl] = useState("")
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const fetchDefaultContactUrl = async () => {
      try {
        const response = await fetch("/api/settings/default_contact_url")
        if (response.ok) {
          const data = await response.json()
          if (data.value) {
            setDefaultContactUrl(data.value)
            setContactUrl(data.value) // 기본값으로 설정
          }
        }
      } catch (error) {
        console.error("Failed to fetch default contact URL:", error)
      }
    }

    if (isOpen) {
      fetchDefaultContactUrl()
    }
  }, [isOpen])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }

      setThumbnailFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setThumbnailFile(null)
    setThumbnailPreview("")
  }

  const uploadThumbnail = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("folder", "lectures")

    const response = await fetch("/api/upload-photo", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload thumbnail")
    }

    const data = await response.json()
    return data.url
  }

  const handleAdd = async () => {
    if (!title.trim() || !description.trim()) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsUploading(true)

      let thumbnailUrl = ""
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail(thumbnailFile)
      }

      onAdd({
        title,
        description,
        contact_url: contactUrl,
        thumbnail_url: thumbnailUrl,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setContactUrl(defaultContactUrl)
      setThumbnailFile(null)
      setThumbnailPreview("")
      onClose()
    } catch (error) {
      console.error("Error adding lecture:", error)
      alert("Failed to add lecture. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      backdrop="opaque"
      scrollBehavior="inside"
      classNames={{
        backdrop: "bg-black/60",
        base: "bg-white max-h-[90vh]",
        body: "p-0",
        header: "border-b border-gray-200 px-6 py-4",
        footer: "border-t border-gray-200 px-6 py-4",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-semibold text-gray-900">Add New Lecture</h2>
            </ModalHeader>
            <ModalBody>
              <div className="px-6 py-6 space-y-8">
                {/* Title Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter lecture title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "h-12 mt-1",
                    }}
                  />
                </div>

                {/* Description Rich Text Editor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-gray-300 rounded-lg overflow-hidden bg-white mt-1">
                    <RichTextEditor
                      value={description}
                      onChange={setDescription}
                      placeholder="Enter lecture description..."
                      className="min-h-[250px]"
                    />
                  </div>
                </div>

                {/* Contact URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Contact URL</label>
                  <Input
                    type="url"
                    placeholder="Enter contact URL"
                    value={contactUrl}
                    onChange={(e) => setContactUrl(e.target.value)}
                    variant="bordered"
                    size="lg"
                    classNames={{
                      input: "text-base",
                      inputWrapper: "h-12 mt-1",
                    }}
                  />
                  {defaultContactUrl && <p className="text-xs text-gray-500 mt-1">Default: {defaultContactUrl}</p>}
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Thumbnail Image</label>

                  {!thumbnailPreview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors mt-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className="cursor-pointer flex flex-col items-center justify-center py-12 px-4"
                      >
                        <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
                        <span className="text-base font-medium text-gray-700 mb-2">Click to upload thumbnail</span>
                        <span className="text-sm text-gray-500">PNG, JPG up to 5MB</span>
                      </label>
                    </div>
                  ) : (
                    <div className="relative rounded-lg overflow-hidden bg-gray-50 border border-gray-200 mt-1">
                      <div className="relative w-full h-64">
                        <Image
                          src={thumbnailPreview || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <button
                        onClick={handleRemoveImage}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        type="button"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose} disabled={isUploading} className="font-medium">
                Cancel
              </Button>
              <Button
                color="primary"
                onPress={handleAdd}
                disabled={isUploading || !title.trim() || !description.trim()}
                isLoading={isUploading}
                className="font-medium"
              >
                {isUploading ? "Adding..." : "Add Lecture"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default AddLectureModal

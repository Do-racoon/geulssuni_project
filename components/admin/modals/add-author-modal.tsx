"use client"

import type React from "react"

import { useState } from "react"
import { X, Upload, Plus } from "lucide-react"
import Image from "next/image"
import { createAuthor } from "@/lib/api/authors"
import { toast } from "@/hooks/use-toast"

interface AddAuthorModalProps {
  onClose: () => void
}

export default function AddAuthorModal({ onClose }: AddAuthorModalProps) {
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [hashtags, setHashtags] = useState<string[]>(["#minimal"])
  const [newHashtag, setNewHashtag] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [coverImage, setCoverImage] = useState<string | null>(null)
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState("active")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await createAuthor({
        name,
        profession: bio,
        experience: bio,
        number_of_works: 0,
        quote: bio,
        instagram_url: instagramUrl || undefined,
        image_url: profileImage || undefined,
        image_position_x: 50,
        image_position_y: 50,
        likes: 0,
      })

      toast({
        title: "Author created",
        description: "The author has been created successfully.",
      })

      onClose()
      // 부모 컴포넌트에서 데이터 새로고침하도록 이벤트 발생
      window.dispatchEvent(new CustomEvent("author-updated"))
    } catch (error) {
      console.error("Error creating author:", error)
      toast({
        title: "Error",
        description: "Failed to create author",
        variant: "destructive",
      })
    }
  }

  // Simulate image upload
  const handleProfileImageUpload = () => {
    // In a real app, this would open a file picker and upload the image
    // For demo purposes, we'll just set a placeholder image
    setProfileImage("/placeholder.svg?height=200&width=200")
  }

  const handleCoverImageUpload = () => {
    // In a real app, this would open a file picker and upload the image
    // For demo purposes, we'll just set a placeholder image
    setCoverImage("/placeholder.svg?height=400&width=300")
  }

  const addHashtag = () => {
    if (newHashtag && !hashtags.includes(newHashtag)) {
      // Ensure hashtag starts with #
      const formattedHashtag = newHashtag.startsWith("#") ? newHashtag : `#${newHashtag}`
      setHashtags([...hashtags, formattedHashtag])
      setNewHashtag("")
    }
  }

  const removeHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add New Author</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <div className="flex flex-col items-center space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 text-center">Profile Image</p>
                  <div className="h-32 w-32 rounded-full bg-gray-100 relative overflow-hidden flex items-center justify-center">
                    {profileImage ? (
                      <Image src={profileImage || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                    ) : (
                      <div className="text-gray-400 text-xs text-center p-4">No profile image</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleProfileImageUpload}
                    className="mt-2 w-full flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </button>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2 text-center">Cover Image</p>
                  <div className="w-full aspect-[3/4] bg-gray-100 relative rounded-md overflow-hidden flex items-center justify-center">
                    {coverImage ? (
                      <Image src={coverImage || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
                    ) : (
                      <div className="text-gray-400 text-xs text-center p-4">No cover image</div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleCoverImageUpload}
                    className="mt-2 w-full flex items-center justify-center px-3 py-1.5 border border-gray-300 rounded-md text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </button>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1">
                  Instagram URL
                </label>
                <input
                  type="url"
                  id="instagramUrl"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/username"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {hashtags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-sm flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeHashtag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newHashtag}
                    onChange={(e) => setNewHashtag(e.target.value)}
                    placeholder="Add a hashtag (e.g., #minimal)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={addHashtag}
                    className="px-3 py-2 bg-gray-100 border border-gray-300 border-l-0 rounded-r-md hover:bg-gray-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-700">
                    Featured Author
                  </label>
                </div>
              </div>
            </div>
          </div>

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
              Add Author
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

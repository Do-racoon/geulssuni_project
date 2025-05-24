"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X, Upload, Check, AlertCircle } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getWriter, updateWriter, type Writer } from "@/lib/api/writers"
import { uploadFile, createFileRecord } from "@/lib/api/files"

interface EditWriterModalProps {
  writerId: string
  onClose: () => void
  onUpdate: (writer: Writer) => void
}

export default function EditWriterModal({ writerId, onClose, onUpdate }: EditWriterModalProps) {
  const [name, setName] = useState("")
  const [profession, setProfession] = useState("")
  const [experience, setExperience] = useState("")
  const [numberOfWorks, setNumberOfWorks] = useState("")
  const [quote, setQuote] = useState("")
  const [instagramUrl, setInstagramUrl] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 }) // Center by default
  const [isDragging, setIsDragging] = useState(false)
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [imageError, setImageError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchWriter() {
      try {
        setLoading(true)
        const writer = await getWriter(writerId)

        setName(writer.name)
        setProfession(writer.profession)
        setExperience(writer.experience)
        setNumberOfWorks(writer.number_of_works.toString())
        setQuote(writer.quote || "")
        setInstagramUrl(writer.instagram_url || "")
        setProfileImage(writer.image_url || null)
        setImagePosition({
          x: writer.image_position_x || 50,
          y: writer.image_position_y || 50,
        })
        setLikes(writer.likes)
      } catch (error) {
        console.error("Error fetching writer:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWriter()
  }, [writerId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Name is required"
    if (!profession.trim()) newErrors.profession = "Profession is required"
    if (!experience.trim()) newErrors.experience = "Experience is required"
    if (!numberOfWorks) newErrors.numberOfWorks = "Number of works is required"
    if (instagramUrl && !instagramUrl.includes("instagram.com")) {
      newErrors.instagramUrl = "Please enter a valid Instagram URL"
    }
    if (!profileImage) {
      setImageError("Profile image is required")
    } else {
      setImageError(null)
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 && !imageError
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      let imageUrl = profileImage

      // If we have a new image file, upload it to Supabase Storage
      if (imageFile) {
        const timestamp = Date.now()
        const filePath = `writers/${writerId}/${timestamp}_${imageFile.name.replace(/\s+/g, "_")}`

        // Upload to Supabase Storage
        await uploadFile("images", filePath, imageFile)

        // Get the public URL
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/${filePath}`

        // Create a file record
        await createFileRecord({
          filename: imageFile.name,
          file_path: filePath,
          file_type: imageFile.type,
          file_size: imageFile.size,
          entity_type: "writer",
          entity_id: writerId,
          uploaded_by: "admin",
        })
      }

      // Update the writer in Supabase
      const updatedWriter = await updateWriter(writerId, {
        name,
        profession,
        experience,
        number_of_works: Number.parseInt(numberOfWorks, 10) || 0,
        quote: quote || undefined,
        instagram_url: instagramUrl || undefined,
        image_url: imageUrl || undefined,
        image_position_x: imagePosition.x,
        image_position_y: imagePosition.y,
      })

      onUpdate(updatedWriter)
      setIsSubmitting(false)
      onClose()
    } catch (error) {
      console.error("Error updating writer:", error)
      setIsSubmitting(false)
    }
  }

  // Trigger file input click
  const handleImageUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setImageError("Please upload a valid image file (JPEG, PNG, GIF, WEBP)")
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size should be less than 5MB")
      return
    }

    // Store the file for later upload
    setImageFile(file)

    // Create a local URL for preview
    const imageUrl = URL.createObjectURL(file)
    setProfileImage(imageUrl)
    setImageError(null)
  }

  // Handle mouse down on the image
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageContainerRef.current || !profileImage) return
    setIsDragging(true)
    updateImagePosition(e)
  }

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imageContainerRef.current) return
    updateImagePosition(e)
  }

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageContainerRef.current || !profileImage) return
    setIsDragging(true)
    updateImagePositionTouch(e)
  }

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imageContainerRef.current) return
    updateImagePositionTouch(e)
    e.preventDefault() // Prevent scrolling while dragging
  }

  // Handle touch end
  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Update image position based on mouse event
  const updateImagePosition = (e: React.MouseEvent) => {
    if (!imageContainerRef.current) return

    const container = imageContainerRef.current
    const rect = container.getBoundingClientRect()

    // Calculate position as percentage of container
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

    setImagePosition({ x, y })
  }

  // Update image position based on touch event
  const updateImagePositionTouch = (e: React.TouchEvent) => {
    if (!imageContainerRef.current) return

    const touch = e.touches[0]
    const container = imageContainerRef.current
    const rect = container.getBoundingClientRect()

    // Calculate position as percentage of container
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100))

    setImagePosition({ x, y })
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Writer</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Writer Details</TabsTrigger>
              <TabsTrigger value="image">Profile Image</TabsTrigger>
            </TabsList>
          </div>

          <form onSubmit={handleSubmit}>
            <TabsContent value="details" className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">
                      Profession <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="text"
                      id="profession"
                      value={profession}
                      onChange={(e) => setProfession(e.target.value)}
                      className={errors.profession ? "border-red-500" : ""}
                    />
                    {errors.profession && <p className="text-red-500 text-sm mt-1">{errors.profession}</p>}
                  </div>

                  <div>
                    <Label htmlFor="numberOfWorks" className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Works <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      id="numberOfWorks"
                      value={numberOfWorks}
                      onChange={(e) => setNumberOfWorks(e.target.value)}
                      min="0"
                      className={errors.numberOfWorks ? "border-red-500" : ""}
                    />
                    {errors.numberOfWorks && <p className="text-red-500 text-sm mt-1">{errors.numberOfWorks}</p>}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                      Experience <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="experience"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      rows={3}
                      className={errors.experience ? "border-red-500" : ""}
                    />
                    {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                  </div>

                  <div>
                    <Label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-1">
                      Quote
                    </Label>
                    <Input
                      type="text"
                      id="quote"
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="A personal message or motto"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Instagram URL
                    </Label>
                    <Input
                      type="url"
                      id="instagramUrl"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                      placeholder="https://instagram.com/username"
                      className={`pl-10 ${errors.instagramUrl ? "border-red-500" : ""}`}
                    />
                    {errors.instagramUrl && <p className="text-red-500 text-sm mt-1">{errors.instagramUrl}</p>}
                  </div>

                  <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">Likes</Label>
                    <p className="text-gray-700 font-medium">{likes}</p>
                    <p className="text-xs text-gray-500 mt-1">Likes are automatically tracked and cannot be edited</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="p-6 space-y-6">
              <div className="flex flex-col items-center space-y-6">
                <div className="w-full max-w-md">
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image <span className="text-red-500">*</span>
                  </Label>

                  {imageError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{imageError}</AlertDescription>
                    </Alert>
                  )}

                  <div
                    className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors ${
                      imageError ? "border-red-500" : "border-gray-300"
                    }`}
                    onClick={handleImageUploadClick}
                  >
                    {profileImage ? (
                      <div className="relative w-48 h-48 mx-auto">
                        <Image
                          src={profileImage || "/placeholder.svg"}
                          alt="Writer profile"
                          fill
                          className="object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 hover:opacity-100">Change Image</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">Click to upload a profile image</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF, WEBP up to 5MB</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                </div>

                {profileImage && (
                  <div className="w-full max-w-md">
                    <Label className="block text-sm font-medium text-gray-700 mb-2">Image Position</Label>
                    <p className="text-sm text-gray-500 mb-4">
                      Drag the image to change its position in the preview below
                    </p>

                    <div
                      ref={imageContainerRef}
                      className="relative mt-4 p-4 border rounded-lg bg-gray-50 h-[200px] cursor-move"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    >
                      <div
                        className="absolute w-16 h-16"
                        style={{
                          left: `calc(${imagePosition.x}% - 32px)`,
                          top: `calc(${imagePosition.y}% - 32px)`,
                          transition: isDragging ? "none" : "all 0.2s ease",
                        }}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={profileImage || "/placeholder.svg"}
                            alt="Position preview"
                            fill
                            className="object-cover rounded-full"
                          />
                        </div>
                      </div>
                      {!isDragging && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <p className="text-gray-400 text-sm">Click and drag to position</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-2 text-sm text-gray-500 flex justify-between">
                      <span>
                        Position: X: {Math.round(imagePosition.x)}%, Y: {Math.round(imagePosition.y)}%
                      </span>
                      <button
                        type="button"
                        className="text-blue-500 hover:underline"
                        onClick={() => setImagePosition({ x: 50, y: 50 })}
                      >
                        Reset to center
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Saving...</span>
                    <span className="animate-spin">⟳</span>
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </Tabs>
      </div>
    </div>
  )
}

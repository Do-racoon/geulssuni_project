"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, MoreHorizontal, Plus, Search, ExternalLink, Save, X, Calendar, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase/client"

// Define the Portfolio type
interface Portfolio {
  id: string
  title: string
  category: string
  short_description: string
  description: string
  image_url: string
  thumbnail_url: string // 새로 추가
  link: string
  creator: string
  featured: boolean
  status: "published" | "draft"
  created_at: string
  isEditing?: boolean
}

export default function PortfolioManagement() {
  const [portfolioItems, setPortfolioItems] = useState<Portfolio[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Portfolio
    direction: "ascending" | "descending"
  } | null>(null)

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    async function fetchPortfolioItems() {
      try {
        console.log("Fetching portfolio items from database...")

        const { data, error } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false })

        console.log("Portfolio query result:", { data, error })

        if (error) {
          console.error("Supabase error:", error)
          throw error
        }

        if (!data) {
          console.log("No data returned from portfolio table")
          setPortfolioItems([])
          return
        }

        console.log(`Found ${data.length} portfolio items`)

        const formattedData = data.map((item) => ({
          ...item,
          createdDate: item.created_at ? item.created_at.split("T")[0] : new Date().toISOString().split("T")[0],
        }))

        setPortfolioItems(formattedData)
      } catch (error) {
        console.error("Error fetching portfolio items:", error)
        toast({
          title: "Database Error",
          description: `Failed to load portfolio items: ${error.message || "Unknown error"}`,
          variant: "destructive",
        })
        setPortfolioItems([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPortfolioItems()
  }, [])

  // Function to handle sorting
  const requestSort = (key: keyof Portfolio) => {
    let direction: "ascending" | "descending" = "ascending"
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  // Apply sorting to the portfolio items array
  const sortedItems = [...portfolioItems].sort((a, b) => {
    if (!sortConfig) return 0

    const aValue = a[sortConfig.key]
    const bValue = b[sortConfig.key]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "ascending" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })

  // Filter portfolio items based on search query
  const filteredItems = sortedItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.short_description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Function to add a new portfolio item
  const addNewItem = () => {
    const newItem: Portfolio = {
      id: `new-${Date.now()}`,
      title: "",
      category: "",
      short_description: "",
      description: "",
      image_url: "",
      thumbnail_url: "", // 새로 추가
      link: "",
      creator: "Admin",
      featured: false,
      status: "draft",
      created_at: new Date().toISOString(),
      isEditing: true,
    }

    setPortfolioItems([newItem, ...portfolioItems])
  }

  // Function to toggle edit mode for a portfolio item
  const toggleEditMode = (id: string) => {
    setPortfolioItems(portfolioItems.map((item) => (item.id === id ? { ...item, isEditing: !item.isEditing } : item)))
  }

  // Function to update a portfolio item's field
  const updateItemField = (id: string, field: keyof Portfolio, value: any) => {
    setPortfolioItems(portfolioItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  // Function to save portfolio item changes
  const saveItem = async (id: string) => {
    try {
      setIsLoading(true)

      const item = portfolioItems.find((p) => p.id === id)
      if (!item) return

      if (id.startsWith("new-")) {
        // Create new item
        const { data, error } = await supabase
          .from("portfolio")
          .insert({
            title: item.title,
            category: item.category,
            short_description: item.short_description,
            description: item.description || "",
            image_url: item.image_url || "",
            thumbnail_url: item.thumbnail_url || "", // 새로 추가
            link: item.link,
            creator: item.creator || "Admin",
            featured: item.featured,
            status: item.status,
          })
          .select()
          .single()

        if (error) throw error

        // Update local state with new ID
        setPortfolioItems(
          portfolioItems.map((p) =>
            p.id === id ? { ...data, isEditing: false, createdDate: data.created_at.split("T")[0] } : p,
          ),
        )
      } else {
        // Update existing item
        const { error } = await supabase
          .from("portfolio")
          .update({
            title: item.title,
            category: item.category,
            short_description: item.short_description,
            description: item.description,
            image_url: item.image_url,
            thumbnail_url: item.thumbnail_url, // 새로 추가
            link: item.link,
            creator: item.creator,
            featured: item.featured,
            status: item.status,
          })
          .eq("id", id)

        if (error) throw error

        setPortfolioItems(portfolioItems.map((p) => (p.id === id ? { ...p, isEditing: false } : p)))
      }

      toast({
        title: "Portfolio item saved",
        description: "The portfolio item has been successfully saved.",
      })
    } catch (error) {
      console.error("Error saving portfolio item:", error)
      toast({
        title: "Error",
        description: "Failed to save portfolio item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to cancel editing
  const cancelEditing = (id: string) => {
    // If it's a new item (id starts with "new-"), remove it
    if (id.startsWith("new-")) {
      setPortfolioItems(portfolioItems.filter((item) => item.id !== id))
    } else {
      // Otherwise just cancel editing
      setPortfolioItems(portfolioItems.map((item) => (item.id === id ? { ...item, isEditing: false } : item)))
    }
  }

  // Function to confirm portfolio item deletion
  const confirmDelete = (id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Function to delete a portfolio item
  const deleteItem = async () => {
    if (!itemToDelete) return

    try {
      setIsLoading(true)

      const { error } = await supabase.from("portfolio").delete().eq("id", itemToDelete)

      if (error) throw error

      setPortfolioItems(portfolioItems.filter((item) => item.id !== itemToDelete))

      toast({
        title: "Portfolio item deleted",
        description: "The portfolio item has been successfully deleted.",
      })
    } catch (error) {
      console.error("Error deleting portfolio item:", error)
      toast({
        title: "Error",
        description: "Failed to delete portfolio item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy")
    } catch (error) {
      return dateString
    }
  }

  // 이미지 업로드 함수 수정
  const handleImageUpload = async (itemId: string, type: "thumbnail" | "image") => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*"

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        // 파일명을 안전하게 변환하는 함수
        const sanitizeFilename = (filename: string): string => {
          // 파일 확장자 분리
          const lastDotIndex = filename.lastIndexOf(".")
          const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
          const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : ""

          // 한글, 특수문자, 공백을 안전한 문자로 변환
          const safeName = name
            .replace(/[^a-zA-Z0-9\-_.]/g, "_") // 영문, 숫자, 하이픈, 언더스코어, 점만 허용
            .replace(/_+/g, "_") // 연속된 언더스코어를 하나로
            .replace(/^_+|_+$/g, "") // 시작과 끝의 언더스코어 제거

          return (safeName + extension).toLowerCase()
        }

        const sanitizedFilename = sanitizeFilename(file.name)
        const timestamp = Date.now()
        const safePath = `portfolio/${type}/${timestamp}-${sanitizedFilename}`

        const formData = new FormData()
        formData.append("file", file)
        formData.append("bucket", "uploads")
        formData.append("path", safePath)
        formData.append("entity_type", "portfolio")
        formData.append("entity_id", itemId)

        console.log("Uploading file with safe path:", safePath)

        const response = await fetch("/api/upload-file", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success) {
          const fieldName = type === "thumbnail" ? "thumbnail_url" : "image_url"
          updateItemField(itemId, fieldName, result.publicUrl)

          toast({
            title: "Image uploaded",
            description: `${type} image has been uploaded successfully.`,
          })
        } else {
          throw new Error(result.error || "Upload failed")
        }
      } catch (error) {
        console.error("Image upload error:", error)
        toast({
          title: "Upload failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    }

    input.click()
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Portfolio Management</CardTitle>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search portfolio..."
              className="w-[250px] pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={addNewItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Portfolio Item
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => requestSort("title")}>
                  Title
                  {sortConfig?.key === "title" && (
                    <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("category")}>
                  Category
                  {sortConfig?.key === "category" && (
                    <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead>Short Description</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort("created_at")}>
                  Created Date
                  {sortConfig?.key === "created_at" && (
                    <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                  )}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Loading portfolio items...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    {isLoading
                      ? "Loading portfolio items..."
                      : "No portfolio items found. Click 'Add Portfolio Item' to create your first portfolio entry."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.isEditing ? (
                        <Input
                          value={item.title}
                          onChange={(e) => updateItemField(item.id, "title", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.title
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isEditing ? (
                        <Input
                          value={item.category}
                          onChange={(e) => updateItemField(item.id, "category", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <Badge variant="outline">{item.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isEditing ? (
                        <Input
                          value={item.short_description}
                          onChange={(e) => updateItemField(item.id, "short_description", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <span className="line-clamp-2">{item.short_description}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isEditing ? (
                        <Input
                          value={item.link}
                          onChange={(e) => updateItemField(item.id, "link", e.target.value)}
                          className="w-full"
                          placeholder="https://example.com"
                        />
                      ) : item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-500 hover:underline"
                        >
                          <ExternalLink className="mr-1 h-4 w-4" />
                          View
                        </a>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={item.thumbnail_url}
                            onChange={(e) => updateItemField(item.id, "thumbnail_url", e.target.value)}
                            className="w-full"
                            placeholder="Thumbnail URL"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleImageUpload(item.id, "thumbnail")}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Thumbnail
                          </Button>
                        </div>
                      ) : item.thumbnail_url ? (
                        <img
                          src={item.thumbnail_url || "/placeholder.svg"}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <span className="text-xs text-gray-400">No image</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {item.isEditing ? (
                        <Input
                          type="date"
                          value={item.createdDate}
                          onChange={(e) => updateItemField(item.id, "createdDate", e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(item.createdDate)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.isEditing ? (
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" onClick={() => cancelEditing(item.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                          <Button variant="default" size="sm" onClick={() => saveItem(item.id)}>
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => toggleEditMode(item.id)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the portfolio item and remove its data from the
              system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteItem} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

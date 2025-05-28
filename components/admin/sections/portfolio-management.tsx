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
import { Pencil, Trash2, MoreHorizontal, Plus, Search, ExternalLink, Save, X, Calendar } from "lucide-react"
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
        const { data, error } = await supabase.from("portfolio").select("*").order("created_at", { ascending: false })

        if (error) throw error

        const formattedData =
          data?.map((item) => ({
            ...item,
            createdDate: item.created_at.split("T")[0], // Format for date input
          })) || []

        setPortfolioItems(formattedData)
      } catch (error) {
        console.error("Error fetching portfolio items:", error)
        toast({
          title: "Error",
          description: "Failed to load portfolio items.",
          variant: "destructive",
        })
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
                    No portfolio items found.
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

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
import { Pencil, Trash2, MoreHorizontal, Plus, Search, ExternalLink, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { supabase } from "@/lib/supabase/client"
import EditPortfolioModal from "@/components/admin/modals/edit-portfolio-modal"

// Define the Portfolio type
interface Portfolio {
  id: string
  title: string
  category: string
  short_description: string
  thumbnail_url: string
  link: string
  creator: string
  featured: boolean
  status: "published" | "draft"
  created_at: string
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
  const [editingItem, setEditingItem] = useState<Portfolio | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

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
        setPortfolioItems(data)
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
      thumbnail_url: "",
      link: "",
      creator: "Admin",
      featured: false,
      status: "draft",
      created_at: new Date().toISOString(),
    }

    setPortfolioItems([newItem, ...portfolioItems])
  }

  // 편집 모달 열기
  const openEditModal = (item: Portfolio) => {
    setEditingItem(item)
    setIsEditModalOpen(true)
  }

  // 편집 모달 닫기
  const closeEditModal = () => {
    setEditingItem(null)
    setIsEditModalOpen(false)
  }

  // 포트폴리오 아이템 저장
  const handleSavePortfolio = async (updatedPortfolio: Portfolio) => {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from("portfolio")
        .update({
          title: updatedPortfolio.title,
          category: updatedPortfolio.category,
          short_description: updatedPortfolio.short_description,
          thumbnail_url: updatedPortfolio.thumbnail_url,
          link: updatedPortfolio.link,
          creator: updatedPortfolio.creator,
          featured: updatedPortfolio.featured,
          status: updatedPortfolio.status,
        })
        .eq("id", updatedPortfolio.id)

      if (error) throw error

      // 로컬 상태 업데이트
      setPortfolioItems(portfolioItems.map((item) => (item.id === updatedPortfolio.id ? updatedPortfolio : item)))

      toast({
        title: "Portfolio updated",
        description: "The portfolio item has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating portfolio:", error)
      toast({
        title: "Error",
        description: "Failed to update portfolio item. Please try again.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsLoading(false)
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

      // 새로 추가된 아이템(아직 저장되지 않은 아이템)인지 확인
      if (itemToDelete.startsWith("new-")) {
        // 새 아이템은 데이터베이스에 없으므로 로컬 상태에서만 제거
        setPortfolioItems(portfolioItems.filter((item) => item.id !== itemToDelete))

        toast({
          title: "Portfolio item removed",
          description: "The new portfolio item has been removed.",
        })
      } else {
        // 기존 아이템은 데이터베이스에서 삭제
        const { error } = await supabase.from("portfolio").delete().eq("id", itemToDelete)

        if (error) throw error

        setPortfolioItems(portfolioItems.filter((item) => item.id !== itemToDelete))

        toast({
          title: "Portfolio item deleted",
          description: "The portfolio item has been successfully deleted.",
        })
      }
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
                <TableHead>Description</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Thumbnail</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell colSpan={8} className="h-24 text-center">
                    Loading portfolio items...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    {isLoading
                      ? "Loading portfolio items..."
                      : "No portfolio items found. Click 'Add Portfolio Item' to create your first portfolio entry."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <span className="line-clamp-2 text-sm text-gray-600">{item.short_description}</span>
                    </TableCell>
                    <TableCell>
                      {item.link ? (
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
                      {item.thumbnail_url ? (
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
                      <div className="flex items-center gap-2">
                        <Badge variant={item.status === "published" ? "default" : "secondary"}>{item.status}</Badge>
                        {item.featured && <Badge variant="outline">Featured</Badge>}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDate(item.created_at)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(item)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => confirmDelete(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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

      {/* Edit Portfolio Modal */}
      {isEditModalOpen && editingItem && (
        <EditPortfolioModal portfolio={editingItem} onClose={closeEditModal} onSave={handleSavePortfolio} />
      )}
    </Card>
  )
}

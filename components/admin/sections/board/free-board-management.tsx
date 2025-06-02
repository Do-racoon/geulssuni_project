"use client"

import { useState, useEffect } from "react"
import { getBoardPosts, createBoardPost, updateBoardPost, deleteBoardPost, type BoardPost } from "@/lib/api/board-posts"
import { toast } from "@/hooks/use-toast"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"

const FreeBoardManagement = () => {
  const [posts, setPosts] = useState<BoardPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    loadPosts()
  }, [])

  const loadPosts = async () => {
    try {
      setIsLoading(true)
      const data = await getBoardPosts("free")
      setPosts(data)
    } catch (error) {
      console.error("Error loading posts:", error)
      toast({
        title: "Error",
        description: "Failed to load posts",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      try {
        setIsLoading(true)
        await deleteBoardPost(postId)
        await loadPosts()
        toast({
          title: "Post deleted",
          description: "The post has been deleted successfully.",
        })
      } catch (error) {
        console.error("Error deleting post:", error)
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTogglePin = async (postId: string) => {
    try {
      const post = posts.find((p) => p.id === postId)
      if (!post) return

      await updateBoardPost(postId, { is_pinned: !post.is_pinned })
      await loadPosts()
      toast({
        title: post.is_pinned ? "Post unpinned" : "Post pinned",
        description: `The post has been ${post.is_pinned ? "unpinned" : "pinned"}.`,
      })
    } catch (error) {
      console.error("Error toggling pin:", error)
      toast({
        title: "Error",
        description: "Failed to update post",
        variant: "destructive",
      })
    }
  }

  const handleCreatePost = async () => {
    try {
      setIsLoading(true)
      await createBoardPost({
        board_type: "free",
        title,
        content,
        is_pinned: false,
      })
      await loadPosts()
      toast({
        title: "Post created",
        description: "The post has been created successfully.",
      })
      setOpen(false)
      setTitle("")
      setContent("")
    } catch (error) {
      console.error("Error creating post:", error)
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Free Board Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="primary">Create Post</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create Post</DialogTitle>
              <DialogDescription>Create a new post for the free board.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCreatePost} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Post"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableCaption>A list of your recent posts on the free board.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Pinned</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell>
                    <Skeleton />
                  </TableCell>
                  <TableCell className="text-right">
                    <Skeleton />
                  </TableCell>
                </TableRow>
              ))}
            </>
          ) : posts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No posts found.
              </TableCell>
            </TableRow>
          ) : (
            posts.map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">
                  {post.is_pinned ? <Badge variant="secondary">Pinned</Badge> : null}
                </TableCell>
                <TableCell>{post.title}</TableCell>
                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" onClick={() => handleTogglePin(post.id)}>
                    {post.is_pinned ? "Unpin" : "Pin"}
                  </Button>
                  <Button variant="destructive" onClick={() => handleDeletePost(post.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default FreeBoardManagement

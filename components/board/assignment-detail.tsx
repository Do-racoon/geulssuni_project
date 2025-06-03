"use client"

import type React from "react"
import type { Post } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface AssignmentDetailProps {
  post: Post
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ post }) => {
  const router = useRouter()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === "admin"
  const isAuthor = session?.user?.email === post.authorEmail

  return (
    <Card className="w-[700px] shadow-md">
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>{post.createdAt}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <p className="text-lg font-semibold">Description:</p>
          <p>{post.content}</p>
        </div>
        <div>
          <p className="text-lg font-semibold">Author:</p>
          <div className="flex items-center space-x-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <span>{post.author}</span>
            {isAdmin && <Badge variant="secondary">Admin</Badge>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end"></CardFooter>
    </Card>
  )
}

export default AssignmentDetail

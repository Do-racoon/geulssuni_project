import { Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const AssignmentBoard = () => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-end mb-4">
        <Link href="/board/assignment/create">
          <Button
            className="bg-black text-white hover:bg-gray-800 tracking-widest uppercase font-light"
            style={{ borderRadius: "0" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            과제 등록
          </Button>
        </Link>
      </div>

      {/* Placeholder for assignment list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Example Assignment Card - Replace with dynamic data */}
        <div className="bg-white rounded-md shadow-md p-4">
          <h3 className="text-lg font-semibold">Assignment Title</h3>
          <p className="text-gray-600">Due Date: 2024-12-31</p>
          <p className="text-sm">Description: This is a brief description of the assignment.</p>
        </div>
        <div className="bg-white rounded-md shadow-md p-4">
          <h3 className="text-lg font-semibold">Assignment Title 2</h3>
          <p className="text-gray-600">Due Date: 2024-12-25</p>
          <p className="text-sm">Description: Another assignment description.</p>
        </div>
        <div className="bg-white rounded-md shadow-md p-4">
          <h3 className="text-lg font-semibold">Assignment Title 3</h3>
          <p className="text-gray-600">Due Date: 2025-01-15</p>
          <p className="text-sm">Description: A third assignment description.</p>
        </div>
      </div>
    </div>
  )
}

export default AssignmentBoard

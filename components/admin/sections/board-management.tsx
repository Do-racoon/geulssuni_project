"use client"

import { useState, useEffect, useRef } from "react"
import FreeBoardManagement from "./board/free-board-management"
import AssignmentBoardManagement from "./board/assignment-board-management"
import AddFreeBoardPostModal from "../modals/add-free-board-post-modal"
import AddAssignmentPostModal from "../modals/add-assignment-post-modal"
import EditFreeBoardPostModal from "../modals/edit-free-board-post-modal"
import EditAssignmentPostModal from "../modals/edit-assignment-post-modal"

type BoardTab = "free" | "assignment"
type ModalType = "addFree" | "addAssignment" | "editFree" | "editAssignment" | null

export default function BoardManagement() {
  const [activeTab, setActiveTab] = useState<BoardTab>("free")
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  const [editingPostId, setEditingPostId] = useState<string | null>(null)

  const preventUnmountRef = useRef(false)

  const openAddFreePostModal = () => setActiveModal("addFree")
  const openAddAssignmentModal = () => setActiveModal("addAssignment")

  const openEditFreePostModal = (postId: string) => {
    setEditingPostId(postId)
    setActiveModal("editFree")
  }

  const openEditAssignmentModal = (postId: string) => {
    setEditingPostId(postId)
    setActiveModal("editAssignment")
  }

  const closeModal = () => {
    setActiveModal(null)
    setEditingPostId(null)
  }

  const handleTabChange = (tab: BoardTab) => {
    preventUnmountRef.current = true
    setActiveTab(tab)

    setTimeout(() => {
      preventUnmountRef.current = false
    }, 500)
  }

  useEffect(() => {
    return () => {
      // Silent cleanup - no logging
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-light">Board Management</h2>

        <div className="flex space-x-2">
          <button
            onClick={() => handleTabChange("free")}
            className={`px-4 py-2 text-sm transition-colors ${
              activeTab === "free" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
            }`}
            type="button"
          >
            Free Board
          </button>
          <button
            onClick={() => handleTabChange("assignment")}
            className={`px-4 py-2 text-sm transition-colors ${
              activeTab === "assignment" ? "bg-black text-white" : "bg-white text-black border border-gray-200"
            }`}
            type="button"
          >
            Assignment Board
          </button>
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "free" && (
          <FreeBoardManagement onAddPost={openAddFreePostModal} onEditPost={openEditFreePostModal} />
        )}

        {activeTab === "assignment" && (
          <AssignmentBoardManagement onAddPost={openAddAssignmentModal} onEditPost={openEditAssignmentModal} />
        )}
      </div>

      {/* Modals */}
      {activeModal === "addFree" && <AddFreeBoardPostModal onClose={closeModal} />}
      {activeModal === "addAssignment" && <AddAssignmentPostModal onClose={closeModal} />}
      {activeModal === "editFree" && editingPostId && (
        <EditFreeBoardPostModal postId={editingPostId} onClose={closeModal} />
      )}
      {activeModal === "editAssignment" && editingPostId && (
        <EditAssignmentPostModal postId={editingPostId} onClose={closeModal} />
      )}
    </div>
  )
}

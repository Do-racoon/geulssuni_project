"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@nextui-org/react"

interface AddLectureModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (lectureData: {
    title: string
    description: string
    contactUrl: string
  }) => void
}

const AddLectureModal: React.FC<AddLectureModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [contactUrl, setContactUrl] = useState("")
  const [defaultContactUrl, setDefaultContactUrl] = useState("")

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

    fetchDefaultContactUrl()
  }, [])

  const handleAdd = () => {
    onAdd({ title, description, contactUrl })
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Add New Lecture</ModalHeader>
            <ModalBody>
              <Input id="title" type="text" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
              <Textarea
                id="description"
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Input
                id="contactUrl"
                label="Contact URL"
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
                placeholder={defaultContactUrl || "https://open.kakao.com/o/your-link"}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={handleAdd}>
                Add
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default AddLectureModal

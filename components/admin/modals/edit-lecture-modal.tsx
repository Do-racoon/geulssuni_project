"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Textarea,
  Spinner,
} from "@chakra-ui/react"
import { updateLecture } from "@/lib/api/lectures"

interface EditLectureModalProps {
  isOpen: boolean
  onClose: () => void
  lectureId: string | null
  initialTitle: string
  initialDescription: string
  onLectureUpdated: () => void
}

const EditLectureModal: React.FC<EditLectureModalProps> = ({
  isOpen,
  onClose,
  lectureId,
  initialTitle,
  initialDescription,
  onLectureUpdated,
}) => {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle)
      setDescription(initialDescription)
    }
  }, [isOpen, initialTitle, initialDescription])

  const handleUpdateLecture = async () => {
    if (!lectureId) {
      toast({
        title: "Error",
        description: "Lecture ID is missing.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    try {
      await updateLecture(lectureId, { title, description })
      toast({
        title: "Lecture updated.",
        description: "The lecture has been successfully updated.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
      onLectureUpdated()
      onClose()
    } catch (error: any) {
      console.error("Error updating lecture:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update lecture.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Lecture</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl>
            <FormLabel>Title</FormLabel>
            <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Description</FormLabel>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose} isDisabled={isLoading}>
            Cancel
          </Button>
          <Button colorScheme="green" onClick={handleUpdateLecture} isLoading={isLoading}>
            {isLoading ? <Spinner size="sm" /> : "Update"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default EditLectureModal

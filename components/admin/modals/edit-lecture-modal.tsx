"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Input, Textarea } from "@nextui-org/react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { toast } from "react-hot-toast"

interface EditLectureModalProps {
  isOpen: boolean
  onClose: () => void
  lecture: any // Replace 'any' with the actual type of your lecture object
  onUpdate: (updatedLecture: any) => void // Replace 'any' with the actual type of your lecture object
}

const EditLectureModal: React.FC<EditLectureModalProps> = ({ isOpen, onClose, lecture, onUpdate }) => {
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
          }
        }
      } catch (error) {
        console.error("Failed to fetch default contact URL:", error)
      }
    }

    fetchDefaultContactUrl()
  }, [])

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    description: Yup.string().required("Description is required"),
  })

  const formik = useFormik({
    initialValues: {
      title: lecture?.title || "",
      description: lecture?.description || "",
    },
    validationSchema: validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const updatedLecture = {
          ...lecture,
          title: values.title,
          description: values.description,
          contact_url: contactUrl,
        }

        const response = await fetch(`/api/admin/lectures/${lecture.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedLecture),
        })

        if (response.ok) {
          toast.success("Lecture updated successfully!")
          onUpdate(updatedLecture)
          onClose()
        } else {
          toast.error("Failed to update lecture.")
        }
      } catch (error) {
        console.error("Error updating lecture:", error)
        toast.error("Error updating lecture.")
      }
    },
  })

  useEffect(() => {
    if (lecture) {
      formik.setValues({
        title: lecture.title || "",
        description: lecture.description || "",
      })
      setContactUrl(lecture.contact_url || defaultContactUrl)
    }
  }, [lecture, defaultContactUrl])

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Edit Lecture</ModalHeader>
            <ModalBody>
              <Input
                type="text"
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorMessage={formik.touched.title && formik.errors.title}
              />
              <Textarea
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errorMessage={formik.touched.description && formik.errors.description}
              />
              <Input
                id="contactUrl"
                value={contactUrl}
                onChange={(e) => setContactUrl(e.target.value)}
                placeholder={defaultContactUrl || "https://open.kakao.com/o/your-link"}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                Close
              </Button>
              <Button color="primary" onPress={formik.handleSubmit}>
                Update
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default EditLectureModal

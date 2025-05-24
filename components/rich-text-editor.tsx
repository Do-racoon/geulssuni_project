"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  ChevronDown,
  X,
  Type,
  Palette,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface RichTextEditorProps {
  initialContent?: string
  onChange: (content: string) => void
  placeholder?: string
  minHeight?: string
}

export default function RichTextEditor({
  initialContent = "",
  onChange,
  placeholder = "Write your content here...",
  minHeight = "200px",
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [linkUrl, setLinkUrl] = useState("")
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [showImageInput, setShowImageInput] = useState(false)
  const [selectedColor, setSelectedColor] = useState("#000000")
  const [selectedFontSize, setSelectedFontSize] = useState("16px")
  const linkInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Initialize editor with initial content
  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.innerHTML = initialContent
    }
  }, [initialContent])

  // Update parent component when content changes
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  // Format text with document.execCommand
  const formatText = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
    editorRef.current?.focus()
  }

  // Insert link
  const insertLink = () => {
    if (linkUrl) {
      formatText("createLink", linkUrl)
      setLinkUrl("")
      setShowLinkInput(false)
    }
  }

  // Insert image
  const insertImage = () => {
    if (imageUrl) {
      formatText("insertImage", imageUrl)
      setImageUrl("")
      setShowImageInput(false)
    }
  }

  // Change text color
  const changeTextColor = (color: string) => {
    setSelectedColor(color)
    formatText("foreColor", color)
  }

  // Change font size
  const changeFontSize = (size: string) => {
    setSelectedFontSize(size)
    formatText("fontSize", size === "16px" ? "3" : size === "14px" ? "2" : size === "18px" ? "4" : "3")
  }

  // Focus on input when showing link/image input
  useEffect(() => {
    if (showLinkInput && linkInputRef.current) {
      linkInputRef.current.focus()
    }
    if (showImageInput && imageInputRef.current) {
      imageInputRef.current.focus()
    }
  }, [showLinkInput, showImageInput])

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && showLinkInput) {
      e.preventDefault()
      insertLink()
    }
    if (e.key === "Enter" && showImageInput) {
      e.preventDefault()
      insertImage()
    }
  }

  // Color presets
  const colorPresets = [
    "#000000",
    "#5E5E5E",
    "#0369A1",
    "#15803D",
    "#B91C1C",
    "#6D28D9",
    "#C2410C",
    "#0F766E",
    "#4338CA",
    "#7E22CE",
  ]

  // Font size presets
  const fontSizePresets = [
    { label: "Small", value: "14px" },
    { label: "Normal", value: "16px" },
    { label: "Large", value: "18px" },
    { label: "X-Large", value: "24px" },
  ]

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-1">
        {/* Text formatting */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("bold")}
          className="h-8 w-8 p-0"
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("italic")}
          className="h-8 w-8 p-0"
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("underline")}
          className="h-8 w-8 p-0"
          title="Underline"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Text alignment */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("justifyLeft")}
          className="h-8 w-8 p-0"
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("justifyCenter")}
          className="h-8 w-8 p-0"
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("justifyRight")}
          className="h-8 w-8 p-0"
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Lists */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("insertUnorderedList")}
          className="h-8 w-8 p-0"
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => formatText("insertOrderedList")}
          className="h-8 w-8 p-0"
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Font size */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-1" title="Font Size">
              <Type className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              {fontSizePresets.map((size) => (
                <Button
                  key={size.value}
                  type="button"
                  variant={selectedFontSize === size.value ? "default" : "ghost"}
                  size="sm"
                  onClick={() => changeFontSize(size.value)}
                  className="w-full justify-start"
                >
                  {size.label}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Color picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-1" title="Text Color">
              <Palette className="h-4 w-4" />
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedColor }}></div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="grid grid-cols-5 gap-1">
              {colorPresets.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => changeTextColor(color)}
                  className={`h-6 w-6 rounded-full border ${
                    selectedColor === color ? "ring-2 ring-offset-1 ring-black" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                ></button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        {/* Link */}
        {showLinkInput ? (
          <div className="flex items-center">
            <input
              ref={linkInputRef}
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter URL"
              className="text-sm border border-gray-300 rounded-l-md px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Button type="button" variant="default" size="sm" onClick={insertLink} className="h-7 rounded-l-none">
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowLinkInput(false)}
              className="h-7 w-7 p-0 ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowLinkInput(true)}
            className="h-8 w-8 p-0"
            title="Insert Link"
          >
            <Link className="h-4 w-4" />
          </Button>
        )}

        {/* Image */}
        {showImageInput ? (
          <div className="flex items-center">
            <input
              ref={imageInputRef}
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter image URL"
              className="text-sm border border-gray-300 rounded-l-md px-2 py-1 w-40 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Button type="button" variant="default" size="sm" onClick={insertImage} className="h-7 rounded-l-none">
              Add
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowImageInput(false)}
              className="h-7 w-7 p-0 ml-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowImageInput(true)}
            className="h-8 w-8 p-0"
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="p-3 focus:outline-none overflow-auto"
        style={{ minHeight }}
        onInput={handleContentChange}
        onBlur={handleContentChange}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: initialContent }}
      ></div>
    </div>
  )
}

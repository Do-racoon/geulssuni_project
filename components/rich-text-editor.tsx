"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
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
  FileText,
  Palette,
  Type,
  Smile,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react"
import { uploadFile } from "@/lib/upload-client"
import { toast } from "sonner"

interface RichTextEditorProps {
  initialContent?: string
  initialValue?: string // 추가: initialValue도 지원
  onChange?: (content: string) => void
  placeholder?: string
}

const FONT_FAMILIES = [
  { label: "기본", value: "inherit" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "맑은 고딕", value: "'Malgun Gothic', sans-serif" },
  { label: "나눔고딕", value: "'Nanum Gothic', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
]

const FONT_SIZES = [
  { label: "10px", value: "10px" },
  { label: "12px", value: "12px" },
  { label: "14px", value: "14px" },
  { label: "16px", value: "16px" },
  { label: "18px", value: "18px" },
  { label: "20px", value: "20px" },
  { label: "24px", value: "24px" },
  { label: "28px", value: "28px" },
  { label: "32px", value: "32px" },
]

const COLORS = [
  "#000000",
  "#333333",
  "#666666",
  "#999999",
  "#cccccc",
  "#ffffff",
  "#ff0000",
  "#ff6600",
  "#ffcc00",
  "#00ff00",
  "#0066ff",
  "#6600ff",
  "#ff0066",
  "#00ffff",
  "#ff00ff",
  "#ffff00",
  "#800000",
  "#008000",
]

const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😇",
  "🙂",
  "🙃",
  "😉",
  "😌",
  "😍",
  "🥰",
  "😘",
  "😗",
  "😙",
  "😚",
  "😋",
  "😛",
  "😝",
  "😜",
  "🤪",
  "🤨",
  "🧐",
  "🤓",
  "😎",
  "🤩",
  "🥳",
  "😏",
  "😒",
  "😞",
  "😔",
  "😟",
  "😕",
  "🙁",
  "☹️",
  "😣",
  "😖",
  "😫",
  "😩",
  "🥺",
  "😢",
  "😭",
  "😤",
  "😠",
  "😡",
  "🤬",
  "👍",
  "👎",
  "👌",
  "✌️",
  "🤞",
  "🤟",
  "🤘",
  "🤙",
  "👈",
  "👉",
  "👆",
  "🖕",
  "👇",
  "☝️",
  "👋",
  "🤚",
  "🖐",
  "✋",
  "🖖",
  "👏",
  "🙌",
  "🤲",
  "🙏",
  "✍️",
  "💪",
  "🦾",
  "🦿",
  "🦵",
  "🦶",
  "👂",
  "🎉",
  "🎊",
  "🎈",
  "🎁",
  "🏆",
  "🥇",
  "🥈",
  "🥉",
  "⭐",
  "🌟",
  "💯",
  "✅",
  "❌",
  "❗",
  "❓",
  "💡",
  "🔥",
  "💧",
  "⚡",
  "🌈",
]

export default function RichTextEditor({
  initialContent = "",
  initialValue = "",
  onChange,
  placeholder = "내용을 입력하세요...",
}: RichTextEditorProps) {
  // initialValue 또는 initialContent 사용
  const [content, setContent] = useState(initialValue || initialContent)
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showFontSizes, setShowFontSizes] = useState(false)
  const [showFontFamilies, setShowFontFamilies] = useState(false)
  const [showEmojis, setShowEmojis] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null)
  const [currentFontFamily, setCurrentFontFamily] = useState("inherit")
  const [currentFontSize, setCurrentFontSize] = useState("14px")
  const [currentColor, setCurrentColor] = useState("#000000")
  const [savedSelection, setSavedSelection] = useState<Range | null>(null)
  const [isComposing, setIsComposing] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // 초기 내용 설정
  useEffect(() => {
    const initialData = initialValue || initialContent
    if (editorRef.current && initialData && editorRef.current.innerHTML !== initialData) {
      editorRef.current.innerHTML = initialData
      setContent(initialData)
    }
  }, [initialValue, initialContent])

  const handleContentChange = useCallback(() => {
    if (editorRef.current && !isComposing) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      if (onChange) {
        onChange(newContent)
      }
    }
  }, [onChange, isComposing])

  // 한글 입력 처리를 위한 별도 핸들러
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      if (!isComposing) {
        handleContentChange()
      }
    },
    [handleContentChange, isComposing],
  )

  // 선택 영역 저장
  const saveSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      setSavedSelection(selection.getRangeAt(0).cloneRange())
    }
  }

  // 선택 영역 복원
  const restoreSelection = () => {
    if (savedSelection) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedSelection)
      }
    }
  }

  const execCommand = (command: string, value?: string) => {
    restoreSelection()
    document.execCommand(command, false, value)
    if (editorRef.current) {
      editorRef.current.focus()
    }
    handleContentChange()
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지 크기는 5MB 이하여야 합니다.")
      return
    }

    try {
      setUploading(true)
      const result = await uploadFile(file, { folder: "editor-images" })

      if (!result.success || !result.data) {
        throw new Error(result.error || "업로드 실패")
      }

      // 완전한 이미지 스타일로 삽입
      const img = `<img src="${result.data.publicUrl}" alt="업로드된 이미지" style="max-width: 100%; height: auto; margin: 10px 0; cursor: pointer; display: block; resize: both; overflow: hidden;" draggable="false" />`

      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand("insertHTML", false, img)
      }

      handleContentChange()
      toast.success("이미지가 업로드되었습니다.")
    } catch (error) {
      console.error("Image upload error:", error)
      toast.error("이미지 업로드에 실패했습니다.")
    } finally {
      setUploading(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.")
      return
    }

    try {
      setUploading(true)
      const result = await uploadFile(file, { folder: "editor-files" })

      if (!result.success || !result.data) {
        throw new Error(result.error || "업로드 실패")
      }

      const link = `<a href="${result.data.publicUrl}" target="_blank" style="color: #0066cc; text-decoration: underline; margin: 5px 0; display: inline-block;">📎 ${file.name}</a>`

      if (editorRef.current) {
        editorRef.current.focus()
        document.execCommand("insertHTML", false, link)
      }

      handleContentChange()
      toast.success("파일이 업로드되었습니다.")
    } catch (error) {
      console.error("File upload error:", error)
      toast.error("파일 업로드에 실패했습니다.")
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const insertLink = () => {
    const url = prompt("링크 URL을 입력하세요:")
    if (url) {
      const text = window.getSelection()?.toString() || url
      const link = `<a href="${url}" target="_blank" style="color: #0066cc; text-decoration: underline;">${text}</a>`
      restoreSelection()
      document.execCommand("insertHTML", false, link)
      handleContentChange()
    }
  }

  const applyColor = (color: string) => {
    setCurrentColor(color)
    restoreSelection()
    execCommand("foreColor", color)
    setShowColorPicker(false)
  }

  const applyFontSize = (size: string) => {
    setCurrentFontSize(size)
    restoreSelection()

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")
      span.style.fontSize = size

      try {
        range.surroundContents(span)
        selection.removeAllRanges()
        handleContentChange()
      } catch (e) {
        document.execCommand("fontSize", false, "7")
        const fontElements = editorRef.current?.querySelectorAll('font[size="7"]')
        if (fontElements) {
          Array.from(fontElements).forEach((el) => {
            const span = document.createElement("span")
            span.style.fontSize = size
            span.innerHTML = el.innerHTML
            if (el.parentNode) {
              el.parentNode.replaceChild(span, el)
            }
          })
        }
        handleContentChange()
      }
    }
    setShowFontSizes(false)
  }

  const applyFontFamily = (fontFamily: string) => {
    setCurrentFontFamily(fontFamily)
    restoreSelection()

    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0)
      const span = document.createElement("span")
      span.style.fontFamily = fontFamily

      try {
        range.surroundContents(span)
        selection.removeAllRanges()
        handleContentChange()
      } catch (e) {
        document.execCommand("fontName", false, fontFamily)
        handleContentChange()
      }
    }
    setShowFontFamilies(false)
  }

  const insertEmoji = (emoji: string) => {
    if (editorRef.current) {
      editorRef.current.focus()
      document.execCommand("insertText", false, emoji)
    }
    handleContentChange()
    setShowEmojis(false)
  }

  const resizeSelectedImage = (action: "increase" | "decrease") => {
    if (selectedImage) {
      const currentWidth = selectedImage.offsetWidth
      const newWidth = action === "increase" ? currentWidth * 1.2 : currentWidth * 0.8
      selectedImage.style.width = `${Math.max(50, Math.min(800, newWidth))}px`
      selectedImage.style.height = "auto"
      handleContentChange()
    }
  }

  const resetImageSize = () => {
    if (selectedImage) {
      selectedImage.style.width = "auto"
      selectedImage.style.height = "auto"
      handleContentChange()
    }
  }

  // 이미지 클릭 핸들러
  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.tagName === "IMG") {
        setSelectedImage(target as HTMLImageElement)
        // 이미지 선택 표시
        document.querySelectorAll("img").forEach((img) => {
          img.style.border = ""
        })
        ;(target as HTMLImageElement).style.border = "2px solid #0066ff"
      } else {
        setSelectedImage(null)
        document.querySelectorAll("img").forEach((img) => {
          img.style.border = ""
        })
      }
    }

    if (editorRef.current) {
      editorRef.current.addEventListener("click", handleImageClick)
      return () => {
        editorRef.current?.removeEventListener("click", handleImageClick)
      }
    }
  }, [])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest(".dropdown-container")) {
        setShowColorPicker(false)
        setShowFontSizes(false)
        setShowFontFamilies(false)
        setShowEmojis(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleCompositionStart = () => {
    setIsComposing(true)
  }

  const handleCompositionEnd = () => {
    setIsComposing(false)
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML
      onChange(content)
    }
  }

  const insertImageUrl = () => {
    const url = prompt("이미지 URL을 입력하세요:")
    if (url) {
      const img = `<img src="${url}" alt="업로드된 이미지" style="max-width: 100%; height: auto; cursor: pointer; display: block; margin: 10px 0; resize: both; overflow: hidden;" draggable="false">`
      document.execCommand("insertHTML", false, img)
      handleContentChange()
    }
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* 툴바 */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
        {/* 폰트 패밀리 */}
        <div className="relative dropdown-container">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              saveSelection()
            }}
            onClick={() => {
              setShowFontFamilies(!showFontFamilies)
              setShowFontSizes(false)
              setShowColorPicker(false)
              setShowEmojis(false)
            }}
            className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 text-sm min-w-[80px]"
            title="폰트"
          >
            <Type className="h-4 w-4" />
            <span className="text-xs truncate">
              {FONT_FAMILIES.find((f) => f.value === currentFontFamily)?.label || "폰트"}
            </span>
          </button>
          {showFontFamilies && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 min-w-[150px]">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFontFamily(font.value)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 폰트 크기 */}
        <div className="relative dropdown-container">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              saveSelection()
            }}
            onClick={() => {
              setShowFontSizes(!showFontSizes)
              setShowFontFamilies(false)
              setShowColorPicker(false)
              setShowEmojis(false)
            }}
            className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 min-w-[60px]"
            title="폰트 크기"
          >
            <span className="text-xs">{currentFontSize}</span>
          </button>
          {showFontSizes && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20">
              {FONT_SIZES.map((size) => (
                <button
                  key={size.value}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => applyFontSize(size.value)}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                  style={{ fontSize: size.value }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 색상 */}
        <div className="relative dropdown-container">
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault()
              saveSelection()
            }}
            onClick={() => {
              setShowColorPicker(!showColorPicker)
              setShowFontSizes(false)
              setShowFontFamilies(false)
              setShowEmojis(false)
            }}
            className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
            title="텍스트 색상"
          >
            <Palette className="h-4 w-4" />
            <div className="w-4 h-4 border border-gray-300 rounded" style={{ backgroundColor: currentColor }} />
          </button>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 p-2">
              <div className="grid grid-cols-6 gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => applyColor(color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 텍스트 서식 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("bold")}
          className="p-2 hover:bg-gray-200 rounded"
          title="굵게"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("italic")}
          className="p-2 hover:bg-gray-200 rounded"
          title="기울임"
        >
          <Italic className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("underline")}
          className="p-2 hover:bg-gray-200 rounded"
          title="밑줄"
        >
          <Underline className="h-4 w-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 정렬 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyLeft")}
          className="p-2 hover:bg-gray-200 rounded"
          title="왼쪽 정렬"
        >
          <AlignLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyCenter")}
          className="p-2 hover:bg-gray-200 rounded"
          title="가운데 정렬"
        >
          <AlignCenter className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyRight")}
          className="p-2 hover:bg-gray-200 rounded"
          title="오른쪽 정렬"
        >
          <AlignRight className="h-4 w-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 리스트 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("insertUnorderedList")}
          className="p-2 hover:bg-gray-200 rounded"
          title="글머리 기호"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("insertOrderedList")}
          className="p-2 hover:bg-gray-200 rounded"
          title="번호 매기기"
        >
          <ListOrdered className="h-4 w-4" />
        </button>

        <div className="w-px bg-gray-300 mx-1" />

        {/* 링크 */}
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={insertLink}
          className="p-2 hover:bg-gray-200 rounded"
          title="링크 삽입"
        >
          <Link className="h-4 w-4" />
        </button>

        {/* 이미지 업로드 */}
        <button
          type="button"
          onClick={() => imageInputRef.current?.click()}
          className="p-2 hover:bg-gray-200 rounded"
          title="이미지 업로드"
          disabled={uploading}
        >
          <ImageIcon className="h-4 w-4" />
        </button>

        {/* 파일 업로드 */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-200 rounded"
          title="파일 첨부"
          disabled={uploading}
        >
          <FileText className="h-4 w-4" />
        </button>

        {/* 이모티콘 */}
        <div className="relative dropdown-container">
          <button
            type="button"
            onClick={() => {
              setShowEmojis(!showEmojis)
              setShowColorPicker(false)
              setShowFontSizes(false)
              setShowFontFamilies(false)
            }}
            className="p-2 hover:bg-gray-200 rounded"
            title="이모티콘"
          >
            <Smile className="h-4 w-4" />
          </button>
          {showEmojis && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 p-2 w-64 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-10 gap-1">
                {EMOJIS.map((emoji, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="w-6 h-6 text-lg hover:bg-gray-100 rounded flex items-center justify-center"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 이미지 크기 조절 (선택된 이미지가 있을 때만) */}
        {selectedImage && (
          <>
            <div className="w-px bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => resizeSelectedImage("decrease")}
              className="p-2 hover:bg-gray-200 rounded"
              title="이미지 축소"
            >
              <Minus className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => resizeSelectedImage("increase")}
              className="p-2 hover:bg-gray-200 rounded"
              title="이미지 확대"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" onClick={resetImageSize} className="p-2 hover:bg-gray-200 rounded" title="원본 크기">
              <RotateCcw className="h-4 w-4" />
            </button>
          </>
        )}

        {uploading && <div className="flex items-center px-2 text-sm text-gray-600">업로드 중...</div>}
      </div>

      {/* 에디터 */}
      <div
        ref={editorRef}
        contentEditable
        className="min-h-[200px] p-4 focus:outline-none"
        onInput={handleInput}
        onBlur={saveSelection}
        style={{
          lineHeight: "1.6",
          wordBreak: "break-word",
        }}
        data-placeholder={placeholder}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        suppressContentEditableWarning={true}
      />

      {/* 숨겨진 파일 입력 */}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.txt,.hwp"
        onChange={handleFileUpload}
        className="hidden"
      />

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          cursor: pointer;
          transition: border 0.2s ease;
          resize: both;
          overflow: hidden;
        }
        
        [contenteditable] img:hover {
          opacity: 0.8;
        }
      `}</style>
    </div>
  )
}

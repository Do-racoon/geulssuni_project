"use client"

interface EmojiPickerProps {
  onSelect: (emoji: string) => void
}

export default function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const emojis = [
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
    "👍",
    "👎",
    "👏",
    "🙌",
    "👌",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "👋",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "💔",
    "❣️",
    "💕",
  ]

  return (
    <div className="absolute z-10 bg-white border border-gray-200 p-2 shadow-lg grid grid-cols-10 gap-1 w-64">
      {emojis.map((emoji, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onSelect(emoji)}
          className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 rounded"
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

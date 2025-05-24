"use client"

import { useState } from "react"
import { MessageCircle, X } from "lucide-react"

export default function TalkButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Talk Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-6 z-50 bg-black text-white rounded-full p-3 shadow-lg hover:bg-gray-800 transition-all"
        aria-label="Talk to us"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-6 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-w-[calc(100vw-3rem)]">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-medium">Talk to Us</h3>
          </div>
          <div className="p-4 h-80 overflow-y-auto">
            <div className="bg-gray-100 rounded-lg p-3 mb-3 max-w-[80%]">
              <p className="text-sm">Hello! How can we help you today?</p>
              <span className="text-xs text-gray-500 block mt-1">Admin • Just now</span>
            </div>

            <div className="flex justify-end mb-3">
              <div className="bg-black text-white rounded-lg p-3 max-w-[80%]">
                <p className="text-sm">I have a question about your services.</p>
                <span className="text-xs text-gray-300 block mt-1">You • Just now</span>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
              <button className="bg-black text-white px-4 py-2 rounded-r-lg hover:bg-gray-800">Send</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/use-chat"
import RoleSelector from "./role-selector"
import { FeedbackSection } from "./feedback-section"

type Role = "sender" | "receiver"

export default function ChatInterface() {
  const [role, setRole] = useState<Role | null>(null)
  const { messages, sendMessage, isWaitingForResponse, isConnected } = useChat(role as Role)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Check for saved role on component mount
  useEffect(() => {
    const savedRole = localStorage.getItem("chatRole") as Role | null
    if (savedRole) {
      setRole(savedRole)
    }
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isWaitingForResponse) {
      sendMessage(input)
      setInput("")
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // If role is not selected, show role selector
  if (!role) {
    return <RoleSelector onRoleSelect={setRole} />
  }

  return (
    <div className="flex flex-col w-full max-w-3xl h-screen mx-auto bg-background">
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <Bot className="w-6 h-6 mr-2 text-primary" />
          <h1 className="text-xl font-semibold">
            <img src="logo.png" width="100px" alt="logo"></img>
          </h1>
        </div>
        <div className="flex items-center">
          <span
            className={`px-2 py-1 text-xs rounded-full ${isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-2"
            onClick={() => {
              localStorage.removeItem("chatRole")
              setRole(null)
            }}
          >
            Switch Role
          </Button>
        </div>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="w-12 h-12 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {role === "sender" ? "Send a message to start chatting with..." : "Waiting for messages to respond to"}
            </h2>
            <p className="max-w-md">
              {role === "sender"
                ? <img src="logolight.png" alt="logo" width="300px"></img>
                : "You'll see messages from others and can respond as if you were ChatGPT."}
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Determine if this message is from the current user
            const isFromCurrentUser =
              (role === "sender" && message.role === "user") || (role === "receiver" && message.role === "assistant")

            return (
              <div key={index} className="space-y-2">
                <div className={cn("flex items-start gap-4 max-w-full", isFromCurrentUser ? "justify-end" : "")}>
                  {message.role !== "user" && (
                    <Avatar className="w-8 h-8 border">
                      <Bot className="w-5 h-5" />
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2 max-w-[80%]",
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="w-8 h-8 border">
                      <User className="w-5 h-5" />
                    </Avatar>
                  )}
                </div>
                {/* Show feedback only for assistant messages when in receiver role */}
                {role === "receiver" && message.role === "assistant" && message.feedback && (
                  <FeedbackSection feedback={message.feedback} />
                )}
              </div>
            )
          })
        )}
        {isWaitingForResponse && (
          <div className="flex items-start gap-4">
            <Avatar className="w-8 h-8 border">
              <Bot className="w-5 h-5" />
            </Avatar>
            <div className="bg-muted rounded-lg px-4 py-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area - only show for sender or when receiver needs to respond */}
      <div className="border-t p-4">
        {(role === "sender" ||
          (role === "receiver" && messages.length > 0 && messages[messages.length - 1].role === "user")) && (
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="relative flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={role === "sender" ? "Message ChatGPT..." : "Respond as ChatGPT..."}
                className="min-h-[60px] resize-none pr-12 py-3 rounded-lg"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
              <Button type="button" size="icon" variant="ghost" className="absolute right-2 bottom-2 h-8 w-8">
                <Paperclip className="h-5 w-5" />
                <span className="sr-only">Attach file</span>
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={!input.trim() || isWaitingForResponse}
            >
              <Send className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        )}
        <p className="text-xs text-center mt-2 text-muted-foreground">
          {role === "sender" ? "You are sending messages as a user" : "You are responding as ChatGPT"}
        </p>
      </div>
    </div>
  )
}


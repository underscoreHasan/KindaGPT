"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useChat } from "@/hooks/use-chat"

export default function ChatInterface() {
  const { messages, sendMessage, isWaitingForResponse, registerUser } = useChat()
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [username, setUsername] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim() && !isWaitingForResponse) {
      sendMessage(input, username)
      setInput("")
    }
  }

  const handleRegister = () => {
    if (username) {
      registerUser(username);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages]) //Corrected dependency

  return (
    <div className="flex flex-col w-full max-w-3xl h-screen mx-auto bg-background">
      {/* Chat header */}
      <div className="flex items-center p-4 border-b">
        <Bot className="w-6 h-6 mr-2 text-primary" />
        <h1 className="text-xl font-semibold">ChatGPT</h1>
      </div>

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Bot className="w-12 h-12 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">How can I help you today?</h2>
            <input
              type="text"
              placeholder="Enter your username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
            <p className="max-w-md">
              Send a message to start chatting to kindaGPT.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex items-start gap-4 max-w-full", message.role === "user" ? "justify-end" : "")}
            >
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
          ))
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

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message kindaGPT..."
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
      </div>
    </div>
  )
}


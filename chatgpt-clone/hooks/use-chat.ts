"use client"

import { useState, useEffect } from "react"
import { io, type Socket } from "socket.io-client"
import { getFeedback } from "./use-openai"

type Role = "sender" | "receiver"

type Message = {
  role: "user" | "assistant"
  content: string
  feedback?: string
  previousQuestion?: string
}

export function useChat(role?: Role) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!role) return

    const newSocket = io("206.87.155.8:5000")

    newSocket.on("connect", () => {
      console.log("Connected to socket server")
      setIsConnected(true)
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [role])

  useEffect(() => {
    if (!socket || !role) return

    socket.on("message", async (message: Message) => {
      if ((role === "sender" && message.role === "assistant") || (role === "receiver" && message.role === "user")) {
        // If this is an assistant message and we're the receiver,
        // get feedback for the response
        if (role === "receiver" && message.role === "user") {
          setMessages((prev) => [...prev, message])
        } else {
          // For sender receiving assistant messages
          setMessages((prev) => [...prev, message])
        }
      }

      // If sender gets assistant message OR receiver gets user message, stop waiting
      if ((role === "sender" && message.role === "assistant") || (role === "receiver" && message.role === "user")) {
        setIsWaitingForResponse(false)
      }
    })

    return () => {
      socket.off("message")
    }
  }, [socket, role])

  const sendMessage = async (content: string) => {
    if (!socket || !isConnected || !role) return

    const messageRole = role === "sender" ? "user" : "assistant"

    // Get the previous question if this is an assistant response
    const previousQuestion =
      role === "receiver" && messages.length > 0 ? messages[messages.length - 1].content : undefined

    const message: Message = {
      role: messageRole,
      content,
      previousQuestion,
    }

    // If sending as assistant, get feedback
    if (role === "receiver" && previousQuestion) {
      const feedback = await getFeedback(previousQuestion, content)
      message.feedback = feedback
    }

    // Add message locally
    setMessages((prev) => [...prev, message])

    if (role === "sender") {
      setIsWaitingForResponse(true)
    }

    socket.emit("message", message)
  }

  return {
    messages,
    sendMessage,
    isWaitingForResponse,
    isConnected,
  }
}


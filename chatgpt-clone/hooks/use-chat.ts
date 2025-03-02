"use client"

import { useState, useEffect } from "react"
import { io, type Socket } from "socket.io-client"

type Role = "sender" | "receiver"

type Message = {
  role: "user" | "assistant"
  content: string
}

export function useChat(role?: Role) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!role) return

    // Connect to your real Socket.io server
    const newSocket = io("206.87.155.8:5000")

    newSocket.on("connect", () => {
      console.log("Connected to socket server")
      setIsConnected(true)

      // Identify this client's role to the server
      //newSocket.emit("set-role", role)
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

    //socket.on("message", (message) => {console.log(message.content)})

    // Listen for incoming messages
    socket.on("message", (message: { role: "user" | "assistant"; content: string }) => {
      // // Only add messages that make sense for this role
      // // Sender should see their own messages and assistant responses
      // // Receiver should see user messages they need to respond to and their own responses

      // if (
      //   (role === "sender" && (message.role === "user" || message.role === "assistant")) ||
      //   (role === "receiver" && (message.role === "user" || message.role === "assistant"))
      // ) {
      //   setMessages((prev) => [...prev, message])
      // }

      // // If we're the sender and received an assistant message, or
      // // if we're the receiver and received a user message,
      // // we're no longer waiting for a response
      // if ((role === "sender" && message.role === "assistant") || (role === "receiver" && message.role === "user")) {
      //   setIsWaitingForResponse(false)
      // }
      if (
        (role === "sender" && message.role === "assistant") || 
        (role === "receiver" && message.role === "user")
      ) {
        setMessages((prev) => [...prev, message])
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

  const sendMessage = (content: string) => {
    if (!socket || !isConnected || !role) return

    const messageRole = role === "sender" ? "user" : "assistant"
    const message = { role: messageRole, content }

    // Add only sender's own messages locally
    setMessages((prev) => [...prev, message])

    if (role === "sender") setIsWaitingForResponse(true)

    socket.emit("message", message)
  }

  return {
    messages,
    sendMessage,
    isWaitingForResponse,
    isConnected,
  }
}


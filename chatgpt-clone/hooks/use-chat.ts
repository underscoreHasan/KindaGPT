"use client"

import { useState, useEffect } from "react"
import type { Socket } from "socket.io-client"
import io from "socket.io-client"

type Message = {
  role: "user" | "assistant"
  content: string
}

export function useChat() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // For demo purposes, we'll use a mock socket
    // In a real app, you would connect to your server
    const newSocket = io("128.189.241.176:5000");

    // Mock socket for demonstration
    const mockSocket = {
      on: (event: string, callback: Function) => {
        if (event === "connect") {
          setTimeout(() => {
            setIsConnected(true)
            callback()
          }, 1000)
        }
        if (event === "chat message") {
          // Store the callback to simulate receiving messages
          ;(mockSocket as any).messageCallback = callback
        }
      },
      emit: (event: string, message: string) => {
        if (event === "chat message") {
          // Simulate friend typing and responding after a delay
          setTimeout(
            () => {
              const response = `I received your message: "${message}"\n\nThis is a simulated response from your friend. In a real implementation, this would come from your friend's computer.`
              ;(mockSocket as any).messageCallback(response)
            },
            2000 + Math.random() * 2000,
          ) // Random delay between 2-4 seconds
        }
      },
      disconnect: () => {
        setIsConnected(false)
      },
    } as unknown as Socket

    setSocket(newSocket as Socket)

    // Connect to the mock socket
    mockSocket.on("connect", () => {
      console.log("Connected to mock socket")
    })

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (!socket) return

    // Listen for incoming messages
    socket.on("message", (message: string) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message }])
      setIsWaitingForResponse(false)
    })

    return () => {
      socket.off("chat message")
    }
  }, [socket])

  const sendMessage = (content: string) => {
    if (!socket || !isConnected) return

    // Add user message to the chat
    setMessages((prev) => [...prev, { role: "user", content }])
    setIsWaitingForResponse(true)

    // Send message to server (which would forward to friend)
    socket.send(content)
  }

  return {
    messages,
    sendMessage,
    isWaitingForResponse,
    isConnected,
  }
}


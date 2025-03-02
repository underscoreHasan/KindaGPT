"use client"

import { useState } from "react"
import { Bot, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

type Role = "sender" | "receiver"

export default function RoleSelector({ onRoleSelect }: { onRoleSelect: (role: Role) => void }) {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem("chatRole", selectedRole)
      onRoleSelect(selectedRole)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Choose Your Role</CardTitle>
          <CardDescription>Select whether you want to send messages or receive them</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedRole === "sender" ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-32 gap-2"
              onClick={() => setSelectedRole("sender")}
            >
              <User className="h-8 w-8" />
              <div className="text-center">
                <div className="font-medium">Sender</div>
                <div className="text-xs text-muted-foreground">Send messages as yourself</div>
              </div>
            </Button>
            <Button
              variant={selectedRole === "receiver" ? "default" : "outline"}
              className="flex flex-col items-center justify-center h-32 gap-2"
              onClick={() => setSelectedRole("receiver")}
            >
              <Bot className="h-8 w-8" />
              <div className="text-center">
                <div className="font-medium">Receiver</div>
                <div className="text-xs text-muted-foreground">Respond as ChatGPT</div>
              </div>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={!selectedRole} onClick={handleContinue}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


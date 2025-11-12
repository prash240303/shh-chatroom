"use client"

import type React from "react"

import { useState } from "react"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocation, useNavigate } from "react-router-dom"
import { Logo } from "../../public/Logo"

const BASE_URL = import.meta.env.VITE_BASE_URL

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)

  function getCookie(name: string) {
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`))
    return match ? match[2] : null
  }

  async function handleFormSubmission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`${BASE_URL}login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data?.detail || "Invalid email or password. Please try again.")
      } else {
        // store the email  for chat purposes
        localStorage.setItem("userEmailKey", formData.email)

        const token = data.token
        document.cookie = `token=${token}; path=/`
        console.log("token ", token)
        toast.success("Login successful!")

        const roomId = searchParams.get("room_id")
        console.log("checking if room id is present", roomId)
        if (roomId) {
          try {
            await fetch(`${BASE_URL}room/join/`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ room_id: roomId }),
            })
            toast.success("Joined the room successfully!")
          } catch (error) {
            console.error("Error joining room:", error)
            toast.error("Failed to join the room.")
          }
        }
        navigate("/")
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again later.")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-primary/10 via-background to-background border-r border-border">
          <div />

          <div className="space-y-6">
            <div className="inline-flex items-center p-2 justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
              <Logo />
            </div>

            <div className="space-y-4 max-w-sm">
              <h2 className="text-3xl font-bold leading-tight text-foreground">Welcome back to your private chat</h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                Connect securely, chat privately, and stay in control of your conversations.
              </p>
            </div>

              {/* Feature highlights */}
              <div className="space-y-4 mt-8 pt-8 border-t border-border">
              {[
                { icon: "🔒", text: "End-to-end encrypted conversations" },
                { icon: "👥", text: "Invite anyone to private chats" },
                { icon: "⚡", text: "Lightning-fast messaging" },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="text-xl">{feature.icon}</div>
                  <span className="text-sm text-muted-foreground">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">© 2025 Private Chat. All rights reserved.</div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 relative">
          <a
            href="/register"
            className="absolute right-6 gap-2 flex top-6 text-sm  text-muted-foreground hover:text-foreground transition-colors"
          >
            Don't have an account? <span className="text-primary font-medium">Register</span>
          </a>

          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Login</h1>
              <p className="text-base text-muted-foreground">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleFormSubmission} className="space-y-6">
              <div className="space-y-5">
                <div className="flex flex-col space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-card border border-border text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="bg-card border border-border text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 bg-background text-muted-foreground">or</span>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <a href="/register" className="font-medium text-primary hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

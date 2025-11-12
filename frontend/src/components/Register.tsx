"use client"

import type React from "react"

import toast from "react-hot-toast"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNavigate } from "react-router-dom"
import { Mail, Lock, User, ArrowRight } from "lucide-react"
import { Logo } from "../../public/Logo"

export default function Register() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const BASE_URL = "http://127.0.0.1:8000/"

  async function handleFormSubmission(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    console.log("data collected ", formData)
    try {
      const response = await fetch(`${BASE_URL}register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        toast.error("Email already registered")
      } else {
        toast.success("Registration successful!")
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
      {/* Main Content */}
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-start p-12 bg-gradient-to-br from-primary/10 via-background to-background border-r border-border">
          {/* Background accent */}

          <div className="z-10">
            <div className="inline-flex items-center p-2 justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
              <Logo />
            </div>

            <div className="space-y-4 pt-4 max-w-72 text-left">
              <h2 className="text-3xl font-bold leading-tight text-foreground">Join our community</h2>
              <p className="text-muted-foreground">
                Create your account to start chatting securely with friends and colleagues
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
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
          <a
            href="/login"
            className="text-sm absolute right-6 top-6 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
          >
            Already have an account? <span className="text-primary font-medium">Login</span>
          </a>

          <div className="w-full max-w-sm space-y-8">
            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Create account</h1>
              <p className="text-sm text-muted-foreground">Sign up to get started with our secure chat platform</p>
            </div>

            <form onSubmit={handleFormSubmission} className="space-y-5">
              {/* Full Name Input */}
              <div className="space-y-2">
                <label htmlFor="full_name" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name
                </label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={
                    formData.first_name || formData.last_name
                      ? `${formData.first_name} ${formData.last_name}`.trim()
                      : ""
                  }
                  onChange={(e) => {
                    const [firstname, ...lastnameParts] = e.target.value.split(" ")
                    const lastname = lastnameParts.join(" ")
                    setFormData({
                      ...formData,
                      first_name: firstname || "",
                      last_name: lastname || "",
                    })
                  }}
                  className="w-full bg-input border border-border text-foreground placeholder:text-muted-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-input border border-border text-foreground placeholder:text-muted-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-input border border-border text-foreground placeholder:text-muted-foreground rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-medium py-2 rounded-md hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>

            {/* Divider and login link */}
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="text-primary hover:underline font-medium">
                Log in here
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/mode-toggle"
import { GuestGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, AlertCircle, Mail } from "lucide-react"

function ForgotPasswordPageContent() {
  const { resetPassword, loading, error } = useAuth()
  
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Basic validation
    if (!email.trim()) {
      setFormError("Please enter your email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setFormError("Please enter a valid email address")
      return
    }

    try {
      const result = await resetPassword(email.trim())
      
      if (result.success) {
        setIsSubmitted(true)
      } else {
        setFormError(result.error || "Failed to send reset email. Please try again.")
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.")
      console.error("Password reset error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Forgot Password
          </CardTitle>
          <CardDescription className="text-center">
            {isSubmitted 
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you a link to reset your password"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              {(formError || error) && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formError || error}
                  </AlertDescription>
                </Alert>
              )}
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading || !email.trim()}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-3">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Reset Link Sent!
                </h3>
                <p className="text-sm text-muted-foreground">
                  If an account with <strong>{email}</strong> exists, you will receive password reset instructions within a few minutes.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder.
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail("")
                    setFormError(null)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Try Another Email
                </Button>
                <Link href="/signin">
                  <Button variant="default" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
          
          {!isSubmitted && (
            <div className="mt-6 text-center">
              <Link 
                href="/signin" 
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <GuestGuard>
      <ForgotPasswordPageContent />
    </GuestGuard>
  )
}
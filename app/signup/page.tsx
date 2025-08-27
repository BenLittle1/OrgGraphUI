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
import { AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react"

function SignUpPageContent() {
  const { signUp, loading, error } = useAuth()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError("Please fill in all required fields")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setFormError("Password must be at least 8 characters long")
      return
    }

    try {
      const result = await signUp(formData.email.trim(), formData.password, formData.name.trim())
      
      if (result.success) {
        setIsSuccess(true)
        // Clear form data
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: ""
        })
      } else {
        setFormError(result.error || "Sign up failed. Please try again.")
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.")
      console.error("Sign up error:", err)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center">
            WarpDrive
          </CardTitle>
          <CardDescription className="text-center">
            {isSuccess 
              ? "Check your email to verify your account"
              : "Create your account to access your organizations"
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Account Created Successfully!
                </h3>
                <p className="text-sm text-muted-foreground">
                  We've sent a verification email to <strong>{formData.email}</strong>.
                  Please click the link in the email to verify your account.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
              </div>
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={() => setIsSuccess(false)}
                  variant="outline"
                  className="w-full"
                >
                  Sign Up Another Account
                </Button>
                <Link href="/signin">
                  <Button variant="default" className="w-full">
                    Go to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 8 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
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
              disabled={loading || !formData.name.trim() || !formData.email.trim() || !formData.password.trim() || !formData.confirmPassword.trim()}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </Button>
          </form>
          )}
          
          {!isSuccess && (
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link 
                  href="/signin" 
                  className="text-primary hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <GuestGuard>
      <SignUpPageContent />
    </GuestGuard>
  )
}
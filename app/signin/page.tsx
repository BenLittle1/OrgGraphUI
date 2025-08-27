"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/mode-toggle"
import { GuestGuard } from "@/components/auth-guard"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Eye, EyeOff } from "lucide-react"

function SignInPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, loading, error } = useAuth()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    // Basic validation
    if (!email.trim() || !password.trim()) {
      setFormError("Please enter both email and password")
      return
    }

    try {
      const result = await signIn(email.trim(), password)
      
      if (result.success) {
        // Get redirect destination from URL params or default to organizations
        const redirectTo = searchParams.get('redirectTo') || '/organizations'
        router.push(redirectTo)
      } else {
        setFormError(result.error || "Sign in failed. Please try again.")
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.")
      console.error("Sign in error:", err)
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
            Sign in to access your organizations
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
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
              disabled={loading || !email.trim() || !password.trim()}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link 
                href="/signup" 
                className="text-primary hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
          
        </CardContent>
      </Card>
    </div>
  )
}

export default function SignInPage() {
  return (
    <GuestGuard>
      <SignInPageContent />
    </GuestGuard>
  )
}
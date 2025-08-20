"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Settings, User, Bell, Palette, Shield, Database, Zap } from "lucide-react"

export default function SettingsPage() {
  const settingsSections = [
    {
      id: "profile",
      title: "Profile Settings",
      description: "Manage your personal information and preferences",
      icon: User,
      status: "Coming Soon"
    },
    {
      id: "notifications",
      title: "Notifications",
      description: "Configure email and push notification preferences",
      icon: Bell,
      status: "Coming Soon"
    },
    {
      id: "appearance",
      title: "Appearance",
      description: "Customize theme, colors, and display options",
      icon: Palette,
      status: "Coming Soon"
    },
    {
      id: "security",
      title: "Security & Privacy",
      description: "Manage passwords, two-factor authentication, and privacy settings",
      icon: Shield,
      status: "Coming Soon"
    },
    {
      id: "data",
      title: "Data Management",
      description: "Import, export, and backup your task data",
      icon: Database,
      status: "Coming Soon"
    },
    {
      id: "integrations",
      title: "Integrations",
      description: "Connect with external tools and services",
      icon: Zap,
      status: "Coming Soon"
    }
  ]

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-4 py-6">
            {/* Page Header */}
            <div className="px-4 lg:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                  <p className="text-muted-foreground mt-2">
                    Manage your account settings and preferences
                  </p>
                </div>
              </div>
            </div>

            {/* Settings Cards */}
            <div className="px-4 lg:px-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {settingsSections.map((section) => (
                  <Card key={section.id} className="transition-all hover:shadow-md cursor-pointer opacity-75 hover:opacity-100">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <section.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base">
                              {section.title}
                            </h3>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {section.status}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {section.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Coming Soon Notice */}
              <Card className="mt-8 border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Settings Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      We're working hard to bring you comprehensive settings management. 
                      These features will be available in a future update.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
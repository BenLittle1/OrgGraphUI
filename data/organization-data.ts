export interface Organization {
  id: string
  name: string
  description: string
  industry: string
  memberCount: number
  createdDate: string
  isActive: boolean
  logoUrl?: string
  website?: string
  location?: string
  plan: "free" | "pro" | "enterprise"
}

export interface OrganizationData {
  organizations: Organization[]
  industries: string[]
  totalOrganizations: number
  activeOrganizations: number
}

// Sample organization data for the dashboard
export const organizationData: OrganizationData = {
  organizations: [
    {
      id: "org-001",
      name: "CodeAid Technologies",
      description: "AI-powered development tools and business process automation platform",
      industry: "Software & Technology",
      memberCount: 4,
      createdDate: "2024-01-15",
      isActive: true,
      logoUrl: "",
      website: "https://codeaid.com",
      location: "San Francisco, CA",
      plan: "enterprise"
    },
    {
      id: "org-002", 
      name: "InnovateX Solutions",
      description: "Digital transformation consulting for enterprise clients",
      industry: "Consulting",
      memberCount: 12,
      createdDate: "2023-08-20",
      isActive: true,
      logoUrl: "",
      website: "https://innovatex.com",
      location: "New York, NY",
      plan: "pro"
    },
    {
      id: "org-003",
      name: "TechFlow Startup",
      description: "Early-stage fintech startup building payment infrastructure",
      industry: "Financial Services",
      memberCount: 8,
      createdDate: "2024-03-10",
      isActive: true,
      logoUrl: "",
      website: "https://techflow.com",
      location: "Austin, TX",
      plan: "pro"
    }
  ],
  industries: [
    "Software & Technology",
    "Consulting", 
    "Financial Services",
    "Healthcare",
    "E-commerce",
    "Manufacturing",
    "Education",
    "Media & Entertainment",
    "Real Estate",
    "Non-profit",
    "Government",
    "Other"
  ],
  totalOrganizations: 3,
  activeOrganizations: 3
}
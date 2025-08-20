export interface TeamMember {
  id: string
  name: string
  role: string
  email: string
  department: string
  avatarUrl?: string
  hireDate: string
  isActive: boolean
  bio?: string
}

export interface TeamData {
  members: TeamMember[]
  departments: string[]
  totalMembers: number
  activeMembers: number
}

// Sample team member data that will integrate with existing task assignments
export const teamData: TeamData = {
  members: [
    {
      id: "tm-001",
      name: "Sarah Chen",
      role: "Chief Executive Officer",
      email: "sarah.chen@codeaid.com",
      department: "Executive",
      hireDate: "2024-01-15",
      isActive: true,
      bio: "Visionary leader with 15+ years in tech startups. Previously founded two successful SaaS companies."
    },
    {
      id: "tm-002", 
      name: "Michael Rodriguez",
      role: "Chief Technology Officer",
      email: "michael.rodriguez@codeaid.com",
      department: "Engineering",
      hireDate: "2024-02-01",
      isActive: true,
      bio: "Full-stack architect specializing in scalable systems. Former lead engineer at major tech companies."
    },
    {
      id: "tm-003",
      name: "Emily Watson",
      role: "Chief Financial Officer", 
      email: "emily.watson@codeaid.com",
      department: "Finance",
      hireDate: "2024-02-15",
      isActive: true,
      bio: "Strategic financial leader with expertise in startup funding and growth-stage financial planning."
    },
    {
      id: "tm-005",
      name: "Lisa Thompson",
      role: "VP of Marketing",
      email: "lisa.thompson@codeaid.com",
      department: "Marketing", 
      hireDate: "2024-03-15",
      isActive: true,
      bio: "Growth marketing expert with proven track record in B2B SaaS customer acquisition."
    }
  ],
  departments: [
    "Executive",
    "Engineering", 
    "Finance",
    "Marketing"
  ],
  totalMembers: 4,
  activeMembers: 4
}

// Task assignment mapping - connects team members to specific task IDs from data.json
export const taskAssignments: Record<string, number[]> = {
  "tm-001": [1, 2, 9, 89, 3, 4, 5, 6, 7, 8, 11, 52], // CEO: Business Plan, Legal Structure, Board Setup, Pitch Deck, Legal tasks
  "tm-002": [46, 47, 48, 49, 50, 51, 54, 55, 56], // CTO: Tech stack, dev process, security, cloud, backup
  "tm-003": [21, 22, 23, 24, 26, 27, 28, 30, 31, 32], // CFO: Financial setup and management
  "tm-005": [60, 61, 62, 63, 64, 65, 67, 69, 70, 71, 72, 74, 75, 76] // VP Marketing: Brand, marketing, content, materials
}
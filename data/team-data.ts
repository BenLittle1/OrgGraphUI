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
      name: "Majeed Kazemi",
      role: "Chief Executive Officer",
      email: "majeed.kazemi@codeaid.com",
      department: "Executive",
      hireDate: "2024-01-15",
      isActive: true,
      bio: "Experienced technology executive with deep expertise in startup strategy and business development. Previously led engineering teams at scaling startups."
    },
    {
      id: "tm-002", 
      name: "Ali Shabani",
      role: "Senior Software Engineer",
      email: "ali.shabani@codeaid.com",
      department: "Engineering",
      hireDate: "2024-02-01",
      isActive: true,
      bio: "Senior software engineer specializing in full-stack development and system architecture. Expert in modern web technologies and scalable solutions."
    },
    {
      id: "tm-003",
      name: "Jack Fan",
      role: "Software Engineer", 
      email: "jack.fan@codeaid.com",
      department: "Engineering",
      hireDate: "2024-02-15",
      isActive: true,
      bio: "Full-stack engineer with strong frontend expertise and experience in user experience design. Passionate about building intuitive, performant applications."
    }
  ],
  departments: [
    "Executive",
    "Engineering"
  ],
  totalMembers: 3,
  activeMembers: 3
}

// Task assignment mapping - connects team members to specific task IDs from data.json
export const taskAssignments: Record<string, number[]> = {
  "tm-001": [1, 2, 9, 89, 3, 4, 5, 6, 7, 8, 11, 52, 21, 22, 23, 24, 30, 31, 62, 63, 64, 65, 67, 74], // CEO: Business/Legal/Board + Critical Financial + Strategic Marketing
  "tm-002": [46, 47, 48, 49, 50, 51, 54, 55, 56, 26, 27, 28, 32, 69, 70], // Senior Engineer: Core Technical + Financial Processes + Technical Marketing
  "tm-003": [60, 61, 71, 72, 75, 76, 25, 29, 68, 73, 77] // Engineer: Brand/Content + Remaining Financial + Additional Marketing
}
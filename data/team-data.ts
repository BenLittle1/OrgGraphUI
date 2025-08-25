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
    },
    {
      id: "tm-004",
      name: "Tovi Grossman",
      role: "Chief Scientist",
      email: "tovi.grossman@codeaid.com", 
      department: "Research",
      hireDate: "2024-03-01",
      isActive: true,
      bio: "Distinguished research scientist with expertise in human-computer interaction, AI/ML applications, and technology innovation. Previously Principal Scientist at Autodesk Research with 15+ years advancing the intersection of AI and user experience."
    }
  ],
  departments: [
    "Executive",
    "Engineering",
    "Research"
  ],
  totalMembers: 4,
  activeMembers: 4
}

// Task assignment mapping - connects team members to specific task IDs from data.json
// Updated for comprehensive business process data structure
export const taskAssignments: Record<string, number[]> = {
  "tm-001": [1, 2, 3, 26, 27, 28, 29, 30, 31, 32, 42, 43, 44, 45, 46, 54, 55, 63, 64, 65, 90, 91, 98, 152, 153, 155], // CEO: Strategic Planning, Investment, Board, Finance, GTM Strategy, Fundraising
  "tm-002": [79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 56, 57, 58, 59, 60, 61, 62, 127, 128, 129, 130], // Senior Engineer: Technology Stack, IT Security, Financial Systems, CRM
  "tm-003": [76, 77, 78, 102, 103, 104, 105, 106, 112, 131, 132, 133, 139, 140, 144, 145, 146, 66, 67, 68, 69, 70, 71], // Engineer: Product, Branding, Content, Customer Success, HR
  "tm-004": [72, 73, 74, 75, 92, 93, 94, 95, 96, 97, 107, 108, 109, 134, 135, 136, 154] // Chief Scientist: Research, Market Analysis, Competitive Intelligence, ROI Methodology
}
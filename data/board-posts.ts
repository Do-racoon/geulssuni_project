export interface FreeBoardPost {
  id: string
  title: string
  content: string
  contentHtml?: string
  category: "writing" | "design" | "photography" | "discussion"
  author: {
    id: string
    name: string
    avatar: string
  }
  createdAt: string
  image?: string
  likes: number
  comments: number
  isPinned: boolean
  isLiked: boolean
}

export interface AssignmentPost {
  id: string
  title: string
  description: string
  descriptionHtml?: string
  classLevel: "beginner" | "intermediate" | "advanced"
  instructor: string
  createdAt: string
  dueDate: string
  isCompleted: boolean
  reviewDate?: string
  instructorMemo?: string
}

export const freeBoardPosts: FreeBoardPost[] = [
  {
    id: "post-1",
    title: "Exploring Minimalist Design Principles",
    content:
      "I've been studying minimalist design principles lately and wanted to share some insights. The key aspects I've found most valuable are: reduction of unnecessary elements, focus on typography, and thoughtful use of negative space. What are your thoughts on minimalism in design?",
    category: "design",
    author: {
      id: "user-1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-06-15T10:30:00Z",
    image: "/images/lecture-2.jpg",
    likes: 24,
    comments: 8,
    isPinned: true,
    isLiked: false,
  },
  {
    id: "post-2",
    title: "Book Recommendation: 'The Design of Everyday Things'",
    content:
      "I just finished reading 'The Design of Everyday Things' by Don Norman and highly recommend it to everyone interested in design thinking. It provides valuable insights into how we interact with objects and spaces in our daily lives.",
    category: "design",
    author: {
      id: "user-2",
      name: "Jane Smith",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-06-14T15:45:00Z",
    likes: 18,
    comments: 5,
    isPinned: false,
    isLiked: true,
  },
  {
    id: "post-3",
    title: "Looking for Feedback on My Latest Photography Project",
    content:
      "I've been working on a series of black and white urban landscape photographs and would love some constructive feedback from the community. The project explores the contrast between architectural forms and natural elements in city environments.",
    contentHtml:
      "<p>I've been working on a series of black and white urban landscape photographs and would love some constructive feedback from the community. The project explores the contrast between architectural forms and natural elements in city environments.</p><p>You can view the full series <a href='#' class='underline'>here</a>.</p>",
    category: "photography",
    author: {
      id: "user-3",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-06-13T09:15:00Z",
    image: "/images/lecture-3.jpg",
    likes: 32,
    comments: 12,
    isPinned: false,
    isLiked: false,
  },
  {
    id: "post-4",
    title: "Typography Resources for Beginners",
    content:
      "I've compiled a list of helpful resources for those looking to improve their typography skills. These include online courses, books, and practice exercises that have helped me develop a better understanding of type design and usage.",
    category: "design",
    author: {
      id: "user-4",
      name: "Emily Chen",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-06-12T14:20:00Z",
    likes: 45,
    comments: 15,
    isPinned: false,
    isLiked: false,
  },
  {
    id: "post-5",
    title: "Upcoming Design Workshop in July",
    content:
      "I'm excited to announce that I'll be hosting a weekend workshop on editorial design next month. We'll cover layout principles, typography, and digital publishing techniques. Space is limited, so please register early if you're interested!",
    category: "discussion",
    author: {
      id: "user-5",
      name: "Michael Park",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-06-11T11:05:00Z",
    likes: 29,
    comments: 7,
    isPinned: true,
    isLiked: true,
  },
  {
    id: "post-6",
    title: "Creative Writing Prompts for Daily Practice",
    content:
      "I've found that daily writing exercises have significantly improved my creativity and writing skills. Here are some of my favorite prompts that have helped me overcome writer's block and develop new ideas.",
    category: "writing",
    author: {
      id: "user-1",
      name: "John Doe",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-06-10T09:30:00Z",
    likes: 37,
    comments: 14,
    isPinned: false,
    isLiked: false,
  },
  {
    id: "post-7",
    title: "Narrative Techniques in Photography",
    content:
      "How do you tell a compelling story through a series of photographs? I'd love to discuss different approaches to visual storytelling and how to create cohesive narratives through imagery.",
    category: "photography",
    author: {
      id: "user-3",
      name: "Alex Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    createdAt: "2023-06-09T16:45:00Z",
    likes: 22,
    comments: 9,
    isPinned: false,
    isLiked: true,
  },
]

export function getFreeBoardPost(id: string): FreeBoardPost | undefined {
  return freeBoardPosts.find((post) => post.id === id)
}

export function getAssignmentPost(id: string): AssignmentPost | undefined {
  return assignmentPosts.find((post) => post.id === id)
}

export const assignmentPosts: AssignmentPost[] = [
  {
    id: "assignment-1",
    title: "Character Development Exercise",
    description:
      "Create three distinct character profiles for a short story. Each profile should include physical description, background, motivations, and a brief sample of dialogue that reflects their personality.",
    classLevel: "beginner",
    instructor: "Alexandra Reeves",
    createdAt: "2023-06-15T10:30:00Z",
    dueDate: "June 22, 2023",
    isCompleted: false,
  },
  {
    id: "assignment-2",
    title: "Advanced Typography Layout",
    description:
      "Design a magazine spread that demonstrates your understanding of typographic hierarchy, grid systems, and visual flow. Your layout should include headlines, body text, pull quotes, and captions.",
    descriptionHtml:
      "<p>Design a magazine spread that demonstrates your understanding of typographic hierarchy, grid systems, and visual flow. Your layout should include:</p><ul><li>Headlines and subheadings</li><li>Body text (minimum 300 words)</li><li>Pull quotes</li><li>Image captions</li><li>Page numbers and folios</li></ul><p>Submit both a PDF of your final design and a brief explanation of your typographic choices.</p>",
    classLevel: "advanced",
    instructor: "Thomas Noir",
    createdAt: "2023-06-14T09:15:00Z",
    dueDate: "June 25, 2023",
    isCompleted: true,
    reviewDate: "2023-06-26T14:30:00Z",
    instructorMemo:
      "Remember to check for proper alignment and spacing in all submissions. Many students struggle with baseline grids.",
  },
  {
    id: "assignment-3",
    title: "Narrative Photography Series",
    description:
      "Create a series of 5-7 photographs that tell a cohesive story without text. Focus on composition, sequencing, and visual continuity to convey your narrative.",
    classLevel: "intermediate",
    instructor: "Elise Laurent",
    createdAt: "2023-06-13T11:45:00Z",
    dueDate: "June 28, 2023",
    isCompleted: false,
  },
  {
    id: "assignment-4",
    title: "Editorial Design Project",
    description:
      "Design a 6-page editorial feature for a magazine of your choice. Your design should include a cover page, table of contents, and feature article with appropriate typography and image placement.",
    classLevel: "intermediate",
    instructor: "Thomas Noir",
    createdAt: "2023-06-12T13:20:00Z",
    dueDate: "July 3, 2023",
    isCompleted: false,
  },
  {
    id: "assignment-5",
    title: "Writing Dialogue Exercise",
    description:
      "Write a scene consisting entirely of dialogue between two characters. The conversation should reveal information about both characters and advance a simple plot without any narrative description.",
    classLevel: "beginner",
    instructor: "Alexandra Reeves",
    createdAt: "2023-06-11T10:00:00Z",
    dueDate: "June 18, 2023",
    isCompleted: true,
    reviewDate: "2023-06-19T11:15:00Z",
  },
]

// Add the missing export as an alias to the existing freeBoardPosts array
export const boardPosts = freeBoardPosts

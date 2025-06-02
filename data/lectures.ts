export interface Lecture {
  id: string
  title: string
  instructor: string
  instructorTitle?: string
  instructorImage?: string
  category: "beginner" | "intermediate" | "advanced" | "special"
  tags: string[]
  date: string
  durationMinutes: number
  location: string
  thumbnail: string
  description: string
  longDescription?: string
  kakaoTalkUrl?: string
  relatedLectures?: string[]
}

export const lectures: Lecture[] = [
  {
    id: "1",
    title: "Introduction to Creative Writing",
    instructor: "Alexandra Reeves",
    instructorTitle: "Senior Writing Coach",
    instructorImage: "/images/profile-1.jpg",
    category: "beginner",
    tags: ["writing", "creativity", "fundamentals"],
    date: "June 15, 2023",
    durationMinutes: 90,
    location: "Studio A, Main Building",
    thumbnail: "/images/lecture-1.jpg",
    description:
      "A foundational course for aspiring writers looking to develop their creative voice and storytelling techniques.",
    longDescription:
      "This lecture provides a comprehensive introduction to creative writing principles, exploring narrative structure, character development, and descriptive techniques. Participants will engage in practical exercises designed to stimulate creativity and develop a consistent writing practice. Suitable for complete beginners and those looking to refresh their fundamental skills.",
    kakaoTalkUrl: "https://open.kakao.com/creative-writing",
    relatedLectures: ["4", "7", "9"],
  },
  {
    id: "2",
    title: "Advanced Typography Design",
    instructor: "Thomas Noir",
    instructorTitle: "Typography Specialist",
    instructorImage: "/images/profile-2.jpg",
    category: "advanced",
    tags: ["design", "typography", "composition"],
    date: "June 18, 2023",
    durationMinutes: 120,
    location: "Design Lab, East Wing",
    thumbnail: "/images/lecture-2.jpg",
    description:
      "An in-depth exploration of typography as a powerful design element in contemporary visual communication.",
    longDescription:
      "This advanced lecture delves into sophisticated typography techniques, examining grid systems, typographic hierarchy, and custom letterform design. Participants will analyze case studies from leading design studios and develop their own typographic compositions. Prior experience with basic typography principles is recommended.",
    kakaoTalkUrl: "https://open.kakao.com/typography-design",
    relatedLectures: ["5", "8", "11"],
  },
  {
    id: "3",
    title: "Narrative Photography",
    instructor: "Elise Laurent",
    instructorTitle: "Visual Storyteller",
    instructorImage: "/images/profile-3.jpg",
    category: "intermediate",
    tags: ["photography", "storytelling", "composition"],
    date: "June 22, 2023",
    durationMinutes: 105,
    location: "Photo Studio, West Building",
    thumbnail: "/images/lecture-3.jpg",
    description:
      "Learn how to create compelling visual narratives through photographic sequences and thoughtful composition.",
    longDescription:
      "This intermediate lecture explores the intersection of photography and storytelling, focusing on how to develop visual narratives through carefully constructed image sequences. Participants will learn techniques for planning shoots, directing subjects, and editing collections to convey coherent stories. Basic photography skills are required.",
    kakaoTalkUrl: "https://open.kakao.com/narrative-photography",
    relatedLectures: ["6", "10", "12"],
  },
  {
    id: "4",
    title: "Character Development Workshop",
    instructor: "Marcus Chen",
    instructorTitle: "Fiction Writer",
    instructorImage: "/images/profile-4.jpg",
    category: "beginner",
    tags: ["writing", "fiction", "characters"],
    date: "June 25, 2023",
    durationMinutes: 90,
    location: "Workshop Room C, Main Building",
    thumbnail: "/images/book-1.jpg",
    description:
      "A practical workshop focused on creating memorable, multi-dimensional characters for fiction writing.",
    longDescription:
      "This workshop provides hands-on guidance for developing compelling characters that drive narrative and engage readers. Through structured exercises and group discussions, participants will explore character motivation, background development, dialogue writing, and character arcs. Suitable for writers of all experience levels.",
    kakaoTalkUrl: "https://open.kakao.com/character-workshop",
    relatedLectures: ["1", "7", "9"],
  },
  {
    id: "5",
    title: "Minimalist Design Principles",
    instructor: "Thomas Noir",
    instructorTitle: "Typography Specialist",
    instructorImage: "/images/profile-2.jpg",
    category: "intermediate",
    tags: ["design", "minimalism", "composition"],
    date: "June 28, 2023",
    durationMinutes: 100,
    location: "Design Lab, East Wing",
    thumbnail: "/images/book-2.jpg",
    description: "Explore the philosophy and application of minimalist design in contemporary visual communication.",
    longDescription:
      "This lecture examines the principles of minimalist design, from its historical foundations to its modern applications. Participants will analyze successful minimalist design cases and learn techniques for achieving maximum impact with minimal elements. The session includes practical exercises in simplification and visual hierarchy.",
    kakaoTalkUrl: "https://open.kakao.com/minimalist-design",
    relatedLectures: ["2", "8", "11"],
  },
  {
    id: "6",
    title: "Documentary Storytelling",
    instructor: "Elise Laurent",
    instructorTitle: "Visual Storyteller",
    instructorImage: "/images/profile-3.jpg",
    category: "intermediate",
    tags: ["photography", "documentary", "journalism"],
    date: "July 2, 2023",
    durationMinutes: 110,
    location: "Photo Studio, West Building",
    thumbnail: "/images/book-3.jpg",
    description: "Learn techniques for capturing authentic moments and crafting compelling documentary narratives.",
    longDescription:
      "This lecture focuses on the art of documentary storytelling through photography and mixed media. Participants will explore approaches to research, subject engagement, ethical considerations, and narrative structure in documentary work. The session includes case studies of influential documentary projects and practical guidance for developing personal documentary series.",
    kakaoTalkUrl: "https://open.kakao.com/documentary-storytelling",
    relatedLectures: ["3", "10", "12"],
  },
  {
    id: "7",
    title: "Poetry and Prose: Finding Your Voice",
    instructor: "Alexandra Reeves",
    instructorTitle: "Senior Writing Coach",
    instructorImage: "/images/profile-1.jpg",
    category: "beginner",
    tags: ["writing", "poetry", "voice"],
    date: "July 5, 2023",
    durationMinutes: 90,
    location: "Studio A, Main Building",
    thumbnail: "/images/lecture-1.jpg",
    description: "A workshop designed to help writers discover and develop their unique literary voice.",
    longDescription:
      "This session explores the concept of literary voice and provides practical techniques for developing authentic expression in both poetry and prose. Through guided exercises, reading analysis, and peer feedback, participants will experiment with different styles and approaches to find their distinctive voice. Suitable for writers at all stages of their journey.",
    kakaoTalkUrl: "https://open.kakao.com/literary-voice",
    relatedLectures: ["1", "4", "9"],
  },
  {
    id: "8",
    title: "Brand Identity Systems",
    instructor: "Thomas Noir",
    instructorTitle: "Typography Specialist",
    instructorImage: "/images/profile-2.jpg",
    category: "advanced",
    tags: ["design", "branding", "identity"],
    date: "July 9, 2023",
    durationMinutes: 120,
    location: "Design Lab, East Wing",
    thumbnail: "/images/lecture-2.jpg",
    description: "An advanced exploration of comprehensive brand identity systems and their implementation.",
    longDescription:
      "This lecture examines the development of cohesive brand identity systems that function effectively across multiple touchpoints. Participants will learn methodologies for brand research, strategy development, visual language creation, and implementation guidelines. The session includes analysis of successful brand systems and practical exercises in identity design.",
    kakaoTalkUrl: "https://open.kakao.com/brand-identity",
    relatedLectures: ["2", "5", "11"],
  },
  {
    id: "9",
    title: "Creative Non-Fiction",
    instructor: "Marcus Chen",
    instructorTitle: "Fiction Writer",
    instructorImage: "/images/profile-4.jpg",
    category: "intermediate",
    tags: ["writing", "non-fiction", "memoir"],
    date: "July 12, 2023",
    durationMinutes: 95,
    location: "Workshop Room C, Main Building",
    thumbnail: "/images/book-1.jpg",
    description:
      "Explore the art of applying creative writing techniques to factual narratives and personal experiences.",
    longDescription:
      "This lecture delves into the growing field of creative non-fiction, examining how literary techniques can be applied to factual material. Participants will learn approaches to memoir writing, literary journalism, and essay composition, with emphasis on balancing creativity with accuracy and ethical considerations. The session includes analysis of exemplary works and guided writing exercises.",
    kakaoTalkUrl: "https://open.kakao.com/creative-nonfiction",
    relatedLectures: ["1", "4", "7"],
  },
  {
    id: "10",
    title: "Conceptual Photography",
    instructor: "Elise Laurent",
    instructorTitle: "Visual Storyteller",
    instructorImage: "/images/profile-3.jpg",
    category: "advanced",
    tags: ["photography", "conceptual", "fine art"],
    date: "July 16, 2023",
    durationMinutes: 115,
    location: "Photo Studio, West Building",
    thumbnail: "/images/lecture-3.jpg",
    description: "An advanced exploration of concept development and execution in fine art and commercial photography.",
    longDescription:
      "This lecture focuses on the development and realization of concept-driven photographic projects. Participants will explore methodologies for generating ideas, planning elaborate shoots, directing subjects, and post-production techniques that enhance conceptual clarity. The session includes analysis of influential conceptual photographers and practical guidance for developing personal projects.",
    kakaoTalkUrl: "https://open.kakao.com/conceptual-photography",
    relatedLectures: ["3", "6", "12"],
  },
  {
    id: "11",
    title: "Editorial Design Masterclass",
    instructor: "Thomas Noir",
    instructorTitle: "Typography Specialist",
    instructorImage: "/images/profile-2.jpg",
    category: "advanced",
    tags: ["design", "editorial", "layout"],
    date: "July 19, 2023",
    durationMinutes: 120,
    location: "Design Lab, East Wing",
    thumbnail: "/images/book-2.jpg",
    description: "A comprehensive masterclass on contemporary editorial design for print and digital publications.",
    longDescription:
      "This advanced session examines the principles and practices of editorial design across print and digital platforms. Participants will explore grid systems, typography hierarchies, image integration, and narrative pacing in publication design. The masterclass includes analysis of award-winning publications and hands-on exercises in layout design and content organization.",
    kakaoTalkUrl: "https://open.kakao.com/editorial-design",
    relatedLectures: ["2", "5", "8"],
  },
  {
    id: "12",
    title: "Special Session: Visual Storytelling Across Media",
    instructor: "All Faculty",
    category: "special",
    tags: ["multimedia", "storytelling", "collaboration"],
    date: "July 23, 2023",
    durationMinutes: 180,
    location: "Main Auditorium",
    thumbnail: "/images/book-3.jpg",
    description: "A collaborative session exploring narrative techniques across writing, design, and photography.",
    longDescription:
      "This special session brings together all faculty members for a unique exploration of visual storytelling across different media. Through panel discussions, collaborative demonstrations, and interactive exercises, participants will discover how writing, design, and photography can work together to create powerful integrated narratives. This is a rare opportunity to learn from multiple creative perspectives simultaneously.",
    kakaoTalkUrl: "https://open.kakao.com/visual-storytelling",
    relatedLectures: ["3", "6", "10"],
  },
]

export function getLecture(id: string): Lecture | undefined {
  return lectures.find((lecture) => lecture.id === id)
}

export function getRelatedLectures(id: string): Lecture[] {
  const lecture = getLecture(id)
  if (!lecture || !lecture.relatedLectures) return []

  return lecture.relatedLectures
    .map((relatedId) => getLecture(relatedId))
    .filter((lecture): lecture is Lecture => lecture !== undefined)
}

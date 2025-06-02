export interface Book {
  id: string
  title: string
  author: string
  authorBio?: string
  authorImage?: string
  category: "writing-guides" | "essays" | "novels"
  cover: string
  description: string
  longDescription?: string
  publisher: string
  publishDate: string
  pages: number
  isbn: string
  purchaseUrl?: string
  tableOfContents?: string[]
  relatedBooks?: string[]
}

export const books: Book[] = [
  {
    id: "1",
    title: "The Craft of Writing",
    author: "Alexandra Reeves",
    authorBio:
      "Alexandra Reeves is an award-winning author and writing coach with over 15 years of experience in creative writing education. Her approach combines traditional narrative techniques with innovative exercises designed to unlock creativity.",
    authorImage: "/images/profile-1.jpg",
    category: "writing-guides",
    cover: "/images/book-1.jpg",
    description: "A comprehensive guide to developing your writing skills across multiple genres and formats.",
    longDescription:
      "This essential guide provides both beginning and experienced writers with practical techniques for improving their craft. Covering everything from narrative structure and character development to dialogue and descriptive prose, this book offers insights and exercises that will help writers at any stage of their journey. Each chapter includes examples from contemporary literature and practical assignments to reinforce learning.",
    publisher: "Meridian Press",
    publishDate: "March 2022",
    pages: 328,
    isbn: "978-1-234567-89-0",
    purchaseUrl: "https://example.com/books/craft-of-writing",
    tableOfContents: [
      "Finding Your Voice",
      "Narrative Structure",
      "Character Development",
      "Dialogue Techniques",
      "Setting and Atmosphere",
      "Editing and Revision",
      "Publishing Your Work",
    ],
    relatedBooks: ["4", "7", "10"],
  },
  {
    id: "2",
    title: "Minimalist Design Philosophy",
    author: "Thomas Noir",
    authorBio:
      "Thomas Noir is a renowned designer and educator specializing in typography and minimalist design. His work has been featured in numerous international exhibitions and publications.",
    authorImage: "/images/profile-2.jpg",
    category: "essays",
    cover: "/images/book-2.jpg",
    description:
      "A collection of essays exploring the principles and applications of minimalist design in contemporary visual culture.",
    longDescription:
      "This thought-provoking collection examines minimalism as both an aesthetic approach and a philosophical stance in design. Through a series of essays, case studies, and visual analyses, the book explores how reduction, simplicity, and clarity can lead to more effective and meaningful communication. The author draws connections between historical minimalist movements and current design practices, offering insights for designers seeking to incorporate minimalist principles in their work.",
    publisher: "Visual Discourse Books",
    publishDate: "September 2021",
    pages: 256,
    isbn: "978-2-345678-90-1",
    purchaseUrl: "https://example.com/books/minimalist-design",
    relatedBooks: ["5", "8", "11"],
  },
  {
    id: "3",
    title: "Visual Narratives",
    author: "Elise Laurent",
    authorBio:
      "Elise Laurent is a photographer and visual storyteller whose work bridges documentary and fine art approaches. Her photography has been exhibited internationally and published in leading magazines.",
    authorImage: "/images/profile-3.jpg",
    category: "writing-guides",
    cover: "/images/book-3.jpg",
    description: "A practical guide to storytelling through photography and visual media.",
    longDescription:
      "This comprehensive guide explores the art of visual storytelling across photography, film, and mixed media. Drawing on the author's extensive experience as a visual artist, the book provides practical techniques for developing narrative concepts, planning shoots, directing subjects, and editing visual sequences. Each chapter combines theoretical insights with hands-on exercises designed to help readers develop their own visual storytelling projects.",
    publisher: "Aperture Publishing",
    publishDate: "May 2022",
    pages: 292,
    isbn: "978-3-456789-01-2",
    purchaseUrl: "https://example.com/books/visual-narratives",
    tableOfContents: [
      "The Elements of Visual Storytelling",
      "Developing Narrative Concepts",
      "Composition and Visual Flow",
      "Color and Mood",
      "Sequencing and Pacing",
      "Mixed Media Approaches",
      "Publishing and Exhibiting",
    ],
    relatedBooks: ["6", "9", "12"],
  },
  {
    id: "4",
    title: "Character and Conflict",
    author: "Marcus Chen",
    authorBio:
      "Marcus Chen is a novelist and creative writing instructor whose fiction has received numerous literary awards. His teaching focuses on character development and narrative tension.",
    authorImage: "/images/profile-4.jpg",
    category: "writing-guides",
    cover: "/images/lecture-1.jpg",
    description: "An in-depth exploration of creating compelling characters and meaningful conflict in fiction.",
    longDescription:
      "This essential guide for fiction writers examines the interrelated elements of character and conflict that drive engaging narratives. Through analysis of contemporary fiction and practical exercises, the book provides techniques for developing multi-dimensional characters, creating meaningful stakes, and structuring conflicts that resonate with readers. Each chapter builds on the previous, guiding writers through the process of crafting character-driven stories with emotional depth.",
    publisher: "Meridian Press",
    publishDate: "August 2022",
    pages: 304,
    isbn: "978-4-567890-12-3",
    purchaseUrl: "https://example.com/books/character-conflict",
    tableOfContents: [
      "Character Foundations",
      "Motivation and Desire",
      "Internal vs. External Conflict",
      "Stakes and Consequences",
      "Character Arcs",
      "Dialogue and Conflict",
      "Resolution and Transformation",
    ],
    relatedBooks: ["1", "7", "10"],
  },
  {
    id: "5",
    title: "Essays on Typography",
    author: "Thomas Noir",
    authorBio:
      "Thomas Noir is a renowned designer and educator specializing in typography and minimalist design. His work has been featured in numerous international exhibitions and publications.",
    authorImage: "/images/profile-2.jpg",
    category: "essays",
    cover: "/images/lecture-2.jpg",
    description: "A collection of critical essays examining the role of typography in contemporary design and culture.",
    longDescription:
      "This thought-provoking collection explores typography as both a technical discipline and a cultural phenomenon. Through a series of essays, the author examines how typography shapes meaning, influences perception, and reflects societal changes. Drawing on historical examples and contemporary practice, the book offers insights into the evolving role of typography in an increasingly digital visual landscape.",
    publisher: "Visual Discourse Books",
    publishDate: "February 2022",
    pages: 224,
    isbn: "978-5-678901-23-4",
    purchaseUrl: "https://example.com/books/typography-essays",
    relatedBooks: ["2", "8", "11"],
  },
  {
    id: "6",
    title: "The Light Between",
    author: "Elise Laurent",
    authorBio:
      "Elise Laurent is a photographer and visual storyteller whose work bridges documentary and fine art approaches. Her photography has been exhibited internationally and published in leading magazines.",
    authorImage: "/images/profile-3.jpg",
    category: "novels",
    cover: "/images/lecture-3.jpg",
    description:
      "A lyrical novel exploring the intersection of art, memory, and identity through the life of a photographer.",
    longDescription:
      "This debut novel follows the journey of a photographer who returns to her childhood home after years abroad, confronting unresolved relationships and rediscovering her creative voice. Set against the backdrop of changing seasons in a coastal town, the narrative weaves between past and present, exploring how visual perception shapes our understanding of ourselves and others. The novel examines themes of artistic integrity, family secrets, and the search for authentic expression.",
    publisher: "Meridian Press",
    publishDate: "October 2021",
    pages: 342,
    isbn: "978-6-789012-34-5",
    purchaseUrl: "https://example.com/books/light-between",
    relatedBooks: ["3", "9", "12"],
  },
  {
    id: "7",
    title: "Poetry in Practice",
    author: "Alexandra Reeves",
    authorBio:
      "Alexandra Reeves is an award-winning author and writing coach with over 15 years of experience in creative writing education. Her approach combines traditional narrative techniques with innovative exercises designed to unlock creativity.",
    authorImage: "/images/profile-1.jpg",
    category: "writing-guides",
    cover: "/images/book-1.jpg",
    description: "A practical guide to reading, writing, and appreciating poetry in contemporary contexts.",
    longDescription:
      "This accessible guide demystifies poetry for both aspiring poets and general readers. Through a combination of analysis, examples, and hands-on exercises, the book explores poetic forms, techniques, and traditions while encouraging readers to develop their own unique voice. Each chapter examines different aspects of poetry—from imagery and sound to structure and theme—providing tools for both creating and interpreting poetic works.",
    publisher: "Meridian Press",
    publishDate: "April 2022",
    pages: 276,
    isbn: "978-7-890123-45-6",
    purchaseUrl: "https://example.com/books/poetry-practice",
    tableOfContents: [
      "Reading as a Poet",
      "Image and Metaphor",
      "Sound and Rhythm",
      "Form and Structure",
      "Voice and Perspective",
      "Revision Strategies",
      "Publishing Poetry",
    ],
    relatedBooks: ["1", "4", "10"],
  },
  {
    id: "8",
    title: "Design for Change",
    author: "Thomas Noir",
    authorBio:
      "Thomas Noir is a renowned designer and educator specializing in typography and minimalist design. His work has been featured in numerous international exhibitions and publications.",
    authorImage: "/images/profile-2.jpg",
    category: "essays",
    cover: "/images/book-2.jpg",
    description: "Essays exploring the role of design in addressing social and environmental challenges.",
    longDescription:
      "This collection examines how design thinking and practice can contribute to positive social and environmental change. Through case studies, interviews, and critical analysis, the book explores projects that address issues from sustainability and accessibility to social justice and public health. The essays challenge designers to consider the broader implications of their work and provide frameworks for ethical, impactful design practice.",
    publisher: "Visual Discourse Books",
    publishDate: "November 2021",
    pages: 288,
    isbn: "978-8-901234-56-7",
    purchaseUrl: "https://example.com/books/design-change",
    relatedBooks: ["2", "5", "11"],
  },
  {
    id: "9",
    title: "The Composition of Light",
    author: "Elise Laurent",
    authorBio:
      "Elise Laurent is a photographer and visual storyteller whose work bridges documentary and fine art approaches. Her photography has been exhibited internationally and published in leading magazines.",
    authorImage: "/images/profile-3.jpg",
    category: "writing-guides",
    cover: "/images/book-3.jpg",
    description: "A comprehensive guide to understanding and working with light in photography.",
    longDescription:
      "This technical and aesthetic guide explores the fundamental role of light in photography. Covering everything from natural light and studio lighting to post-production techniques, the book provides practical knowledge for photographers at all levels. Each chapter combines technical information with creative approaches, helping readers develop both their technical skills and artistic vision.",
    publisher: "Aperture Publishing",
    publishDate: "July 2022",
    pages: 320,
    isbn: "978-9-012345-67-8",
    purchaseUrl: "https://example.com/books/composition-light",
    tableOfContents: [
      "Understanding Light",
      "Natural Light Techniques",
      "Studio Lighting Fundamentals",
      "Creative Lighting Approaches",
      "Light and Composition",
      "Color and Light",
      "Post-Production Light Control",
    ],
    relatedBooks: ["3", "6", "12"],
  },
  {
    id: "10",
    title: "The Writer's Journey",
    author: "Marcus Chen",
    authorBio:
      "Marcus Chen is a novelist and creative writing instructor whose fiction has received numerous literary awards. His teaching focuses on character development and narrative tension.",
    authorImage: "/images/profile-4.jpg",
    category: "writing-guides",
    cover: "/images/lecture-1.jpg",
    description: "A guide to developing sustainable creative practices and navigating a writing life.",
    longDescription:
      "This practical guide addresses the challenges and opportunities of pursuing a writing life. Beyond craft techniques, the book explores establishing productive routines, overcoming creative blocks, managing rejection, and building a supportive community. Drawing on interviews with established authors and the author's own experience, the book provides strategies for sustaining creativity and resilience throughout a writing career.",
    publisher: "Meridian Press",
    publishDate: "January 2022",
    pages: 264,
    isbn: "978-0-123456-78-9",
    purchaseUrl: "https://example.com/books/writers-journey",
    tableOfContents: [
      "Establishing Creative Routines",
      "Overcoming Blocks and Resistance",
      "Finding Your Community",
      "Navigating Feedback and Criticism",
      "The Publication Process",
      "Digital Platforms and Opportunities",
      "Sustaining a Creative Life",
    ],
    relatedBooks: ["1", "4", "7"],
  },
  {
    id: "11",
    title: "The Essence of Form",
    author: "Thomas Noir",
    authorBio:
      "Thomas Noir is a renowned designer and educator specializing in typography and minimalist design. His work has been featured in numerous international exhibitions and publications.",
    authorImage: "/images/profile-2.jpg",
    category: "essays",
    cover: "/images/lecture-2.jpg",
    description: "Essays exploring form as a fundamental element of design across disciplines.",
    longDescription:
      "This collection examines the concept of form across design disciplines, from graphic design and architecture to product design and digital interfaces. Through historical analysis and contemporary case studies, the essays explore how form influences function, perception, and meaning. The book challenges conventional thinking about form, proposing new frameworks for understanding this essential element of design.",
    publisher: "Visual Discourse Books",
    publishDate: "June 2022",
    pages: 240,
    isbn: "978-1-234567-89-0",
    purchaseUrl: "https://example.com/books/essence-form",
    relatedBooks: ["2", "5", "8"],
  },
  {
    id: "12",
    title: "Shadows and Light",
    author: "Elise Laurent",
    authorBio:
      "Elise Laurent is a photographer and visual storyteller whose work bridges documentary and fine art approaches. Her photography has been exhibited internationally and published in leading magazines.",
    authorImage: "/images/profile-3.jpg",
    category: "novels",
    cover: "/images/lecture-3.jpg",
    description: "A novel exploring the life of a war photographer confronting ethical dilemmas and personal trauma.",
    longDescription:
      "This powerful novel follows a renowned war photographer who retreats to an isolated coastal village after a traumatic assignment. As she attempts to rebuild her life and artistic practice, she confronts questions about the ethics of witnessing suffering, the impact of images on public consciousness, and the personal cost of documenting conflict. Through lyrical prose and vivid imagery, the novel examines the tension between artistic distance and human connection.",
    publisher: "Meridian Press",
    publishDate: "December 2021",
    pages: 368,
    isbn: "978-2-345678-90-1",
    purchaseUrl: "https://example.com/books/shadows-light",
    relatedBooks: ["3", "6", "9"],
  },
]

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id)
}

export function getRelatedBooks(id: string): Book[] {
  const book = getBook(id)
  if (!book || !book.relatedBooks) return []

  return book.relatedBooks.map((relatedId) => getBook(relatedId)).filter((book): book is Book => book !== undefined)
}

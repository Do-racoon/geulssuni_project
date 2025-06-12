import Image from "next/image"
import { supabase } from "@/lib/supabase/server"
import AboutClient from "@/components/about/about-client"

// Creative thinking features moved from home page
const features = [
  {
    icon: "/images/creative-icon.svg",
    title: "Creative Thinking",
    description: "Innovative solutions that challenge conventional boundaries and inspire new perspectives.",
  },
  {
    icon: "/images/design-icon.svg",
    title: "Elegant Design",
    description: "Refined aesthetics that embody sophistication, clarity, and timeless visual appeal.",
  },
  {
    icon: "/images/strategy-icon.svg",
    title: "Strategic Vision",
    description: "Forward-thinking approaches that align creative direction with meaningful outcomes.",
  },
]

async function getAuthorsData() {
  try {
    const { data: authors, error } = await supabase
      .from("authors")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching authors:", error)
      return []
    }

    return authors || []
  } catch (error) {
    console.error("Error fetching authors:", error)
    return []
  }
}

async function getPortfolioData() {
  try {
    const { data: portfolio, error } = await supabase
      .from("portfolio")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching portfolio:", error)
      return []
    }

    return portfolio || []
  } catch (error) {
    console.error("Error fetching portfolio:", error)
    return []
  }
}

async function getPhotoData() {
  try {
    const { data: photos, error } = await supabase.from("photo").select("*").order("created_at", { ascending: false })

    if (error) {
      // If table doesn't exist, return empty array instead of crashing
      if (error.message.includes('relation "public.photo" does not exist')) {
        console.log("Photo table doesn't exist yet. Please run the SQL script to create it.")
        return []
      }
      console.error("Error fetching photos:", error)
      return []
    }

    return photos || []
  } catch (error) {
    console.error("Error fetching photos:", error)
    return []
  }
}

export default async function AboutPage() {
  const authors = await getAuthorsData()
  const portfolio = await getPortfolioData()
  const photos = await getPhotoData()

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="relative w-full h-[400px] mb-16 overflow-hidden rounded-lg">
        <Image src="/placeholder.svg?height=800&width=1600" alt="About Us" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-4">
            <h1 className="text-4xl md:text-5xl font-light tracking-wider mb-4">About Our Agency</h1>
            <p className="text-lg md:text-xl">
              We are a collective of creative minds dedicated to transforming ideas into impactful realities.
            </p>
          </div>
        </div>
      </div>

      <AboutClient authors={authors} portfolio={portfolio} photos={photos} features={features} />
    </div>
  )
}

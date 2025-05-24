import Image from "next/image"

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

export default function Features() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-6">
                <Image
                  src={feature.icon || "/placeholder.svg"}
                  alt={feature.title}
                  width={64}
                  height={64}
                  className="mx-auto"
                />
              </div>
              <h3 className="text-xl font-light mb-3 tracking-wider uppercase">{feature.title}</h3>
              <p className="text-sm text-gray-700 leading-relaxed max-w-xs mx-auto font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

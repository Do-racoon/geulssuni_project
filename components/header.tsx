export default function Header() {
  return (
    <section className="relative h-screen w-full">
      <div
        className="absolute inset-0 bg-cover bg-center monochrome"
        style={{
          backgroundImage: "url('/images/header-background.jpg')",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-light tracking-widest uppercase mb-6 text-black">Geulssuni</h1>
          <p className="text-lg md:text-xl font-light tracking-wider max-w-md mx-auto text-black">
            Minimalist design. Timeless elegance.
          </p>
        </div>
      </div>
    </section>
  )
}

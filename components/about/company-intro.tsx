export default function CompanyIntro() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-light text-center mb-8 tracking-wider">Our Philosophy</h2>

      <div className="space-y-6 text-gray-700">
        <p className="leading-relaxed">
          Founded in 2010, our creative agency has been at the forefront of innovative design and strategic thinking. We
          believe in the power of creativity to transform businesses and connect with audiences in meaningful ways.
        </p>

        <p className="leading-relaxed">
          Our philosophy centers on the belief that great design is not just about aesthetics, but about solving
          problems and creating experiences that resonate. We approach each project with curiosity, empathy, and a
          commitment to excellence.
        </p>

        <p className="leading-relaxed">
          With a team of diverse talents and perspectives, we bring a unique blend of creativity and strategic thinking
          to every challenge. Our collaborative process ensures that each project benefits from our collective expertise
          and passion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <h3 className="text-4xl font-light mb-2">15+</h3>
            <p className="text-sm uppercase tracking-wider">Years of Experience</p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-light mb-2">200+</h3>
            <p className="text-sm uppercase tracking-wider">Projects Completed</p>
          </div>

          <div className="text-center">
            <h3 className="text-4xl font-light mb-2">50+</h3>
            <p className="text-sm uppercase tracking-wider">Industry Awards</p>
          </div>
        </div>
      </div>
    </div>
  )
}

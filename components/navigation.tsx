import Link from "next/link"

const navItems = [
  { name: "Home", href: "/" },
  { name: "Lectures", href: "/lectures" },
  { name: "Books", href: "/books" },
  { name: "Board", href: "/board" }, // 이 줄 추가
  { name: "About", href: "/about" },
]

export default function Navigation() {
  return (
    <nav>
      <ul className="flex space-x-6">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link href={item.href}>{item.name}</Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

import Link from "next/link"

interface NoResultsProps {
  searchQuery: string
}

export default function NoResults({ searchQuery }: NoResultsProps) {
  return (
    <div id="no-results" className="text-center py-12">
      <h3 className="text-xl font-light mb-4">No results found for "{searchQuery}"</h3>
      <p className="text-gray-600 mb-6">
        We couldn't find any FAQs matching your search. Would you like to ask this question directly?
      </p>
      <Link
        href="/ask-question"
        className="inline-flex items-center px-6 py-3 bg-black text-white text-sm uppercase tracking-wider hover:bg-gray-800 transition-colors"
      >
        Ask a Question
      </Link>
    </div>
  )
}

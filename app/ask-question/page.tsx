import type { Metadata } from "next"
import AskQuestionForm from "@/components/ask-question-form"

export const metadata: Metadata = {
  title: "Ask a Question | Creative Agency",
  description: "Submit your questions to our team and get personalized answers",
}

export default function AskQuestionPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto py-24 px-4">
        <h1 className="text-4xl font-light text-center mb-8 tracking-widest uppercase">Ask a Question</h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Couldn't find what you were looking for in our FAQ? Submit your question below and our team will get back to
          you as soon as possible.
        </p>
        <div className="max-w-2xl mx-auto">
          <AskQuestionForm />
        </div>
      </div>
    </main>
  )
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: "payment" | "author" | "technical" | "general"
}

export const faqData: FAQ[] = [
  {
    id: "faq-1",
    question: "How do I make a payment for a lecture?",
    answer:
      "You can make payments through our secure payment gateway using credit/debit cards or PayPal. After selecting a lecture, click on the 'Register' button and follow the payment instructions. All transactions are encrypted and secure.",
    category: "payment",
  },
  {
    id: "faq-2",
    question: "What is your refund policy?",
    answer:
      "We offer full refunds if requested at least 7 days before the lecture date. For cancellations made within 7 days of the lecture, we offer a 50% refund or the option to transfer to another lecture. No refunds are available after the lecture has taken place.",
    category: "payment",
  },
  {
    id: "faq-3",
    question: "Do you offer discounts for multiple lecture bookings?",
    answer:
      "Yes, we offer a 10% discount when you register for 3 or more lectures at once, and a 15% discount for 5 or more lectures. These discounts are automatically applied during checkout.",
    category: "payment",
  },
  {
    id: "faq-4",
    question: "How can I become an author on your platform?",
    answer:
      "To become an author, please submit your portfolio and a brief bio through our 'Join as Author' form. Our editorial team reviews all applications within 2 weeks. We look for individuals with expertise in their field and a unique creative perspective.",
    category: "author",
  },
  {
    id: "faq-5",
    question: "What royalties do authors receive for their books?",
    answer:
      "Authors receive 70% of the net proceeds from digital book sales and 60% from physical book sales. Royalties are paid quarterly, and detailed sales reports are provided monthly through the author dashboard.",
    category: "author",
  },
  {
    id: "faq-6",
    question: "Can I update my author profile and portfolio?",
    answer:
      "Yes, you can update your profile and portfolio at any time through the author dashboard. Changes will be reviewed by our team and typically go live within 24 hours.",
    category: "author",
  },
  {
    id: "faq-7",
    question: "What file formats do you support for book uploads?",
    answer:
      "We support PDF, EPUB, and MOBI formats for digital books. For physical books, we require print-ready PDF files with proper bleed and margin settings. Detailed specifications are available in the author guidelines.",
    category: "technical",
  },
  {
    id: "faq-8",
    question: "How do I troubleshoot login issues?",
    answer:
      "If you're having trouble logging in, try clearing your browser cache and cookies, or use a different browser. Make sure you're using the correct email address and password. If you've forgotten your password, use the 'Forgot Password' link on the login page. For persistent issues, contact our support team.",
    category: "technical",
  },
  {
    id: "faq-9",
    question: "Is my personal information secure?",
    answer:
      "Yes, we take data security very seriously. All personal information is encrypted and stored securely. We never share your information with third parties without your consent. Our platform complies with GDPR and other relevant data protection regulations.",
    category: "technical",
  },
  {
    id: "faq-10",
    question: "How do I contact customer support?",
    answer:
      "You can reach our customer support team through the 'Contact Us' page, by email at support@creativeagency.com, or by phone at +1-234-567-8900 during business hours (9 AM - 6 PM EST, Monday to Friday).",
    category: "general",
  },
  {
    id: "faq-11",
    question: "Do you offer virtual lectures?",
    answer:
      "Yes, many of our lectures are available in both in-person and virtual formats. Virtual lectures are conducted through our secure video platform and include interactive elements such as Q&A sessions and digital handouts.",
    category: "general",
  },
  {
    id: "faq-12",
    question: "How can I provide feedback on a lecture or book?",
    answer:
      "We welcome your feedback! You can leave reviews directly on the lecture or book page, or use the feedback form in your account dashboard. Your insights help us improve our offerings and assist other users in making informed decisions.",
    category: "general",
  },
]

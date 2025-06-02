import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle, ChevronRight, MessageSquare, Shield, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Acme Inc</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-primary">
              Testimonials
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
            <Link href="#faq" className="text-sm font-medium hover:text-primary">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="#contact">Contact</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="#signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Transform Your Business with Our Solution
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Streamline operations, boost productivity, and drive growth with our innovative platform.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="#signup">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#demo">
                      View Demo <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=550&width=550"
                  width={550}
                  height={550}
                  alt="Product visualization"
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-muted py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Everything You Need</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Our platform provides all the tools you need to succeed in today's competitive market.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Lightning Fast</h3>
                <p className="text-center text-muted-foreground">
                  Our optimized platform ensures quick load times and responsive interactions.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">Secure & Reliable</h3>
                <p className="text-center text-muted-foreground">
                  Enterprise-grade security with 99.9% uptime guarantee for peace of mind.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-primary/10 p-3">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">24/7 Support</h3>
                <p className="text-center text-muted-foreground">
                  Our dedicated team is always available to help you with any questions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Testimonials
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">What Our Customers Say</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Don't just take our word for it. See what our satisfied customers have to say.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col justify-between rounded-lg border p-6 shadow-sm">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    "This platform has completely transformed how we operate. The efficiency gains have been
                    remarkable."
                  </p>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <p className="text-sm font-medium">Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">CEO, TechCorp</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6 shadow-sm">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    "The customer support is exceptional. Any issues we've had were resolved quickly and
                    professionally."
                  </p>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <p className="text-sm font-medium">Michael Chen</p>
                    <p className="text-sm text-muted-foreground">CTO, GrowthLabs</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between rounded-lg border p-6 shadow-sm">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    "We've seen a 40% increase in productivity since implementing this solution. Highly recommended!"
                  </p>
                </div>
                <div className="flex items-center space-x-4 pt-4">
                  <div className="h-10 w-10 rounded-full bg-muted"></div>
                  <div>
                    <p className="text-sm font-medium">Emily Rodriguez</p>
                    <p className="text-sm text-muted-foreground">COO, Innovate Inc</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="bg-muted py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Pricing
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Simple, Transparent Pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Choose the plan that's right for your business. No hidden fees.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Starter</h3>
                  <p className="text-muted-foreground">Perfect for small businesses</p>
                </div>
                <div className="mt-4 flex items-baseline text-5xl font-bold">
                  $29<span className="ml-1 text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>5 team members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>20GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="mt-6" variant="outline" asChild>
                  <Link href="#signup">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm relative">
                <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">
                  Most Popular
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Professional</h3>
                  <p className="text-muted-foreground">For growing businesses</p>
                </div>
                <div className="mt-4 flex items-baseline text-5xl font-bold">
                  $79<span className="ml-1 text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>20 team members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>100GB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>Advanced analytics</span>
                  </li>
                </ul>
                <Button className="mt-6" asChild>
                  <Link href="#signup">Get Started</Link>
                </Button>
              </div>
              <div className="flex flex-col rounded-lg border bg-background p-6 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                  <p className="text-muted-foreground">For large organizations</p>
                </div>
                <div className="mt-4 flex items-baseline text-5xl font-bold">
                  $199<span className="ml-1 text-lg font-normal text-muted-foreground">/month</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>Unlimited team members</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>1TB storage</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>24/7 phone support</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>Custom integrations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span>Dedicated account manager</span>
                  </li>
                </ul>
                <Button className="mt-6" variant="outline" asChild>
                  <Link href="#contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">FAQ</div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Frequently Asked Questions</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl">
                  Find answers to common questions about our platform.
                </p>
              </div>
            </div>
            <div className="mx-auto max-w-3xl space-y-4 py-12">
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">How does the billing work?</h3>
                <p className="mt-2 text-muted-foreground">
                  We offer monthly and annual billing options. You can upgrade, downgrade, or cancel your plan at any
                  time.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">Can I change plans later?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, you can change your plan at any time. When upgrading, you'll be prorated for the remainder of
                  your billing cycle.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">Is there a free trial?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, we offer a 14-day free trial on all plans. No credit card required.
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="text-lg font-medium">What kind of support do you offer?</h3>
                <p className="mt-2 text-muted-foreground">
                  We offer email support for all plans, with priority support for Professional and Enterprise plans.
                  Enterprise customers also get 24/7 phone support.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="signup" className="bg-primary py-20 text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Ready to Get Started?</h2>
                <p className="max-w-[600px] md:text-xl">
                  Join thousands of satisfied customers who are already using our platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="#contact">
                    Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  asChild
                >
                  <Link href="#demo">Schedule a Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                    Contact Us
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Get in Touch</h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Have questions? Our team is here to help. Reach out to us and we'll get back to you as soon as
                    possible.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    <span>support@acmeinc.com</span>
                  </div>
                  <div className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5 text-primary" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-6 shadow-sm">
                <form className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="first-name" className="text-sm font-medium">
                        First name
                      </label>
                      <input
                        id="first-name"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="last-name" className="text-sm font-medium">
                        Last name
                      </label>
                      <input
                        id="last-name"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      className="h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="How can we help you?"
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-muted">
        <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between md:py-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Acme Inc</span>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Acme Inc. All rights reserved.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <Link href="#" className="text-sm hover:underline">
              Terms of Service
            </Link>
            <Link href="#" className="text-sm hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm hover:underline">
              Cookie Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

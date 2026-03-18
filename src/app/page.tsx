"use client"
import * as React from "react"
import { Suspense } from "react"
import { Navbar } from "@/components/shared/Navbar"
import { SplitChat } from "@/components/shared/SplitChat"
import { PromptCard } from "@/components/shared/PromptCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, Twitter, Linkedin, Instagram } from "lucide-react"
import Link from "next/link"

export const dynamic = 'force-dynamic'

// Mock Data
const MOCK_PROMPTS = [
  { id: 1, title: "SaaS Landing Page Copy", emoji: "🚀", category: "Copywriting", description: "Generate high-converting landing page copy based on your product features.", sampleOutput: "Here is your H1...", outputType: "text" as const, isMega: true },
  { id: 2, title: "React Component Gen", emoji: "⚛️", category: "Coding", description: "Create accessible React components using Tailwind CSS.", sampleOutput: "export function Hero() { ... }", outputType: "text" as const, isMega: false },
  { id: 3, title: "SEO Blog Outline", emoji: "📝", category: "Writing", description: "Generate a comprehensive outline for an SEO-optimized blog post.", sampleOutput: "H1: The Ultimate Guide...", outputType: "text" as const, isMega: false },
  { id: 4, title: "Midjourney Portrait", emoji: "📸", category: "Image", outputType: "image" as const, description: "Prompt for hyper-realistic cinematic portraits.", sampleOutput: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80", isMega: true },
  { id: 5, title: "YouTube Script", emoji: "🎬", category: "Video", description: "A structured 10-minute YouTube script template.", sampleOutput: "[Hook: 0-30s]", outputType: "text" as const, isMega: false }
]

// ContactForm component
function ContactForm() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Thank you for reaching out! We'll get back to you soon.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        setError(data.error || "Something went wrong.");
      }
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5 flex flex-col pt-2" onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Full Name</label>
          <Input placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-primary">Email</label>
          <Input type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2 pb-2">
        <label className="text-sm font-medium text-text-primary">Message</label>
        <textarea
          className="w-full min-h-[120px] rounded-btn border border-border bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-[150ms_ease] resize-y"
          placeholder="How can we help?"
          value={message}
          onChange={e => setMessage(e.target.value)}
          required
        />
      </div>
      {success && <div className="text-green-600 text-sm text-center">{success}</div>}
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <Button type="submit" className="w-full h-12 text-md" disabled={loading}>{loading ? "Sending..." : "Send Message"}</Button>
    </form>
  );
}

export default function LandingPage() {
  const [activeTab, setActiveTab] = React.useState('All')
  const tabs = ['All', 'Coding', 'Writing', 'Marketing', 'Image Generation', 'Copywriting']
  
  const filteredPrompts = MOCK_PROMPTS.filter(prompt => 
    activeTab === 'All' ? true : prompt.category === activeTab
  )

  return (
    <div className="min-h-screen animated-bg flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="py-16 md:py-24 px-4">
          <div className="container mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12 animate-in slide-in-from-bottom-5 fade-in duration-500">
              <h1 className="mb-6 text-text-primary text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
                Engineer Prompts <span className="text-accent text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">Like a Pro</span>. Test Them Instantly.
              </h1>
              <p className="text-text-secondary text-lg md:text-xl">
                Tell Derek your casual idea. He turns it into a structured, world-class prompt. Then paste it to Claude and see the magic happen.
              </p>
            </div>

            <div className="w-full max-w-6xl mx-auto animate-in slide-in-from-bottom-10 fade-in duration-700 delay-150 fill-mode-both">
              <Suspense fallback={<div>Loading...</div>}>
                <SplitChat guestMode />
              </Suspense>
            </div>
          </div>
        </section>

        {/* VIRAL PROMPTS CAROUSEL */}
        <section className="py-16 bg-bg-panel/50 border-y border-border overflow-hidden">
          <div className="container mx-auto px-4 mb-8">
            <h2 className="text-2xl font-bold text-text-primary flex items-center gap-3">
              <div className="w-1.5 h-6 bg-accent rounded-full" />
              Viral Prompts
            </h2>
          </div>

          <div className="relative overflow-hidden hide-scrollbar pb-4">
            {/* Edge fade gradients */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-[#0d1117] to-transparent z-10"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-[#0d1117] to-transparent z-10"></div>
            
            <div className="flex gap-4 animate-marquee w-max hover:[animation-play-state:paused] px-4">
              {[...MOCK_PROMPTS, ...MOCK_PROMPTS, ...MOCK_PROMPTS, ...MOCK_PROMPTS].map((prompt, i) => (
                <div key={i} className="shrink-0 w-[280px] md:w-[350px]">
                  <PromptCard {...prompt} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* POPULAR PROMPTS GRID */}
        <section className="py-20 px-4 container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <h2 className="text-3xl font-bold text-text-primary">Popular Prompts</h2>
            <div className="flex overflow-x-auto gap-2 pb-2 w-full md:w-auto hide-scrollbar">
              {tabs.map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-accent text-white' : 'bg-bg-hover text-text-secondary hover:bg-bg-panel hover:text-text-primary'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[400px]">
            {filteredPrompts.length > 0 ? (
              filteredPrompts.map((prompt, i) => (
                <PromptCard key={i} {...prompt} className="w-full" />
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center text-text-secondary h-40">
                No prompts found for this category.
              </div>
            )}
          </div>
        </section>

        {/* ABOUT US */}
        <section id="about" className="py-20 bg-bg-panel border-y border-border px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-text-primary mb-8">Built for Creators</h2>
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-xl">🎯</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-text-primary mb-1">Our Mission</h4>
                      <p className="text-text-secondary text-sm">To democratize access to world-class prompt engineering for everyone, regardless of technical background.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                      <span className="text-xl">👁️</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-text-primary mb-1">Our Vision</h4>
                      <p className="text-text-secondary text-sm">A future where human intent translates flawlessly into AI action, minimizing the syntax barrier.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative border-l border-border pl-8 space-y-10 py-4 ml-4 md:ml-12">
                {[
                  { year: "2023", text: "Started as a simple Notion template." },
                  { year: "2024", text: "Derek persona developed and tested on 10k prompts." },
                  { year: "2025", text: "EaseMyPrompt.ai platform launched." }
                ].map((item, i) => (
                  <div key={i} className="relative">
                    <div className="absolute w-3 h-3 bg-accent rounded-full -left-[38.5px] top-1.5 ring-4 ring-bg-panel" />
                    <h4 className="text-text-primary font-bold">{item.year}</h4>
                    <p className="text-text-secondary mt-1 text-sm">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section className="py-20 px-4 container mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold text-text-primary text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: "Is it really free?", a: "Yes, you get 2 free trial prompts immediately without signing up. The Free Plan gives you access to a limited prompt bank." },
              { q: "What models are supported?", a: "Currently, we proxy directly to Anthropic's Claude 3.5 Sonnet, Claude 3 Opus, and Claude 3 Haiku." },
              { q: "What is a Mega Prompt?", a: "Mega Prompts are heavily engineered, highly structured prompts designed to tackle very complex multi-step workflows. They are marked with a gold badge." }
            ].map((faq, i) => (
              <details key={i} className="bg-bg-panel border border-border rounded-lg group overflow-hidden">
                <summary className="p-5 font-medium text-text-primary cursor-pointer list-none flex justify-between items-center transition-colors hover:bg-bg-hover">
                  {faq.q}
                  <ChevronDown className="text-text-secondary group-open:rotate-180 transition-transform duration-200" size={20} />
                </summary>
                <div className="px-5 pb-5 text-text-secondary text-sm border-t border-border mt-1 pt-4 bg-bg-panel/50">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CONTACT FORM */}
        <section id="contact" className="py-24 bg-bg-panel/30 border-t border-border px-4">
          <div className="container mx-auto max-w-2xl bg-bg-panel border border-border p-8 rounded-card shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent to-accent-hover" />
            <h2 className="text-2xl font-bold text-text-primary mb-2 text-center mt-2">Get in Touch</h2>
            <p className="text-text-secondary text-sm text-center mb-8">Have a question or feedback? We&apos;d love to hear from you.</p>

            <ContactForm />
            {/* Social Links Placeholder */}
            <div className="flex flex-col items-center gap-4 mt-8">
              <div className="text-text-secondary text-sm mb-2">Connect with us:</div>
              <div className="flex gap-4">
                <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-bg-panel border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:text-accent transition-all group">
                  <Twitter size={18} className="group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-bg-panel border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:text-accent transition-all group">
                  <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
                </a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-bg-panel border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:text-accent transition-all group">
                  <Instagram size={18} className="group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-bg-panel/80 backdrop-blur-sm border-t border-border pt-16 pb-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 mb-12">
            <div className="text-center md:text-left">
              <Link href="/" className="inline-flex items-center gap-1 font-bold text-xl mb-2">
                <span className="text-text-primary">EaseMyPrompt</span>
                <span className="text-accent">.ai</span>
              </Link>
              <p className="text-text-secondary text-sm max-w-xs mt-2 leading-relaxed">Democratizing prompt engineering for a human-centric AI future.</p>
            </div>

            <div className="flex gap-8 text-sm font-medium text-text-secondary">
              <Link href="/" className="hover:text-text-primary transition-colors">Home</Link>
              <Link href="/prompt-bank" className="hover:text-text-primary transition-colors">Prompt Bank</Link>
              <Link href="#about" className="hover:text-text-primary transition-colors">About</Link>
              <Link href="#contact" className="hover:text-text-primary transition-colors">Contact</Link>
            </div>

            <div className="flex gap-4">
              <a href="#" aria-label="Twitter" className="w-10 h-10 rounded-full bg-bg-panel border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:text-accent transition-all group">
                <Twitter size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-10 h-10 rounded-full bg-bg-panel border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:text-accent transition-all group">
                <Linkedin size={18} className="group-hover:scale-110 transition-transform" />
              </a>
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-bg-panel border border-border flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-accent hover:text-accent transition-all group">
                <Instagram size={18} className="group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
          <div className="text-center text-xs text-text-secondary border-t border-border pt-8 font-medium">
            © {new Date().getFullYear()} EaseMyPrompt.ai. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}

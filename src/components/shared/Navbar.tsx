"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false)

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

    return (
        <nav className="sticky top-0 z-[100] w-full h-[60px] border-b border-border bg-bg-base/95 backdrop-blur supports-[backdrop-filter]:bg-bg-base/80">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-1 font-bold text-lg md:text-xl relative z-10">
                    <span className="text-text-primary">EaseMyPrompt</span>
                    <span className="text-accent">.ai</span>
                </Link>

                {/* Center Links (Desktop) */}
                <div className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Home</Link>
                    <Link href="/prompt-bank" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Prompt Bank</Link>
                    <Link href="/#about" className="text-sm text-text-secondary hover:text-text-primary transition-colors">About</Link>
                    <Link href="/#contact" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contact</Link>
                </div>

                {/* Right Auth actions & Mobile Toggle */}
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/signup">
                            <Button>Sign Up Free</Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={toggleMenu}
                        className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors relative z-10"
                        aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-0 bg-bg-base/98 backdrop-blur-md md:hidden animate-in fade-in duration-200">
                    <div className="flex flex-col items-center justify-center h-full gap-8 p-4">
                        <Link 
                            href="/" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-xl font-semibold text-text-primary hover:text-accent transition-colors"
                        >
                            Home
                        </Link>
                        <Link 
                            href="/prompt-bank" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-xl font-semibold text-text-primary hover:text-accent transition-colors"
                        >
                            Prompt Bank
                        </Link>
                        <Link 
                            href="/#about" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-xl font-semibold text-text-primary hover:text-accent transition-colors"
                        >
                            About
                        </Link>
                        <Link 
                            href="/#contact" 
                            onClick={() => setIsMenuOpen(false)}
                            className="text-xl font-semibold text-text-primary hover:text-accent transition-colors"
                        >
                            Contact
                        </Link>
                        
                        <div className="flex flex-col gap-4 w-full max-w-xs mt-4">
                            <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                <Button variant="outline" className="w-full">Login</Button>
                            </Link>
                            <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full">Sign Up Free</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    )
}

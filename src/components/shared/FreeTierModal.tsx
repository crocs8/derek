"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface FreeTierModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FreeTierModal({ isOpen, onClose }: FreeTierModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative bg-bg-panel border border-border rounded-card p-8 max-w-[400px] w-full mx-4 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-200">
                <h2 className="text-2xl font-semibold text-text-primary mb-3">Free trials used up</h2>
                <p className="text-text-secondary mb-8">
                    You&apos;ve used your 2 free prompts. Sign up free to keep going.
                </p>

                <div className="flex gap-4">
                    <Link href="/signup" className="flex-1">
                        <Button className="w-full">Sign Up Free</Button>
                    </Link>
                    <Link href="/login" className="flex-1">
                        <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

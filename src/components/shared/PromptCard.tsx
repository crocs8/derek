/* eslint-disable @next/next/no-img-element */
import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Play } from "lucide-react"
import { cn } from "@/lib/utils"

interface PromptCardProps {
    title: string
    emoji: string
    category: string
    description: string
    sampleOutput?: string
    outputType?: "text" | "image" | "video"
    isMega?: boolean
    className?: string
    onClick?: () => void
}

export function PromptCard({
    title,
    emoji,
    category,
    description,
    sampleOutput,
    outputType = "text",
    isMega,
    className,
    onClick,
}: PromptCardProps) {
    return (
        <Card
            onClick={onClick}
            className={cn(
                "relative flex flex-col p-5 w-[280px] h-full flex-shrink-0 cursor-pointer overflow-hidden group hover:border-accent hover:scale-[1.01] transition-all duration-150",
                className
            )}
        >
            {isMega && <Badge variant="mega" className="absolute top-3 right-3 z-10">Mega</Badge>}

            <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl leading-none">{emoji}</span>
                <div className="flex flex-col flex-1 truncate pr-[40px]">
                    <h3 className="font-semibold text-text-primary truncate">{title}</h3>
                    <span className="text-[0.7rem] bg-bg-hover text-text-secondary px-2 py-0.5 rounded-full w-fit mt-1">
                        {category}
                    </span>
                </div>
            </div>

            <p className="text-sm text-text-secondary line-clamp-3 mb-4 flex-1">
                {description}
            </p>

            {sampleOutput && (
                <div className="pt-3 border-t border-border mt-auto">
                    <p className="text-xs text-text-secondary font-medium mb-2">Sample Output</p>
                    {outputType === "text" && (
                        <p className="text-xs text-text-primary line-clamp-2 bg-bg-base/50 p-2 rounded-md font-mono">
                            {sampleOutput}
                        </p>
                    )}
                    {outputType === "image" && (
                        <div className="w-full h-16 bg-bg-base rounded-md overflow-hidden relative">
                            <img src={sampleOutput} alt="Sample" className="object-cover w-full h-full opacity-80" />
                        </div>
                    )}
                    {outputType === "video" && (
                        <div className="w-full h-16 bg-bg-base rounded-md overflow-hidden relative flex items-center justify-center">
                            <Play size={20} className="text-white opacity-80" />
                        </div>
                    )}
                </div>
            )}
        </Card>
    )
}

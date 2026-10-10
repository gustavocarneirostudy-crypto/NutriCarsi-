import React from "react"
import { Sparkles, Apple, HeartPulse } from "lucide-react"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showSubtitle?: boolean
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showSubtitle = true,
  className = "",
}) => {
  const iconSizes = {
    sm: "w-7 h-7 text-emerald-600",
    md: "w-10 h-10 text-emerald-600",
    lg: "w-13 h-13 text-emerald-600",
  }

  const containerSizes = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  }

  const titleSizes = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div
        className={`relative ${containerSizes[size]} rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-600/20 flex items-center justify-center transition-transform hover:scale-105`}
      >
        <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-50/50" />
          <svg
            className="w-3/5 h-3/5 text-emerald-600 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Elegant leaf & bowl / nutrition badge */}
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-extrabold tracking-tight text-slate-900 ${titleSizes[size]}`}
          >
            Nutri<span className="text-emerald-600">Carsi</span>
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium tracking-wider uppercase text-emerald-700/80 -mt-0.5">
            Gestão Clínica & Nutrição
          </span>
        )}
      </div>
    </div>
  )
}

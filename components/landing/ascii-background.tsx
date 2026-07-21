"use client"

import { useEffect, useState } from "react"

const originalAscii = [
  "  ____  ___  ____  _____ __        __ ___  _____  _   _   ____  _   _     _    _____ ",
  " / ___|/ _ \\|  _ \\| ____|\\ \\      / /|_ _||_   _|| | | | / ___|| | | |   / \\  |_   _|",
  "| |   | | | | | | |  _|   \\ \\ /\\ / /  | |   | |  | |_| || |    | |_| |  / _ \\   | |  ",
  "| |___| |_| | |_| | |___   \\ V  V /   | |   | |  |  _  || |___ |  _  | / ___ \\  | |  ",
  " \\____|\\___/|____/|_____|   \\_/\\_/   |___|  |_|  |_| |_| \\____||_| |_|/_/   \\_\\ |_|  "
]

const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*"

export function AsciiBackground() {
  const [ascii, setAscii] = useState(originalAscii)
  
  useEffect(() => {
    let animationFrame: number
    let lastUpdate = 0
    
    const updateAscii = (timestamp: number) => {
      // Update every 50ms for a fast matrix glitch effect
      if (timestamp - lastUpdate > 50) {
        setAscii(() => 
          originalAscii.map((line) => {
            let newLine = ""
            for (let i = 0; i < line.length; i++) {
              // Only glitch non-space characters with a 10% probability
              if (line[i] !== " " && Math.random() < 0.1) {
                newLine += charset[Math.floor(Math.random() * charset.length)]
              } else {
                newLine += line[i]
              }
            }
            return newLine
          })
        )
        lastUpdate = timestamp
      }
      animationFrame = requestAnimationFrame(updateAscii)
    }
    
    animationFrame = requestAnimationFrame(updateAscii)
    
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03] select-none">
      <pre className="font-mono text-[8px] sm:text-[10px] md:text-[14px] lg:text-[18px] font-bold text-foreground leading-none tracking-tighter whitespace-pre text-center">
        {ascii.join("\n")}
      </pre>
    </div>
  )
}

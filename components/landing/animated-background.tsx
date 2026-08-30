'use client'

import { useEffect, useRef } from 'react'

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    // Set canvas dimensions
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    window.addEventListener('resize', resize)
    resize()

    // Particle settings
    const particles: Particle[] = []
    const particleCount = Math.min(Math.floor(window.innerWidth / 8), 150)
    const connectionDistance = 200
    const mouseRadius = 300

    let mouse = { x: -1000, y: -1000 }
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY }
    }
    
    const handleMouseLeave = () => {
      mouse = { x: -1000, y: -1000 }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)

    class Particle {
      x: number
      y: number
      vx: number
      vy: number
      size: number
      baseSize: number
      color: string
      opacity: number

      constructor() {
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        this.vx = (Math.random() - 0.5) * 0.8
        this.vy = (Math.random() - 0.5) * 0.8
        this.baseSize = Math.random() * 3 + 2
        this.size = this.baseSize
        
        // Assign a base opacity for the particle
        this.opacity = Math.random() * 0.4 + 0.1
        this.color = '' // Color is decided dynamically in draw() based on theme
      }

      update() {
        // Move particle
        this.x += this.vx
        this.y += this.vy

        // Bounce off edges
        if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1
        if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1

        // Mouse interaction
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < mouseRadius) {
          // Repel slightly
          const force = (mouseRadius - distance) / mouseRadius
          this.x -= (dx / distance) * force * 1.5
          this.y -= (dy / distance) * force * 1.5
          // Increase size
          this.size = Math.min(this.baseSize * 2, 4)
        } else {
          this.size = this.baseSize
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        
        const isDark = document.documentElement.classList.contains('dark')
        ctx.fillStyle = isDark ? `rgba(255, 255, 255, ${this.opacity})` : `rgba(0, 0, 0, ${this.opacity})`
        ctx.fill()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw a subtle moving grid or waves in the background
      ctx.beginPath()
      for(let i = 0; i < canvas.height; i += 40) {
          ctx.moveTo(0, i)
          ctx.lineTo(canvas.width, i)
      }
      for(let i = 0; i < canvas.width; i += 40) {
          ctx.moveTo(i, 0)
          ctx.lineTo(i, canvas.height)
      }
      const isDark = document.documentElement.classList.contains('dark')
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
      ctx.stroke()

      // Update and draw particles
      particles.forEach(particle => {
        particle.update()
        particle.draw()
      })

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = 1 - (distance / connectionDistance)
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            
            // If mouse is near the connection, make it glow
            const midX = (particles[i].x + particles[j].x) / 2
            const midY = (particles[i].y + particles[j].y) / 2
            const mouseDist = Math.sqrt(Math.pow(mouse.x - midX, 2) + Math.pow(mouse.y - midY, 2))
            
            const isDark = document.documentElement.classList.contains('dark')
            
            if (mouseDist < mouseRadius) {
                ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacity * 0.9})` : `rgba(0, 0, 0, ${opacity * 0.9})`
                ctx.lineWidth = 1.5
            } else {
                ctx.strokeStyle = isDark ? `rgba(255, 255, 255, ${opacity * 0.2})` : `rgba(0, 0, 0, ${opacity * 0.2})`
                ctx.lineWidth = 1
            }
            
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 w-full h-full opacity-40 pointer-events-none"
      // style={{ mixBlendMode: 'screen' }}
    />
  )
}

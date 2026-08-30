'use client'

import { useEffect, useState } from 'react'

export function AnimatedWaveBackground({ variant = 'full' }: { variant?: 'full' | 'footer' }) {
  const [isDark, setIsDark] = useState(false)
  const id = variant === 'footer' ? 'footer' : 'full'

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const c = isDark ? 'white' : 'black'

  // Three distinct S-curve waves
  const wave1 = 'M -100 430 C 250 250, 480 600, 760 430 S 1180 260, 1540 450'
  const wave2 = 'M -100 380 C 200 550, 520 200, 800 380 S 1200 560, 1540 370'
  const wave3 = 'M -100 490 C 300 320, 600 640, 900 470 S 1280 300, 1540 510'

  const softOffsets = [0, 14, 28, 42, 56, 70, 84]

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg viewBox="0 0 1440 700" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id={`wg1-${id}`} x1="0" x2="1">
            <stop offset="0%"   stopColor={c} stopOpacity="0" />
            <stop offset="30%"  stopColor={c} stopOpacity="0.6" />
            <stop offset="50%"  stopColor={c} stopOpacity="1" />
            <stop offset="70%"  stopColor={c} stopOpacity="0.6" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`wg2-${id}`} x1="0" x2="1">
            <stop offset="0%"   stopColor={c} stopOpacity="0" />
            <stop offset="40%"  stopColor={c} stopOpacity="0.45" />
            <stop offset="60%"  stopColor={c} stopOpacity="0.7" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`wg3-${id}`} x1="0" x2="1">
            <stop offset="0%"   stopColor={c} stopOpacity="0" />
            <stop offset="45%"  stopColor={c} stopOpacity="0.35" />
            <stop offset="55%"  stopColor={c} stopOpacity="0.5" />
            <stop offset="100%" stopColor={c} stopOpacity="0" />
          </linearGradient>

          {/* Radial fade mask — dims center so text stays readable */}
          <radialGradient id={`cm-${id}`} cx="50%" cy="48%" r="52%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.12" />
            <stop offset="38%"  stopColor="white" stopOpacity="0.5" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </radialGradient>
          <mask id={`mask-${id}`}>
            <rect width="100%" height="100%" fill={`url(#cm-${id})`} />
          </mask>

          <filter id={`glow-${id}`} x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={`glow2-${id}`} x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g mask={`url(#mask-${id})`}>
          {/* Fan of soft lines around wave1 (+) */}
          {softOffsets.map((o) => (
            <path
              key={`pa${o}`}
              d={`M -100 ${430+o} C 250 ${250+o}, 480 ${600+o}, 760 ${430+o} S 1180 ${260+o}, 1540 ${450+o}`}
              fill="none" stroke={c} strokeOpacity={isDark ? 0.07 : 0.06} strokeWidth="1"
              style={{ animation: `breatheW ${5.5 + o*0.05}s ease-in-out infinite alternate`, animationDelay: `${o * 0.07}s` }}
            />
          ))}
          {softOffsets.map((o) => (
            <path
              key={`pb${o}`}
              d={`M -100 ${430-o} C 250 ${250-o}, 480 ${600-o}, 760 ${430-o} S 1180 ${260-o}, 1540 ${450-o}`}
              fill="none" stroke={c} strokeOpacity={isDark ? 0.05 : 0.04} strokeWidth="1"
              style={{ animation: `breatheW ${6 + o*0.05}s ease-in-out infinite alternate-reverse`, animationDelay: `${o * 0.09}s` }}
            />
          ))}

          {/* Fan of soft lines around wave2 */}
          {[0, 16, 32, 48].map((o) => (
            <path
              key={`pc${o}`}
              d={`M -100 ${380+o} C 200 ${550+o}, 520 ${200+o}, 800 ${380+o} S 1200 ${560+o}, 1540 ${370+o}`}
              fill="none" stroke={c} strokeOpacity={isDark ? 0.04 : 0.03} strokeWidth="1"
              style={{ animation: `breatheW ${7 + o*0.04}s ease-in-out infinite alternate`, animationDelay: `${o * 0.1}s` }}
            />
          ))}

          {/* MAIN wave 1 — outer halo */}
          <path
            d={wave1} fill="none"
            stroke={`url(#wg1-${id})`} strokeWidth="6"
            filter={`url(#glow2-${id})`} strokeLinecap="round"
            style={{ strokeDasharray: '280 870', animation: 'waveFlowW 7s linear infinite', opacity: 0.35 }}
          />
          {/* MAIN wave 1 — core bright line */}
          <path
            d={wave1} fill="none"
            stroke={`url(#wg1-${id})`} strokeWidth="2"
            filter={`url(#glow-${id})`} strokeLinecap="round"
            style={{ strokeDasharray: '250 900', animation: 'waveFlowW 7s linear infinite' }}
          />

          {/* MAIN wave 2 */}
          <path
            d={wave2} fill="none"
            stroke={`url(#wg2-${id})`} strokeWidth="1.5"
            filter={`url(#glow-${id})`} strokeLinecap="round"
            style={{ strokeDasharray: '200 1000', animation: 'waveFlowW2 10s linear infinite', animationDelay: '1.5s' }}
          />

          {/* MAIN wave 3 */}
          <path
            d={wave3} fill="none"
            stroke={`url(#wg3-${id})`} strokeWidth="1"
            strokeLinecap="round"
            style={{ strokeDasharray: '180 1100', animation: 'waveFlowW3 13s linear infinite', animationDelay: '3s', opacity: 0.6 }}
          />

          {/* Particles wave1 fast */}
          <path d={wave1} fill="none" stroke={c} strokeWidth="3" strokeLinecap="round"
            strokeDasharray="3 60"
            style={{ animation: 'particleFlowW 4.5s linear infinite', opacity: isDark ? 0.9 : 0.7 }}
          />
          {/* Particles wave1 slow */}
          <path d={wave1} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="1 100"
            style={{ animation: 'particleFlowW 8s linear infinite', opacity: isDark ? 0.55 : 0.4, animationDelay: '2s' }}
          />
          {/* Particles wave2 */}
          <path d={wave2} fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"
            strokeDasharray="2 80"
            style={{ animation: 'particleFlowW2 6s linear infinite', opacity: isDark ? 0.6 : 0.45, animationDelay: '1s' }}
          />
          {/* Particles wave3 */}
          <path d={wave3} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round"
            strokeDasharray="2 120"
            style={{ animation: 'particleFlowW3 11s linear infinite', opacity: isDark ? 0.4 : 0.3, animationDelay: '4s' }}
          />
        </g>
      </svg>

      {/* Ambient edge glows */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[300px] h-[400px] rounded-full blur-[80px]"
        style={{ background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.025)' }} />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[300px] h-[400px] rounded-full blur-[80px]"
        style={{ background: isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.025)' }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[200px] rounded-full blur-[120px]"
        style={{ background: isDark ? 'rgba(255,255,255,0.012)' : 'rgba(0,0,0,0.018)' }} />

      <style>{`
        @keyframes waveFlowW     { from { stroke-dashoffset: 1150; } to { stroke-dashoffset: 0; } }
        @keyframes waveFlowW2    { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
        @keyframes waveFlowW3    { from { stroke-dashoffset: 1280; } to { stroke-dashoffset: 0; } }
        @keyframes particleFlowW { from { stroke-dashoffset: 520;  } to { stroke-dashoffset: 0; } }
        @keyframes particleFlowW2{ from { stroke-dashoffset: 600;  } to { stroke-dashoffset: 0; } }
        @keyframes particleFlowW3{ from { stroke-dashoffset: 700;  } to { stroke-dashoffset: 0; } }
        @keyframes breatheW      { from { opacity:.15; transform:translateY(-6px); } to { opacity:.65; transform:translateY(6px); } }
      `}</style>
    </div>
  )
}

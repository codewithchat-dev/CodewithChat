import { cn } from '@/lib/utils'
import Image from 'next/image'

export function SiteLogo({ className }: { className?: string }) {
  return (
    <span className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}>
      <Image
        src="/light_logo.png"
        alt="CodewithChat Logo"
        width={28}
        height={28}
        className="object-contain dark:hidden"
      />

        <Image
          src="/dark_logo.png"
          alt="CodewithChat Logo"
          width={28}
          height={28}
          className="hidden object-contain dark:block"
        />
      <span className="text-sm">
        CodewithChat
      </span>
    </span>
  )
}

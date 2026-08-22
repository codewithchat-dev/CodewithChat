import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/create-project?idea=...
// Creates a project and redirects to the project page directly
export async function GET(req: NextRequest) {
  const { userId } = await auth()
  
  if (!userId) {
    // Not logged in — redirect to sign-in
    const url = req.nextUrl.clone()
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  const idea = req.nextUrl.searchParams.get('idea') || 'Untitled Project'

  try {
    // Ensure user exists in DB
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!dbUser) {
      const user = await currentUser()
      const email = user?.emailAddresses[0]?.emailAddress || ''
      
      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email: email,
          credits: 5
        }
      })
    }

    // Create the project
    const project = await db.project.create({
      data: {
        userId: dbUser.id,
        title: idea,
        prompt: idea,
      }
    })

    // Redirect directly to the project page
    const tech = 'React + Tailwind'
    const platform = 'Website'
    const agent = 'Gemini 3.5 Flash'
    
    const projectUrl = new URL(`/dashboard/project/${project.id}`, req.nextUrl.origin)
    projectUrl.searchParams.set('tech', tech)
    projectUrl.searchParams.set('platform', platform)
    projectUrl.searchParams.set('agent', agent)

    return NextResponse.redirect(projectUrl)
  } catch (error) {
    console.error('Failed to create project:', error)
    // Fallback to dashboard on error
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl.origin))
  }
}

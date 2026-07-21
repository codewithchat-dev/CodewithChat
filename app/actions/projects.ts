'use server'

import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Helper to ensure the user exists in DB to prevent foreign key errors
async function ensureDbUser() {
  const { userId } = await auth()
  if (!userId) throw new Error('Unauthorized')

  let dbUser = await db.user.findUnique({
    where: { clerkId: userId }
  })

  // If user signed up before webhooks were active, create them on the fly
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
  return dbUser
}

export async function getProjects() {
  try {
    const dbUser = await ensureDbUser()
    const projects = await db.project.findMany({
      where: { userId: dbUser.id },
      orderBy: { updatedAt: 'desc' }
    })
    return { success: true, data: projects }
  } catch (error: any) {
    console.error('Failed to get projects:', error)
    return { success: false, error: error.message }
  }
}

export async function addProjectAction(title: string, prompt: string, code?: string) {
  try {
    const dbUser = await ensureDbUser()
    const project = await db.project.create({
      data: {
        userId: dbUser.id,
        title,
        prompt,
        code
      }
    })
    revalidatePath('/dashboard')
    return { success: true, data: project }
  } catch (error: any) {
    console.error('Failed to add project:', error)
    return { success: false, error: error.message }
  }
}

export async function updateProjectAction(projectId: string, code: string) {
  try {
    const dbUser = await ensureDbUser()
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (project?.userId !== dbUser.id) throw new Error('Unauthorized')

    const updated = await db.project.update({
      where: { id: projectId },
      data: { code }
    })
    revalidatePath('/dashboard')
    return { success: true, data: updated }
  } catch (error: any) {
    console.error('Failed to update project:', error)
    return { success: false, error: error.message }
  }
}

export async function getProjectByIdAction(projectId: string) {
  try {
    const dbUser = await ensureDbUser()
    const project = await db.project.findUnique({
      where: { id: projectId }
    })
    if (project?.userId !== dbUser.id) throw new Error('Unauthorized')
    return { success: true, data: project }
  } catch (error: any) {
    console.error('Failed to get project:', error)
    return { success: false, error: error.message }
  }
}

export async function deleteProjectAction(projectId: string) {
  try {
    const dbUser = await ensureDbUser()
    
    // Verify ownership
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (project?.userId !== dbUser.id) throw new Error('Unauthorized')

    await db.project.delete({
      where: { id: projectId }
    })
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to delete project:', error)
    return { success: false, error: error.message }
  }
}

export async function togglePinProjectAction(projectId: string, isPinned: boolean) {
  try {
    const dbUser = await ensureDbUser()
    
    // Verify ownership
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (project?.userId !== dbUser.id) throw new Error('Unauthorized')

    await db.project.update({
      where: { id: projectId },
      data: { isPinned }
    })
    
    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to toggle pin:', error)
    return { success: false, error: error.message }
  }
}

export async function renameProjectAction(projectId: string, title: string) {
  try {
    const dbUser = await ensureDbUser()
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (project?.userId !== dbUser.id) throw new Error('Unauthorized')

    await db.project.update({
      where: { id: projectId },
      data: { title }
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    console.error('Failed to rename project:', error)
    return { success: false, error: error.message }
  }
}

import { NextResponse } from 'next/server'
import { Octokit } from 'octokit'

export async function POST(req: Request) {
  try {
    const { repoName, token, files } = await req.json()

    if (!repoName || !token || !files || !files.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const octokit = new Octokit({ auth: token })

    // 1. Get authenticated user
    const { data: user } = await octokit.rest.users.getAuthenticated()
    const owner = user.login

    // 2. Create the repository
    try {
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        private: true,
        auto_init: true, // creates an initial commit
      })
    } catch (error: any) {
      if (error.status !== 422) { // 422 means repo already exists
        return NextResponse.json({ error: 'Failed to create repository: ' + error.message }, { status: 500 })
      }
    }

    // Wait a moment for repo initialization
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 3. Get the latest commit SHA from main branch
    const { data: refData } = await octokit.rest.git.getRef({
      owner,
      repo: repoName,
      ref: 'heads/main',
    }).catch(async () => {
      // Fallback to master if main doesn't exist
      return await octokit.rest.git.getRef({
        owner,
        repo: repoName,
        ref: 'heads/master',
      })
    })

    const latestCommitSha = refData.object.sha

    // 4. Get the tree SHA of the latest commit
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner,
      repo: repoName,
      commit_sha: latestCommitSha,
    })
    const baseTreeSha = commitData.tree.sha

    // 5. Create blobs for all files and build the tree array
    const tree = await Promise.all(
      files.map(async (file: any) => {
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner,
          repo: repoName,
          content: file.content,
          encoding: 'utf-8',
        })
        
        // Remove leading slash if exists
        const path = file.path.startsWith('/') ? file.path.substring(1) : file.path

        return {
          path,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: blobData.sha,
        }
      })
    )

    // 6. Create a new tree
    const { data: newTreeData } = await octokit.rest.git.createTree({
      owner,
      repo: repoName,
      base_tree: baseTreeSha,
      tree,
    })

    // 7. Create a new commit
    const { data: newCommitData } = await octokit.rest.git.createCommit({
      owner,
      repo: repoName,
      message: 'Initial full-stack commit from CodewithChat AI',
      tree: newTreeData.sha,
      parents: [latestCommitSha],
    })

    // 8. Update the reference
    await octokit.rest.git.updateRef({
      owner,
      repo: repoName,
      ref: refData.ref.replace('refs/', ''),
      sha: newCommitData.sha,
    })

    return NextResponse.json({ success: true, url: `https://github.com/${owner}/${repoName}` })

  } catch (error: any) {
    console.error('GitHub Push Error:', error)
    return NextResponse.json({ error: error.message || 'Unknown error occurred' }, { status: 500 })
  }
}

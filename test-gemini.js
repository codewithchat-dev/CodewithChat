const { generateObject } = require('ai')
const { createGoogleGenerativeAI } = require('@ai-sdk/google')
const { z } = require('zod')
require('dotenv').config({ path: '.env.local' })

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY
})

async function test() {
  try {
    const { object } = await generateObject({
      model: google('gemini-1.5-flash'),
      prompt: 'Idea: test\nSkill Level: Beginner\nPreferred Stack: Postgres',
      schema: z.object({
        problem: z.string(),
        features: z.array(z.string()),
        mvp: z.array(z.string()),
        stack: z.array(z.object({
          layer: z.string(),
          choice: z.string(),
          why: z.string()
        })),
        architecture: z.array(z.string())
      })
    })
    console.log("SUCCESS:")
    console.log(JSON.stringify(object, null, 2))
  } catch (err) {
    console.error("ERROR:")
    console.error(err)
  }
}

test()

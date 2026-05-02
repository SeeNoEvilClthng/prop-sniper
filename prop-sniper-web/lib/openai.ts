import OpenAI from 'openai'

let cachedClient: OpenAI | null = null

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('Missing credentials. Please pass an apiKey or set the OPENAI_API_KEY environment variable.')
  }

  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return cachedClient
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/config'
import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'

const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message } = await request.json()

    // Fetch user's tasks and projects for context
    const tasks = await prisma.task.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        project: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    })

    const prompt = `You are an AI assistant helping with task and project management. The user has the following tasks:

Task Context:
\`\`\`json
${JSON.stringify(tasks, null, 2)}
\`\`\`

User Message: ${message}

Please provide a helpful response that:
1. Is relevant to task/project management
2. Uses the context of their tasks when appropriate
3. Provides actionable suggestions
4. Uses markdown formatting for better readability
5. Keeps responses concise and focused

Format your response using:
- **Bold** for emphasis
- \`code blocks\` for data
- Lists for steps or suggestions
- ### Headers for sections
- > Blockquotes for important notes`

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent(prompt)
    const response = await result.response

    return NextResponse.json({ response: response.text() })
  } catch (error) {
    console.error('Assistant chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    )
  }
} 
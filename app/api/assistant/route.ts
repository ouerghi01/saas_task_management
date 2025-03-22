import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/app/api/auth/[...nextauth]/config'

import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI } from '@google/generative-ai'

const prisma = new PrismaClient()
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

// Sleep function to add delay between requests
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's tasks and projects
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

    // Analyze tasks and generate insights
    const taskAnalysis = await analyzeTasks(tasks)
    
    // Add delay between requests
    await sleep(2000) // 2 second delay
    
    // Generate recommendations
    const recommendations = await generateRecommendations(tasks, taskAnalysis || '')

    return NextResponse.json({
      analysis: taskAnalysis,
      recommendations,
    })
  } catch (error) {
    console.error('Assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}

async function analyzeTasks(tasks: any[]) {
  const taskDescriptions = tasks.map(task => ({
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
    project: task.project.name,
  }))

  const prompt = `Analyze the following tasks and provide insights using proper markdown formatting:

# Task Analysis

## Current Task Overview
\`\`\`json
${JSON.stringify(taskDescriptions, null, 2)}
\`\`\`

## Task Distribution
- Analyze how tasks are distributed across different statuses
- What does this distribution tell us about project health?

## Deadlines and Risks
- Identify upcoming deadlines and their implications
- Highlight potential risks or bottlenecks
- Flag tasks that need immediate attention

## Workload Distribution
- Examine work distribution across projects
- Identify projects that may need more attention
- Assess resource allocation

## Priority Analysis
- Evaluate task priority patterns
- Suggest priority adjustments if needed
- Identify critical path tasks

Please provide a detailed analysis using proper markdown formatting:
- Use **bold** for emphasis
- Use bullet points for lists
- Use \`code blocks\` for data and metrics
- Use headings for organization
- Use tables where appropriate`

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

async function generateRecommendations(tasks: any[], analysis: string) {
  const prompt = `Based on the following task analysis, provide actionable recommendations using proper markdown formatting:

# Recommendations

## Task Management
### Immediate Actions
- What specific steps should be taken to improve task organization?
- How can tasks be better structured or broken down?
- What processes need to be implemented?

## Workload Optimization
### Process Improvements
- How can the workload be better distributed?
- What workflows could be optimized?
- What tools or automations could help?

## Deadline Management
### Strategic Planning
- What strategies should be implemented for deadline tracking?
- How can we prevent deadline risks?
- What monitoring systems should be put in place?

## Project Organization
### Structural Improvements
- What project-level improvements would you recommend?
- How can project structure be enhanced?
- What best practices should be adopted?

Analysis: ${analysis}

Tasks: 
\`\`\`json
${JSON.stringify(tasks, null, 2)}
\`\`\`

Please provide detailed, actionable recommendations:
- Use **bold** for key points
- Use > blockquotes for important notes
- Use \`code blocks\` for specific examples
- Use numbered lists for step-by-step instructions
- Use ### headers for subsections
- Use --- for section breaks`

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
} 
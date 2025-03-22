# TaskFlow Pro - Project Management for Freelancers

TaskFlow Pro is a streamlined project management SaaS platform designed specifically for freelancers and small business owners. It helps you manage client projects, track time, and streamline your workflow.

## Features

- Project and task management
- Client portal
- Time tracking
- Basic reporting
- Subscription-based access

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Stripe (for payments)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
4. Set up the database:
   ```bash
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/taskflow"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
```

## License

MIT 
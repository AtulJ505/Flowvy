# Flowvy — Visual Workflow Builder

A visual editor for text, image, video, and LLM workflows, built with TypeScript, React Flow, Next.js, and Trigger.dev. This project began as a UI study inspired by Weavy.ai; it is an independent project and is not affiliated with Weavy.

[![Workflow tests](https://github.com/AtulJ505/Flowvy/actions/workflows/ci.yml/badge.svg)](https://github.com/AtulJ505/Flowvy/actions/workflows/ci.yml)

## Features

- 🎨 Visual canvas for connecting workflow nodes
- 🔐 Clerk authentication with protected routes
- 🔄 6 node types: Text, Upload Image, Upload Video, LLM, Crop Image, Extract Frame
- 🌊 React Flow canvas with dot grid background and minimap
- 📊 Workflow history with node-level execution details
- ⚡ Parallel execution for independent workflow branches
- 🔒 Type-safe connections with DAG validation
- 💾 Workflow persistence to PostgreSQL
- 🎯 Trigger.dev integration for all node executions

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety throughout
- **PostgreSQL** - Database (use Supabase, Neon, or similar)
- **Prisma** - ORM for database access
- **Clerk** - Authentication
- **React Flow** - Visual workflow/node graph
- **Trigger.dev** - All node execution
- **Transloadit** - File uploads and media processing
- **Google Generative AI** - Gemini API for LLM
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Zod** - Schema validation

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and fill in your API keys:
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
   - `CLERK_SECRET_KEY` - Clerk secret key
   - `GOOGLE_AI_API_KEY` - Google Gemini API key
   - `TRIGGER_API_KEY` - Trigger.dev API key
   - `NEXT_PUBLIC_TRANSLOADIT_KEY` - Transloadit key
   - `TRANSLOADIT_SECRET` - Transloadit secret

3. **Set up the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Run Trigger.dev in development:**
   ```bash
   npm run trigger:dev
   ```

## Getting API Keys

- **Google AI**: Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Clerk**: Sign up at [clerk.com](https://clerk.com)
- **Trigger.dev**: Sign up at [trigger.dev](https://trigger.dev)
- **Transloadit**: Sign up at [transloadit.com](https://transloadit.com)
- **PostgreSQL**: Use [Supabase](https://supabase.com) or [Neon](https://neon.tech) for a free database

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/            # React components
│   ├── nodes/            # Node components
│   ├── WorkflowCanvas.tsx
│   ├── LeftSidebar.tsx
│   └── RightSidebar.tsx
├── lib/                   # Utility functions
│   ├── db.ts             # Prisma client
│   ├── store.ts          # Zustand store
│   ├── types.ts          # TypeScript types
│   └── utils.ts          # Utility functions
├── prisma/               # Prisma schema
│   └── schema.prisma
└── trigger/              # Trigger.dev tasks
    ├── llm-task.ts
    ├── crop-image-task.ts
    └── extract-frame-task.ts
```

## Node Types

### Text Node
Simple text input with textarea and output handle for text data.

### Upload Image Node
File upload via Transloadit. Accepts: jpg, jpeg, png, webp, gif. Shows image preview after upload.

### Upload Video Node
File upload via Transloadit. Accepts: mp4, mov, webm, m4v. Shows video player preview after upload.

### Run Any LLM Node
- Model selector dropdown (Gemini models)
- Accepts system prompt, user message, and images (supports multiple)
- Executes via Trigger.dev task
- Displays response inline on the node

### Crop Image Node
- Accepts image input
- Configurable crop parameters (x%, y%, width%, height%)
- Executes via FFmpeg on Trigger.dev

### Extract Frame from Video Node
- Accepts video URL input
- Configurable timestamp parameter (seconds or percentage)
- Extracts a single frame as image
- Executes via FFmpeg on Trigger.dev

## Workflow Features

- **Drag & Drop Nodes**: Add nodes from sidebar to canvas
- **Node Connections**: Connect output handles to input handles with animated edges
- **Configurable Inputs**: All node parameters configurable via handles OR manual entry
- **Type-Safe Connections**: Enforced type validation
- **DAG Validation**: Prevents circular dependencies
- **Selective Execution**: Run single node, selected nodes, or full workflow
- **Parallel Execution**: Independent branches execute concurrently
- **Workflow Persistence**: Save/load workflows to database
- **Export/Import**: Export workflows as JSON

## Workflow History

The right sidebar shows:
- List of all workflow runs with timestamps
- Execution scope (full/partial/single)
- Status indicators (success/failed/running)
- Node-level execution details when clicking a run
- Inputs/outputs for each node execution

## Sample Workflow

The project includes a pre-built sample workflow demonstrating:
- All 6 node types
- Parallel execution of independent branches
- Convergence point with multiple inputs
- Input chaining across nodes

## Workflow validation and tests

```bash
npm ci --ignore-scripts
npm test
```

The test suite runs without external credentials. It checks long-cycle detection, dependency ordering, imported JSON validation, workflow round trips, and preservation of empty input values. CI runs these workflow tests for pushes and pull requests.

Imported workflows must have unique node and edge IDs, reference existing nodes, and form an acyclic graph. Cyclic execution plans fail with an explicit error instead of silently omitting nodes.

For full application development, use the normal installation and setup steps above, including Prisma generation and cloud-service configuration. The workflow unit suite does not validate deployed authentication, the database, or external media and LLM execution. Dependency updates and deployment validation remain necessary before production use.

## Contributing

Report bugs with a minimal workflow JSON and reproduction steps, excluding credentials and private media URLs. Include a regression test for workflow-logic changes and run `npm test` before submitting a pull request.

## Deployment

Deploy to Vercel:

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## License

MIT

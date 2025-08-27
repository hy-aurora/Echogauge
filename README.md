## EchoGauge

A fast, serverless social-content analyzer that ingests PDFs/images, extracts text, and suggests engagement improvements.

Live architecture: Next.js (App Router) + shadcn/ui + Tailwind, Clerk auth, Convex (DB + functions). Deployed on Vercel.

### Approach (≈200 words)

EchoGauge is a serverless Next.js application that helps users improve social media content by extracting text from uploaded PDFs and images and generating actionable suggestions. Authentication is handled by Clerk, while Convex provides a simple, scalable backend for data storage and serverless functions. Users can drag and drop files into the UI (built with shadcn/ui and Tailwind) and see clear loading states as the app parses PDFs or runs OCR on images via Tesseract. Extracted text is analyzed with a lightweight rule-based engine that scores readability, headline strength, calls-to-action, and link/hashtag usage. Suggestions are presented in a concise, copy-ready format, and completed analyses are stored so users can revisit prior results. The architecture emphasizes clean, production-ready code, basic error handling, and friendly UX. It deploys on Vercel with Convex for effortless scaling. Optional AI calls can be enabled for more nuanced rewriting, but the core functionality works without paid services. The repository includes setup instructions and design decisions. Deliverables include a hosted URL and the GitHub repository link, meeting the assessment’s time and scope requirements.

### Quickstart

1) Install deps
	- Node 18+ recommended
	- npm install

2) Env
	- Create `.env.local` with:
	  - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
	  - CLERK_SECRET_KEY=
	  - NEXT_PUBLIC_CONVEX_URL=

3) Dev
	- npm run dev
	- Visit http://localhost:3000

4) Build
	- npm run build && npm start

### Features
- Auth: Clerk, middleware-protected routes (/dashboard, /session/[id])
- Upload: drag & drop with size/type validation (PDF, PNG, JPG)
- UX: progress stages, help modal, toasts, dark/light/system theme (single-click toggle)
- Results: session tabs (Extracted Text, Insights, Suggestions)
- Export: session-level Markdown/PDF buttons
- History: recent analyses list (placeholder wired for Convex)

### Backend wiring (Convex)
- files.createUploadUrl → signed URL; files.markUploaded
- extract.fromPdf/fromImage → parse/OCR then save text
- analyze.run → compute metrics & suggestions
- history.list/get → list sessions and load detail

### Deployment
- Vercel: set env vars, connect GitHub repo, deploy
- Convex: provision project, set NEXT_PUBLIC_CONVEX_URL
- Clerk: configure application and allowed origins

### Notes
- Accessibility: keyboard/tabs, contrast via shadcn themes
- Security: signed URLs, size/type checks, Clerk token validation, row-level scoping

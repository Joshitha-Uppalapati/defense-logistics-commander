
# Architecture

**Goal:** AI‑native command center for defense logistics.

- **Web (apps/web)**: Vite static SPA for demo (replace with Next.js in production). Quoting workspace UI.
- **API (apps/api)**: Express + Prisma for speed here (Nest-like project constraints). RFQs listing and quote creation with audit logs.
- **DB (packages/db)**: Prisma schema backing Postgres; normalized RFQ/Quote/Part relations, with audit logging.
- **Ingestor (services/ingestor)**: Parses legacy ERP CSV and GOV XML; idempotent upserts; designed for cron/queue execution.

**Why these choices**
- TypeScript across the stack → code quality + velocity
- Prisma → developer speed and typed queries
- Interface-driven ingestion → easily swap in S3/FTP, Textract/GCV OCR, etc.
- Dockerized Postgres → trivial local setup

**Future**
- Replace SPA with Next.js App Router + server actions and RBAC
- Add message bus (e.g., RabbitMQ) for large ingest jobs
- Add ML scoring for win probability using historicals

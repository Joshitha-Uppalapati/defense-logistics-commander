
# Defense Logistics Commander (SalesPatriot‑Aligned Full‑Stack Project)

An AI‑native command center prototype for defense logistics and quoting. Built to mirror the work you'd do at SalesPatriot:
- ERP ingestion from archaic CSV/XML exports
- Parsing RFQs, supplier quotes, and government solicitations (sample PDFs + extractors)
- Dynamic, revenue‑driving quoting workflows
- End‑to‑end TypeScript: Next.js app, NestJS API, Postgres (Prisma), and a TS ingestion pipeline
- Operational focus: deadlines, ownership, code quality, and customer‑centric features

## Why this repo helps me stand out
- Demonstrates mastery of TypeScript, React/Next, Node/Nest, and Postgres
- Shows ability to integrate with legacy formats and deliver features used by forward‑deployed teams
- Exhibits code quality: typing, linting, tests, docs, and clear delivery milestones
- Includes a "Trial by Fire" demo plan to simulate an on‑site implementation week

---

## Monorepo Layout

```
defense-logistics-commander/
  apps/
    web/            # Next.js 14 (App Router) - Customer-facing UI
    api/            # NestJS REST API - Business logic
  services/
    ingestor/       # TypeScript workers for ERP/RFQ/Quote ingestion
  packages/
    db/             # Prisma schema + migrations
    shared/         # Shared TS types and utilities
  sql/
    seed.sql        # Quick SQL seed for local dev
  infra/
    docker-compose.yml  # Postgres + Adminer + (optional) RabbitMQ
  docs/
    demo-scripts/   # Loom/video demo scripts + runbooks
    architecture.md # Diagrams + design choices
  sample_data/      # CSV/XML/PDF samples
```

---

## Quick Start (Local)

1) Start services
```bash
docker compose -f infra/docker-compose.yml up -d
```

2) Apply schema and seed
```bash
# from packages/db
npm install
npx prisma generate
psql -h localhost -U postgres -d dlc -f ../../sql/seed.sql
```

3) Run API
```bash
# in apps/api
npm install
npm run start:dev
```

4) Run Web
```bash
# in apps/web
npm install
npm run dev
```

5) Run Ingestor
```bash
# in services/ingestor
npm install
npm run dev
```

---

## Core Features (MVP)
- Upload or watch FTP folder for ERP CSV/XML and gov solicitation PDFs
- Parse to normalized Postgres tables: `rfqs`, `parts`, `suppliers`, `quotes`, `line_items`
- Quoting workspace: filter RFQs, attach quotes, compute win-probability and margin
- Revenue‑linked metrics: value of quotes sent, turnaround time, win rate
- Auditability: per‑field change log, who changed what and when

## Stretch Features
- "Workflow recipes" (JSON) that define dynamic steps per customer segment
- Role‑based views for Forward Deployed vs Platform engineers
- OCR provider adapters (`stub` + `textract`, `gcv`) with switchable strategy pattern
- Message bus events for long‑running ingest jobs

---

## On‑Site Trial Plan (5 Days)
**Day 1**: Connect to sample ERP exports, ingest 50K rows, verify dedupe and joins  
**Day 2**: Prototype RFQ-to-Quote flow; deliver a live customer quote in UI  
**Day 3**: Implement margin+lead-time scoring, expose metrics dashboard  
**Day 4**: Harden error paths, add audit logs; ship to demo environment  
**Day 5**: Founder review; generate report of revenue impact and cycle time

---

## Code Quality
- TypeScript strict mode across repo
- ESLint + Prettier configs
- Unit tests for parsing/normalization pipeline (Jest)
- End‑to‑end tests for critical quoting path (Playwright, stubbed)

---

## Demo Script (Loom)
- 60s mission context → 3 min ingest demo → 4 min quote flow → 2 min metrics → 1 min code tour
- Include “trial by fire” section: intentionally break a CSV, show robust error handling and recovery

---

## Credentials
No external credentials are required. OCR and message bus are stubbed but interface-driven to be swapped later.

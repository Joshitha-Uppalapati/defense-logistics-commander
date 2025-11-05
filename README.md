
AI-native command center for quoting. Ingests ERP & gov solicitations, normalizes RFQs, and turns them into quotes with auditability and fast feedback.

**Why it matters**  
Teams still stitch emails, PDFs, and ERP exports. This replaces that with a single workflow that’s fast, traceable, and easy to extend.

## Quick start
```bash
# 1) DB (Docker Desktop running)
docker compose -f infra/docker-compose.yml up -d

# 2) Prisma
cd packages/db
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate

# 3) Seed
psql "postgresql://postgres:postgres@localhost:5432/dlc" -f ../../sql/seed.sql

# 4) API
cd ../../apps/api
npm install
npm run start:dev   

# 5) Web
cd ../web
npm install
npm run dev         

# 6) Ingest 
cd ../../services/ingestor
npm install
npm run dev
```bash
cd ~/Library/Mobile\ Documents/com~apple~CloudDocs/Documents/Projects/defense-logistics-commander
git add README.md
git commit -m "docs: production-style README with quick start and demo"
git push

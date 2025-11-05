# 🛠 Defense Logistics Commander

AI-native full-stack command center for quoting and supply chain automation.  
Ingests ERP and government solicitation data, normalizes RFQs, and turns them into quotes with traceability and real-time feedback.

## Why It Matters
Defense distributors and manufacturers still manage quotes through emails, PDFs, and outdated ERP exports.  
This system replaces that manual process with a unified workflow that’s faster, auditable, and easier to extend.

# Quick Start

### 1. Database (Docker)
```bash
docker compose -f infra/docker-compose.yml up -d
```

### 2. Prisma
```bash
cd packages/db
cp .env.example .env
npx prisma migrate dev --name init
npx prisma generate
```

### 3. Seed
```bash
psql "postgresql://postgres:postgres@localhost:5432/dlc" -f ../../sql/seed.sql
```

### 4. API
```bash
cd ../../apps/api
npm install
npm run start:dev
``` 

### 5) Web
```bash
cd ../web
npm install
npm run dev
```  

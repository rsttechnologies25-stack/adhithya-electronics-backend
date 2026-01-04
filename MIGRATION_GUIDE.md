# Adhithya Electronics - PostgreSQL Migration Guide

## Overview
This guide helps you migrate from SQLite (development) to PostgreSQL (production) for Render deployment.

## Data Export Summary
- **Users**: 3
- **Categories**: 10
- **Products**: 10
- **Branches**: 3
- **Branch Reviews**: 2
- **Partners**: 1
- **Testimonials**: 1
- **Sample Orders Excluded**: 35

## Migration Steps

### 1. Set Up PostgreSQL on Render
1. Create a new PostgreSQL database on Render
2. Copy the connection string (looks like `postgresql://user:pass@host:5432/db`)

### 2. Update Schema for PostgreSQL
```bash
# In backend folder, update schema.prisma:
# Change: provider = "sqlite"
# To: provider = "postgresql"
# Change: url = "file:./dev.db"
# To: url = env("DATABASE_URL")
```

### 3. Set Environment Variable
```bash
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

### 4. Run Migrations
```bash
npx prisma db push
# OR
npx prisma migrate deploy
```

### 5. Import Data
```bash
npx ts-node scripts/import-data.ts data-export-2026-01-04.json
```

## Files Created
- `scripts/export-data.ts` - Exports real data from SQLite
- `scripts/import-data.ts` - Imports data into PostgreSQL
- `data-export-2026-01-04.json` - Exported data file
- `.env.example` - Environment variable template

## Notes
- Sample orders (35) were excluded from export
- All real data is preserved
- Run export script again if you add more real data before deployment

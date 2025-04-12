# Database Setup Guide

This guide explains how to set up the database for the Template Builder application.

## Quick Setup

To set up the database and add a sample template, run:

```bash
npm run db:setup
```

This single command will:
1. Generate the Prisma client
2. Push the schema to the database (creating all tables)
3. Seed the database with a sample template

## What's Happening

When you run the setup command, here's what happens:

1. `npx prisma generate` creates TypeScript types for your Prisma models
2. `npx prisma db push` creates the SQLite database with all tables defined in schema.prisma
3. `node prisma/seed.js` adds a sample template with sections to the database

## Database Location

The database is a SQLite file stored at:
- `./db.sqlite` (in the project root)

## Manual Steps

If you prefer to run each step individually:

1. Generate the Prisma client:
   ```
   npm run prisma:generate
   ```

2. Create the database and tables:
   ```
   npm run prisma:push
   ```

3. Seed the database with sample data:
   ```
   npm run prisma:seed
   ```

## Verifying It Works

After setting up the database, you can verify it works by:

1. Starting the development server:
   ```
   npm run dev
   ```

2. Visiting the verification endpoint:
   ```
   http://localhost:3000/api/verify-templates
   ```

You should see JSON output showing the sample template data that was added.

## Troubleshooting

If you encounter issues:

1. Make sure Prisma is installed:
   ```
   npm install @prisma/client prisma
   ```

2. Check if the database file exists:
   ```
   ls -la db.sqlite
   ```

3. Restart the application after setting up the database:
   ```
   npm run dev
   ```

4. If all else fails, delete the database file and start over:
   ```
   rm db.sqlite
   npm run db:setup
   ```
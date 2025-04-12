import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs';
import path from 'path';

// GET /api/verify-templates - Debug endpoint to check templates
export async function GET() {
  try {
    // Check for database files
    const dbFiles = [];
    const rootDir = path.resolve('./');
    
    // Check for db.sqlite in root directory
    if (fs.existsSync(path.join(rootDir, 'db.sqlite'))) {
      dbFiles.push('db.sqlite exists');
    }
    
    // Get current working directory
    const cwd = process.cwd();
    
    // Fetch all templates with their sections
    const templates = await prisma.template.findMany({
      include: {
        sections: true
      }
    });

    // Get database URL from Prisma client
    const databaseUrl = (prisma as any)._engineConfig?.datasources?.db?.url || 'unknown';

    return NextResponse.json({
      message: "Database check completed",
      count: templates.length,
      templates,
      debug: {
        cwd,
        dbFiles,
        databaseUrl,
        prismaClientVersion: (prisma as any)._clientVersion
      }
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch templates',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
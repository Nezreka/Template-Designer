import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/templates - Get all templates
export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { sections: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}

// POST /api/templates - Create a new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.name) {
      return NextResponse.json({ error: 'Template name is required' }, { status: 400 });
    }

    // Check if a template with this name already exists
    const existingTemplate = await prisma.template.findUnique({
      where: { name: body.name }
    });

    if (existingTemplate) {
      return NextResponse.json({ error: 'A template with this name already exists' }, { status: 409 });
    }

    // Create the template
    const template = await prisma.template.create({
      data: {
        name: body.name,
        globalCss: body.globalCss || '',
        globalJs: body.globalJs || '',
        sections: {
          create: (body.sections || []).map((section: any, index: number) => ({
            sectionTypeId: section.sectionTypeId,
            html: section.html || '',
            css: section.css || '',
            js: section.js || '',
            order: index
          }))
        }
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error('Error creating template:', error);
    
    // Enhanced error details
    const errorMessage = error instanceof Error 
      ? `${error.name}: ${error.message}` 
      : 'Unknown error';
      
    return NextResponse.json({ 
      error: 'Failed to create template', 
      details: errorMessage 
    }, { status: 500 });
  }
}
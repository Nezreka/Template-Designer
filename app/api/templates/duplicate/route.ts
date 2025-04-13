import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/templates/duplicate - Duplicate a template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { templateId } = body;
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }
    
    // Find the template to duplicate
    const originalTemplate = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        sections: true
      }
    });
    
    if (!originalTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    // Generate a new name with "(Copy)" appended
    const newName = `${originalTemplate.name} (Copy)`;
    
    // Check if a template with this name already exists
    const existingTemplate = await prisma.template.findUnique({
      where: { name: newName }
    });
    
    if (existingTemplate) {
      return NextResponse.json(
        { error: 'A template with the name already exists' },
        { status: 409 }
      );
    }
    
    // Create a new template with the same properties
    const newTemplate = await prisma.template.create({
      data: {
        name: newName,
        globalCss: originalTemplate.globalCss,
        globalJs: originalTemplate.globalJs,
        // Create copies of all sections
        sections: {
          create: originalTemplate.sections.map(section => ({
            sectionTypeId: section.sectionTypeId,
            html: section.html,
            css: section.css,
            js: section.js,
            order: section.order
          }))
        }
      },
      include: {
        sections: true
      }
    });
    
    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error('Error duplicating template:', error);
    return NextResponse.json({ error: 'Failed to duplicate template' }, { status: 500 });
  }
}
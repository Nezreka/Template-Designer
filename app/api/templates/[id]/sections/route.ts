import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST /api/templates/[id]/sections - Add a section to a template
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();

    // Check if the template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Validate required fields
    if (!body.sectionTypeId) {
      return NextResponse.json({ error: 'Section type ID is required' }, { status: 400 });
    }

    // Find the highest order value to place the new section at the end
    const highestOrder = template.sections.length > 0
      ? Math.max(...template.sections.map(s => s.order))
      : -1;

    // Create the new section
    const section = await prisma.section.create({
      data: {
        templateId,
        sectionTypeId: body.sectionTypeId,
        html: body.html || '',
        css: body.css || '',
        js: body.js || '',
        order: highestOrder + 1
      }
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
  }
}

// PUT /api/templates/[id]/sections/reorder - Reorder the sections in a template
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id;
    const body = await request.json();

    // Check if the template exists
    const template = await prisma.template.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Check if the sections array is provided
    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json({ error: 'Sections array is required' }, { status: 400 });
    }

    // Update the order of each section
    const updates = body.sections.map((section: { id: string, order: number }) => {
      return prisma.section.update({
        where: { id: section.id },
        data: { order: section.order }
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Sections reordered successfully' });
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json({ error: 'Failed to reorder sections' }, { status: 500 });
  }
}
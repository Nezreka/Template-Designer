import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/templates/[id]/sections/[sectionId] - Get a single section
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, sectionId: string } }
) {
  try {
    const { id: templateId, sectionId } = params;
    
    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
        templateId
      }
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error fetching section:', error);
    return NextResponse.json({ error: 'Failed to fetch section' }, { status: 500 });
  }
}

// PATCH /api/templates/[id]/sections/[sectionId] - Update a section
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string, sectionId: string } }
) {
  try {
    const { id: templateId, sectionId } = params;
    const body = await request.json();
    
    // Check if the section exists
    const existingSection = await prisma.section.findUnique({
      where: {
        id: sectionId,
        templateId
      }
    });

    if (!existingSection) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Update the section
    const updatedSection = await prisma.section.update({
      where: { id: sectionId },
      data: {
        html: body.html !== undefined ? body.html : undefined,
        css: body.css !== undefined ? body.css : undefined,
        js: body.js !== undefined ? body.js : undefined,
        // We don't allow changing the section type as that would break the layout
      }
    });

    return NextResponse.json(updatedSection);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

// DELETE /api/templates/[id]/sections/[sectionId] - Delete a section
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, sectionId: string } }
) {
  try {
    const { id: templateId, sectionId } = params;

    // Check if the section exists
    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
        templateId
      }
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Delete the section
    await prisma.section.delete({
      where: { id: sectionId }
    });

    // Reorder the remaining sections to fill the gap
    const remainingSections = await prisma.section.findMany({
      where: { templateId },
      orderBy: { order: 'asc' }
    });

    // Update the order of each section
    const updates = remainingSections.map((section, index) => {
      return prisma.section.update({
        where: { id: section.id },
        data: { order: index }
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
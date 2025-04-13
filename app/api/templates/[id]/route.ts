import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET /api/templates/[id] - Get a single template with all its sections
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await the params object
    const { id } = await context.params;
    
    const template = await prisma.template.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
  }
}

// DELETE /api/templates/[id] - Delete a template
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await the params object
    const { id } = await context.params;
    
    // Check if the template exists
    const template = await prisma.template.findUnique({
      where: { id }
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Delete the template (sections will be cascade deleted)
    await prisma.template.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
  }
}

// PATCH /api/templates/[id] - Update a template
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await the params object
    const { id } = await context.params;
    const body = await request.json();
    
    // Check if the template exists
    const existingTemplate = await prisma.template.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // If name is changing, check for duplicates
    if (body.name && body.name !== existingTemplate.name) {
      const templateWithSameName = await prisma.template.findUnique({
        where: { name: body.name }
      });

      if (templateWithSameName) {
        return NextResponse.json(
          { error: 'A template with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Update the template
    const updatedTemplate = await prisma.template.update({
      where: { id },
      data: {
        name: body.name,
        globalCss: body.globalCss !== undefined ? body.globalCss : undefined,
        globalJs: body.globalJs !== undefined ? body.globalJs : undefined,
      }
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
  }
}
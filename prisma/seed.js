// Seed script to add a sample template for testing
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to seed the database...');
    
    // First try to delete any existing template with this name to avoid conflicts
    try {
      await prisma.template.deleteMany({
        where: { name: 'Sample Landing Page' }
      });
      console.log('Removed existing templates with the same name');
    } catch (e) {
      console.log('No existing templates to remove or error:', e);
    }
    
    // Create a template
    const template = await prisma.template.create({
      data: {
        name: 'Sample Landing Page',
        globalCss: `
        /* Global CSS Reset */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
        }
        `,
        globalJs: `
        // Global JavaScript
        document.addEventListener('DOMContentLoaded', function() {
          console.log('Template loaded successfully!');
        });
        `,
        sections: {
          create: [
            {
              sectionTypeId: 'hero',
              html: `
              <section class="hero">
                <div class="hero-content">
                  <h1>Welcome to Our Website</h1>
                  <p>This is a hero section with a heading and some content.</p>
                  <a href="#" class="cta-button">Get Started</a>
                </div>
              </section>
              `,
              css: `
              .hero {
                background-color: #2a3b4c;
                color: white;
                padding: 100px 0;
                text-align: center;
              }
              
              .hero-content {
                max-width: 800px;
                margin: 0 auto;
                padding: 0 20px;
              }
              
              .hero h1 {
                font-size: 3rem;
                margin-bottom: 20px;
              }
              
              .hero p {
                font-size: 1.2rem;
                margin-bottom: 30px;
              }
              
              .cta-button {
                display: inline-block;
                background-color: #ff6b6b;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 5px;
                font-weight: bold;
                transition: background-color 0.3s;
              }
              
              .cta-button:hover {
                background-color: #ff5252;
              }
              `,
              js: '',
              order: 0
            },
            {
              sectionTypeId: 'featured-areas',
              html: `
              <section class="featured-areas">
                <div class="container">
                  <h2>Our Featured Areas</h2>
                  <div class="areas">
                    <div class="area">
                      <h3>Area 1</h3>
                      <p>Description of area 1.</p>
                    </div>
                    <div class="area">
                      <h3>Area 2</h3>
                      <p>Description of area 2.</p>
                    </div>
                    <div class="area">
                      <h3>Area 3</h3>
                      <p>Description of area 3.</p>
                    </div>
                  </div>
                </div>
              </section>
              `,
              css: `
              .featured-areas {
                padding: 80px 0;
                background-color: #f9f9f9;
              }
              
              .container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 20px;
              }
              
              .featured-areas h2 {
                text-align: center;
                margin-bottom: 50px;
                font-size: 2.5rem;
                color: #333;
              }
              
              .areas {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
              }
              
              .area {
                flex-basis: calc(33.333% - 30px);
                margin-bottom: 40px;
                padding: 30px;
                background-color: white;
                border-radius: 5px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                transition: transform 0.3s;
              }
              
              .area:hover {
                transform: translateY(-10px);
              }
              
              .area h3 {
                font-size: 1.5rem;
                margin-bottom: 15px;
                color: #2a3b4c;
              }
              
              .area p {
                color: #666;
              }
              
              @media (max-width: 768px) {
                .area {
                  flex-basis: 100%;
                }
              }
              `,
              js: '',
              order: 1
            }
          ]
        }
      },
      include: {
        sections: true
      }
    });
    
    console.log('Sample template created successfully!');
    console.log(`Template ID: ${template.id}`);
    console.log(`Template Name: ${template.name}`);
    console.log(`Number of sections: ${template.sections.length}`);
    
  } catch (error) {
    console.error('Error seeding the database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
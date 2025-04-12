// A simple script to reset the database and create tables
// This uses the SQLite library directly without Prisma

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Define the database path
const DB_PATH = path.join(__dirname, '..', 'database.sqlite');
console.log(`Using database at: ${DB_PATH}`);

// Delete the existing database file if it exists
if (fs.existsSync(DB_PATH)) {
  console.log('Removing existing database file...');
  fs.unlinkSync(DB_PATH);
}

// Create a new database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database.');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON;');

// Create the tables
db.serialize(() => {
  // Create Template table
  db.run(`
    CREATE TABLE Template (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      globalCss TEXT,
      globalJs TEXT,
      createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error('Error creating Template table:', err.message);
    } else {
      console.log('Template table created successfully.');
    }
  });

  // Create Section table
  db.run(`
    CREATE TABLE Section (
      id TEXT PRIMARY KEY,
      templateId TEXT NOT NULL,
      sectionTypeId TEXT NOT NULL,
      html TEXT NOT NULL,
      css TEXT NOT NULL,
      js TEXT,
      "order" INTEGER NOT NULL,
      FOREIGN KEY (templateId) REFERENCES Template (id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating Section table:', err.message);
    } else {
      console.log('Section table created successfully.');
    }
  });

  // Create index on templateId
  db.run(`
    CREATE INDEX Section_templateId_idx ON Section (templateId)
  `, (err) => {
    if (err) {
      console.error('Error creating index:', err.message);
    } else {
      console.log('Index created successfully.');
    }
  });

  // Insert a sample template
  const templateId = `template-${Date.now()}`;
  const now = new Date().toISOString();
  
  db.run(`
    INSERT INTO Template (id, name, globalCss, globalJs, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [
    templateId, 
    'Sample Template',
    'body { font-family: Arial, sans-serif; }',
    'console.log("Template loaded");',
    now,
    now
  ], function(err) {
    if (err) {
      console.error('Error inserting template:', err.message);
    } else {
      console.log(`Template inserted with ID: ${templateId}`);
      
      // Insert a sample section
      const sectionId = `section-${Date.now()}`;
      
      db.run(`
        INSERT INTO Section (id, templateId, sectionTypeId, html, css, js, "order")
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        sectionId,
        templateId,
        'hero',
        '<section class="hero"><h1>Welcome</h1></section>',
        '.hero { text-align: center; padding: 40px; }',
        '',
        0
      ], function(err) {
        if (err) {
          console.error('Error inserting section:', err.message);
        } else {
          console.log(`Section inserted with ID: ${sectionId}`);
          
          // Verify data
          db.get(`SELECT COUNT(*) as count FROM Template`, (err, row) => {
            if (err) {
              console.error('Error counting templates:', err.message);
            } else {
              console.log(`Database contains ${row.count} templates.`);
            }
            
            // Close the database
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err.message);
              } else {
                console.log('Database setup completed successfully. Closed the database connection.');
              }
            });
          });
        }
      });
    }
  });
});
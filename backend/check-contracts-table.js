const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function checkContractsTable() {
  try {
    console.log('🔍 Checking contracts table structure...\n');
    
    const columns = await pool.query(`
      SELECT 
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'contratos'
      ORDER BY ordinal_position;
    `);
    
    console.log('📊 Contracts table columns:');
    console.log('='.repeat(50));
    columns.rows.forEach(col => {
      console.log(`${col.column_name.padEnd(25)} | ${col.data_type.padEnd(15)} | ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking table:', error);
  } finally {
    await pool.end();
  }
}

checkContractsTable();
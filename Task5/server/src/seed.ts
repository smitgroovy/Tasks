import bcrypt from 'bcryptjs';
import pool from './config/database';

const seed = async () => {
  const client = await pool.connect();
  try {
    const existingAdmin = await client.query("SELECT id FROM users WHERE email = 'admin@studenthub.com'");
    if (existingAdmin.rows.length > 0) {
      console.log('Admin user already exists.');
      return;
    }

    const password_hash = await bcrypt.hash('admin123', 12);
    await client.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      ['admin@studenthub.com', password_hash, 'System', 'Admin', 'admin']
    );

    console.log('Admin user created:');
    console.log('  Email: admin@studenthub.com');
    console.log('  Password: admin123');
    console.log('  Role: admin');
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

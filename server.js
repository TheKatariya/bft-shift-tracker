require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dbConfig = {
  host: process.env.DB_HOST || '100.116.169.44',
  port: parseInt(process.env.DB_PORT) || 49154,
  user: process.env.DB_USER || 'n8n',
  password: process.env.DB_PASS || 'n8n',
  database: process.env.DB_NAME || 'bft_tracker',
};

let pool;

async function initDb() {
  pool = mysql.createPool(dbConfig);
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS shift_submissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      staff_name VARCHAR(100),
      shift_date DATE,
      shift_type ENUM('AM','PM','Weekend'),
      todays_focus VARCHAR(100),
      goals JSON,
      opening_tasks JSON,
      calls_made INT DEFAULT 0,
      conversations INT DEFAULT 0,
      text_conversations INT DEFAULT 0,
      emails_sent INT DEFAULT 0,
      bookings INT DEFAULT 0,
      shows INT DEFAULT 0,
      new_members INT DEFAULT 0,
      pack_holders INT DEFAULT 0,
      sales INT DEFAULT 0,
      quality_checks JSON,
      moved_needle TEXT,
      avoided_hesitated TEXT,
      do_better TEXT,
      biggest_win TEXT,
      cleaning_notes TEXT,
      management_notes TEXT
    )
  `);
  console.log('Database ready');
}

app.post('/api/submit', async (req, res) => {
  try {
    const d = req.body;
    await pool.execute(
      `INSERT INTO shift_submissions
        (staff_name, shift_date, shift_type, todays_focus, goals, opening_tasks,
         calls_made, conversations, text_conversations, emails_sent,
         bookings, shows, new_members, pack_holders, sales,
         quality_checks, moved_needle, avoided_hesitated, do_better,
         biggest_win, cleaning_notes, management_notes)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        d.staff_name, d.shift_date, d.shift_type, d.todays_focus,
        JSON.stringify(d.goals || []), JSON.stringify(d.opening_tasks || []),
        d.calls_made || 0, d.conversations || 0, d.text_conversations || 0,
        d.emails_sent || 0, d.bookings || 0, d.shows || 0,
        d.new_members || 0, d.pack_holders || 0, d.sales || 0,
        JSON.stringify(d.quality_checks || []),
        d.moved_needle || '', d.avoided_hesitated || '', d.do_better || '',
        d.biggest_win || '', d.cleaning_notes || '', d.management_notes || '',
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: 'Database error' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM shift_submissions ORDER BY submitted_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

const PORT = process.env.PORT || 3000;
initDb()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => { console.error('Failed to init DB:', err); process.exit(1); });

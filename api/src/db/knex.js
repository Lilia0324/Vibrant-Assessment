const os = require('os');
const path = require('path');
const fs = require('fs');
const Knex = require('knex');

const dbFile = path.join(os.tmpdir(), 'maintenance.sqlite3');

// ---- ALWAYS OVERWRITE DB ON BOOT ----
try {
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile); // delete the old DB file
} catch (e) {
  console.warn('Could not delete existing DB file:', e.message);
}

const knex = Knex({
  client: 'sqlite3',
  connection: { filename: dbFile },
  useNullAsDefault: true,
  pool: {
    afterCreate: (conn, done) => {
      // Enable FK constraints
      conn.run('PRAGMA foreign_keys = ON', done);
    },
  },
});

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function randomAlphaNumeric(len) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[randInt(0, chars.length - 1)];
  return out;
}

async function ensureSchema() {
  await knex.schema.createTable('equipment', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('model').nullable();
    t.string('serial_number').nullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('maintenance_records', (t) => {
    t.increments('id').primary();
    t.integer('equipment_id').notNullable()
      .references('id').inTable('equipment').onDelete('CASCADE');
    t.datetime('performed_at').notNullable();
    t.string('performed_by').nullable();
    t.text('notes').nullable();
    t.timestamps(true, true);
  });

  await knex.schema.createTable('users', (t) => {
    t.increments('id').primary();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.string('name').nullable();
    t.text('roles').nullable(); // store as JSON string like '["user"]'
    t.timestamps(true, true);
    });

  await knex.transaction(async (trx) => {
    // 1) Insert 50 equipments (do NOT rely on returning)
    const equipmentRows = [];
    for (let i = 1; i <= 50; i++) {
      equipmentRows.push({
        name: `Equipment-${i}`,
        model: `Model-${randomAlphaNumeric(4)}`,
        serial_number: `SN-${randInt(1000, 9999)}`,
      });
    }
    await trx('equipment').insert(equipmentRows);

    // 2) Fetch ALL ids reliably
    const eqIds = await trx('equipment').pluck('id'); // ← robust in SQLite

    // 3) Insert 1–3 records per equipment
    const techs = ['Alex Carter', 'Jordan Kim', 'Priya Patel', 'Miguel Santos', 'Taylor Nguyen', 'Sam Lee', 'Riley Chen', 'Dana Moore'];
    const notesPool = ['Routine check', 'Replaced filter', 'Calibrated sensors', 'Updated firmware', 'Lubricated parts', 'Cleaned optics', 'Replaced rotor', 'Tightened belts'];
    const now = Date.now();

    const maintenanceRows = [];
    for (const id of eqIds) {
      const count = randInt(1, 3); // always at least 1
      for (let j = 0; j < count; j++) {
        const daysAgo = randInt(1, 30);
        maintenanceRows.push({
          equipment_id: id,
          performed_at: new Date(now - daysAgo * 86400000).toISOString(),
          performed_by: techs[randInt(0, techs.length - 1)],
          notes: notesPool[randInt(0, notesPool.length - 1)],
        });
      }
    }
    await trx('maintenance_records').insert(maintenanceRows);
    console.log(`✅ Seeded ${equipmentRows.length} equipments and ${maintenanceRows.length} maintenance records.`);

    // Seed a demo user: email = lilia@example.com, password = password123
    const bcrypt = require('bcryptjs');
    const demoHash = await bcrypt.hash('password123', 10);
    await trx('users').insert({
        email: 'lilia@example.com',
        password_hash: demoHash,
        name: 'Lilia Zhang',
        roles: JSON.stringify(['user']),
    });
    console.log(`✅ Seeded demo user.`);
  });
}


module.exports = { knex, ensureSchema, dbFile };
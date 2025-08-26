/**
 * BLANK API SCAFFOLD — Implement per ASSESSMENT.md
 * - Health endpoint works
 * - Feature endpoints return 501 Not Implemented
 */
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const maintenanceRoutes = require('./routes/maintenance');
const testResultsRoutes = require('./routes/testResults');
const samplesRoutes = require('./routes/samples');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', authRoutes);
app.use('/api', maintenanceRoutes);
app.use('/api', testResultsRoutes);
app.use('/api', samplesRoutes);

const PORT = 4000;
app.listen(PORT, () => console.log(`[api] http://localhost:${PORT}`));

const { ensureSchema } = require('./db/knex');
ensureSchema().catch((err) => {
  console.error('Failed to initialize database schema:', err);
  process.exit(1);
});

const express = require('express');
const router = express.Router();
const { knex } = require('../db/knex');
const auth = require('../middleware/auth'); 

function toPositiveInt(value, fieldName) {
  // Allow strings like "10" and numbers; reject floats/negatives/NaN/zero
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    const label = fieldName || 'value';
    throw new Error(`${label} must be a positive integer`);
  }
  return n;
}

function parsePagination(query) {
  let page = 1;
  let pageSize = 20;

  // If provided, must be valid positive integers
  if (query.page !== undefined) {
    page = toPositiveInt(query.page, 'page');
  }
  if (query.pageSize !== undefined) {
    pageSize = toPositiveInt(query.pageSize, 'pageSize');
  }

  if (pageSize > 100) {
    throw new Error('pageSize cannot exceed 100');
  }

  return { page, pageSize };
}
/**
 * GET /api/maintenance/:equipmentId
 * returns: { equipment, records, page, pageSize, total }
 */
router.get('/maintenance/:equipmentId', auth, async (req, res) => {
  try {
    // ---- Validate params ----
    let equipmentId;
    try {
      equipmentId = toPositiveInt(req.params.equipmentId, 'equipmentId');
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    let page, pageSize;
    try {
      ({ page, pageSize } = parsePagination(req.query));
    } catch (e) {
      return res.status(400).json({ error: e.message });
    }

    // ---- Fetch equipment ----
    const equipment = await knex('equipment')
      .where({ id: equipmentId })
      .first();

    if (!equipment) {
      return res.status(404).json({ error: `Equipment ${equipmentId} not found` });
    }

    // ---- Build base query for records ----
    const base = knex('maintenance_records').where({ equipment_id: equipmentId });

    const [{ count: totalStr }] = await base.clone().count({ count: '*' });
    const total = Number(totalStr) || 0;

    const records = await base
      .clone()
      .orderBy('performed_at', 'desc')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .select([
        'id',
        'equipment_id',
        'performed_at',
        'performed_by',
        'notes',
        'created_at',
        'updated_at',
      ]);

    return res.json({
      equipment,
      records,
      page,
      pageSize,
      total,
    });
  } catch (err) {
    console.error('GET /api/maintenance/:equipmentId failed:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
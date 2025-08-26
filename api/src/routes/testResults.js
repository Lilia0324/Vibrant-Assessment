/**
 * Endpoints
 * - GET    /api/test-results
 *   -> 50% chance: 200 with 4 random results
 *   -> 50% chance: 500 with { message: "randomly failed please retry" }
 *
 * - PATCH  /api/test-results/:id  body: { status }
 *   -> Always 200 with a "randomly updated" test result (validates inputs)
 *
 * - POST   /api/test-results  (Stretch)
 *   -> TODO
 *
 * Notes:
 * - These are mock endpoints; no DB is used.
 * - Shapes are consistent with the frontend hooks you have.
 */

const express = require("express");
const router = express.Router();

const STATUSES = ["pending", "running", "passed", "failed", "skipped"];

const isValidStatus = (val) => STATUSES.includes(val);

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const nowISO = () => new Date().toISOString();

const genId = () => {
  // short, readable IDs for demos
  const n = Math.random().toString(36).slice(2, 8);
  return `tr_${n}`;
};

const makeOne = (i = 1) => {
  const status = pick(STATUSES);
  const minutesAgo = randomInt(0, 60 * 24);
  const updatedAt = new Date(Date.now() - minutesAgo * 60_000).toISOString();
  return {
    id: genId(),
    name: `Test ${i}`,
    status,
    updatedAt,
  };
};

const makeList = (count = 25) => Array.from({ length: count }, (_, i) => makeOne(i + 1));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomDelay = async () => {
  const ms = 3000 + Math.floor(Math.random() * 2000); // 3000–5000 ms
  await sleep(ms);
};

/* -----------------------------
   GET /api/test-results
------------------------------ */
router.get("/test-results", async (_req, res) => {
  await randomDelay();

  // 50/50 success vs failure
  const success = Math.random() < 0.5;

  if (!success) {
    return res
      .status(500)
      .json({ message: "randomly failed please retry" });
  }

  // 4 random records
  const list = makeList(4);
  return res.status(200).json(list);
});

/* -----------------------------
   PATCH /api/test-results/:id
   body: { status }
------------------------------ */
router.patch("/test-results/:id", async (req, res) => {
  await randomDelay();

  const { id } = req.params;

  // Basic validation
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid or missing id param." });
  }

  const { status } = req.body || {};
  if (!isValidStatus(status)) {
    return res.status(400).json({
      message: `Invalid status. Allowed: ${STATUSES.join(", ")}`,
    });
  }

  // Always succeed with a "randomly updated" record.
  // We don't have a DB, so we synthesize a stable-looking object:
  const updated = {
    id,
    name: `Test ${id.replace(/^tr_/, "")}`, // friendly label derived from id
    status,
    updatedAt: nowISO(),
  };

  return res.status(200).json(updated);
});


// (Stretch)
router.post('/test-results', (_req, res) => {
  return res.status(501).json({ message: 'Not Implemented: POST /api/test-results' });
});


module.exports = router;

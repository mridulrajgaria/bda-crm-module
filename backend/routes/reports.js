const express = require('express');
const { reportsController: { getLeadReport } } = require('../controllers/controllers');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.get('/leads', getLeadReport);

module.exports = router;

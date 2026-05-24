const express = require('express');
const { dashboardController: { getDashboardStats } } = require('../controllers/controllers');
const { protect } = require('../middleware/auth');
const router = express.Router();

router.use(protect);
router.get('/stats', getDashboardStats);

module.exports = router;

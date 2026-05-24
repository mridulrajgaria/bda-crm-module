const express = require('express');
const { getLeads, getLead, createLead, updateLead, updateLeadStatus, deleteLead, getLeadStats } = require('../controllers/leadController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.get('/stats', getLeadStats);
router.route('/').get(getLeads).post(createLead);
router.route('/:id').get(getLead).put(updateLead).delete(authorize('admin', 'manager'), deleteLead);
router.put('/:id/status', updateLeadStatus);

module.exports = router;

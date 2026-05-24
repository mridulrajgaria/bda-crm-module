const express = require('express');
const { teamController: { getTeamMembers, getTeamPerformance, createTeamMember, updateTeamMember } } = require('../controllers/controllers');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.get('/', authorize('admin', 'manager'), getTeamMembers);
router.get('/performance', authorize('admin', 'manager'), getTeamPerformance);
router.post('/', authorize('admin'), createTeamMember);
router.put('/:id', authorize('admin'), updateTeamMember);

module.exports = router;

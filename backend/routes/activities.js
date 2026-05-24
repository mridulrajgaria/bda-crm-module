const express = require('express');
const { activityController: { getActivities, createActivity, updateActivity, deleteActivity } } = require('../controllers/controllers');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.route('/').get(getActivities).post(createActivity);
router.route('/:id').put(updateActivity).delete(authorize('admin', 'manager'), deleteActivity);

module.exports = router;

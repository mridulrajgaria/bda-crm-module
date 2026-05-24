const express = require('express');
const { clientController: { getClients, getClient, createClient, updateClient, deleteClient } } = require('../controllers/controllers');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');
const router = express.Router();

router.use(protect);
router.route('/').get(getClients).post(createClient);
router.route('/:id').get(getClient).put(updateClient).delete(authorize('admin', 'manager'), deleteClient);

module.exports = router;

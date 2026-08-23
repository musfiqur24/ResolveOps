const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { listGroups, createGroup, deleteGroup } = require('../controllers/groupController');

const router = express.Router();

router.get('/', protect, listGroups);
router.post('/', protect, adminOnly, createGroup);
router.delete('/:id', protect, adminOnly, deleteGroup);

module.exports = router;

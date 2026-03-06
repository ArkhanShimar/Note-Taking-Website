const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const auth = require('../middleware/auth');

router.post('/', auth, folderController.createFolder);
router.get('/', auth, folderController.getFolders);
router.put('/:id', auth, folderController.updateFolder);
router.delete('/:id', auth, folderController.deleteFolder);

module.exports = router;

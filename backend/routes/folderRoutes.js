const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const auth = require('../middleware/auth');

router.post('/', auth, folderController.createFolder);
router.get('/', auth, folderController.getFolders);
router.get('/:id', auth, folderController.getFolderById);
router.put('/:id', auth, folderController.updateFolder);
router.delete('/:id', auth, folderController.deleteFolder);
router.post('/:id/verify-pin', auth, folderController.verifyPin);
router.put('/:id/update-pin', auth, folderController.updatePin);

module.exports = router;

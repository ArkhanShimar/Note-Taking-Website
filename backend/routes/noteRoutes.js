const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

router.post('/', auth, noteController.createNote);
router.get('/', auth, noteController.getNotes);
router.get('/search', auth, noteController.searchNotes);
router.get('/:id', auth, noteController.getNoteById);
router.put('/:id', auth, noteController.updateNote);
router.delete('/:id', auth, noteController.deleteNote);
router.post('/:id/collaborators', auth, noteController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', auth, noteController.removeCollaborator);

module.exports = router;

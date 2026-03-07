const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');

router.post('/', auth, noteController.createNote);
router.get('/', auth, noteController.getNotes);
router.get('/drafts', auth, noteController.getDrafts);
router.get('/search', auth, noteController.searchNotes);
router.get('/:id', auth, noteController.getNoteById);
router.put('/:id', auth, noteController.updateNote);
router.delete('/:id', auth, noteController.deleteNote);
router.post('/:id/collaborators', auth, noteController.addCollaborator);
router.delete('/:id/collaborators/:collaboratorId', auth, noteController.removeCollaborator);
router.patch('/:id/pin', auth, noteController.togglePin);

module.exports = router;

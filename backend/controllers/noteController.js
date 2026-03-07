const Note = require('../models/Note');

exports.createNote = async (req, res) => {
  try {
    const { title, content, folder, isDraft } = req.body;

    const note = await Note.create({
      title,
      content: content || '',
      owner: req.user.id,
      folder: folder || null,
      isDraft: isDraft !== undefined ? isDraft : false, // Default to published (false) unless specified
      lastEditedBy: req.user.id
    });

    await note.populate('owner', 'name email');
    await note.populate('lastEditedBy', 'name email');

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ],
      deleted: false,
      isDraft: false // Only get published notes
    })
    .populate('owner', 'name email')
    .populate('collaborators', 'name email')
    .populate('lastEditedBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getDrafts = async (req, res) => {
  try {
    const drafts = await Note.find({
      owner: req.user.id, // Only owner can see drafts
      deleted: false,
      isDraft: true
    })
    .populate('owner', 'name email')
    .populate('collaborators', 'name email')
    .populate('lastEditedBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json(drafts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ],
      deleted: false
    })
    .populate('owner', 'name email')
    .populate('collaborators', 'name email')
    .populate('lastEditedBy', 'name email');

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const { title, content, folder, isDraft } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ],
      deleted: false
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (folder !== undefined) note.folder = folder;
    if (isDraft !== undefined) note.isDraft = isDraft;
    
    // Track who made the last edit
    note.lastEditedBy = req.user.id;

    await note.save();
    await note.populate('owner', 'name email');
    await note.populate('collaborators', 'name email');
    await note.populate('lastEditedBy', 'name email');

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    note.deleted = true;
    await note.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.searchNotes = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Use regex for partial matching in title and content
    const searchRegex = new RegExp(q, 'i'); // 'i' for case-insensitive

    const notes = await Note.find({
      $or: [
        { owner: req.user.id },
        { collaborators: req.user.id }
      ],
      deleted: false,
      $or: [
        { title: searchRegex },
        { content: searchRegex }
      ]
    })
    .populate('owner', 'name email')
    .populate('collaborators', 'name email')
    .populate('lastEditedBy', 'name email')
    .sort({ updatedAt: -1 });

    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addCollaborator = async (req, res) => {
  try {
    const { email } = req.body;

    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    const User = require('../models/User');
    const collaborator = await User.findOne({ email });

    if (!collaborator) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (note.owner.toString() === collaborator._id.toString()) {
      return res.status(400).json({ message: 'Cannot add owner as collaborator' });
    }

    if (note.collaborators.includes(collaborator._id)) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    note.collaborators.push(collaborator._id);
    await note.save();
    await note.populate('owner', 'name email');
    await note.populate('collaborators', 'name email');
    await note.populate('lastEditedBy', 'name email');

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.removeCollaborator = async (req, res) => {
  try {
    const { collaboratorId } = req.params;

    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    note.collaborators = note.collaborators.filter(
      id => id.toString() !== collaboratorId
    );

    await note.save();
    await note.populate('owner', 'name email');
    await note.populate('collaborators', 'name email');
    await note.populate('lastEditedBy', 'name email');

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false
    });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or unauthorized' });
    }

    note.isPinned = !note.isPinned;
    await note.save();
    await note.populate('owner', 'name email');
    await note.populate('collaborators', 'name email');
    await note.populate('lastEditedBy', 'name email');

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const Folder = require('../models/Folder');
const Note = require('../models/Note');

exports.createFolder = async (req, res) => {
  try {
    const { name, color } = req.body;

    const folder = await Folder.create({
      name,
      color: color || '#F59E0B',
      owner: req.user.id
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      owner: req.user.id,
      deleted: false
    }).sort({ createdAt: -1 });

    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const noteCount = await Note.countDocuments({
          folder: folder._id,
          deleted: false
        });
        return {
          ...folder.toObject(),
          noteCount
        };
      })
    );

    res.json(foldersWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { name, color } = req.body;

    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    if (name) folder.name = name;
    if (color) folder.color = color;

    await folder.save();
    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false
    });

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    folder.deleted = true;
    await folder.save();

    await Note.updateMany(
      { folder: folder._id },
      { folder: null }
    );

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

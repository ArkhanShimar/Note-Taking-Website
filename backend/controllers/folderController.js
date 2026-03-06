const Folder = require('../models/Folder');

exports.createFolder = async (req, res) => {
  try {
    const { name, color } = req.body;

    const folder = await Folder.create({
      name,
      color: color || 'indigo',
      owner: req.user.id
    });

    await folder.populate('owner', 'name email');

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
    })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false
    })
    .populate('owner', 'name email');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json(folder);
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

    if (name !== undefined) folder.name = name;
    if (color !== undefined) folder.color = color;

    await folder.save();
    await folder.populate('owner', 'name email');

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

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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
    let folders = await Folder.find({
      owner: req.user.id,
      deleted: false
    })
    .populate('owner', 'name email')
    .sort({ createdAt: -1 });

    // Check if Private folder exists, if not create it
    let privateFolder = folders.find(f => f.isPrivate);
    
    if (!privateFolder) {
      privateFolder = await Folder.create({
        name: 'Private',
        color: 'pink',
        owner: req.user.id,
        isPrivate: true,
        pin: null // User will set PIN on first access
      });
      await privateFolder.populate('owner', 'name email');
      folders = [privateFolder, ...folders];
    } else {
      // Move Private folder to the beginning
      folders = folders.filter(f => !f.isPrivate);
      folders.unshift(privateFolder);
    }

    res.json(folders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false,
      isPrivate: true
    });

    if (!folder) {
      return res.status(404).json({ message: 'Private folder not found' });
    }

    // If no PIN is set, set it now
    if (!folder.pin) {
      if (!pin || pin.length !== 4) {
        return res.status(400).json({ message: 'PIN must be 4 digits' });
      }
      folder.pin = pin;
      await folder.save();
      return res.json({ success: true, message: 'PIN set successfully', isNewPin: true });
    }

    // Verify PIN
    if (folder.pin === pin) {
      return res.json({ success: true, message: 'PIN verified' });
    } else {
      return res.status(401).json({ success: false, message: 'Incorrect PIN' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updatePin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    const folder = await Folder.findOne({
      _id: req.params.id,
      owner: req.user.id,
      deleted: false,
      isPrivate: true
    });

    if (!folder) {
      return res.status(404).json({ message: 'Private folder not found' });
    }

    if (!folder.pin || folder.pin === oldPin) {
      if (!newPin || newPin.length !== 4) {
        return res.status(400).json({ message: 'New PIN must be 4 digits' });
      }
      folder.pin = newPin;
      await folder.save();
      return res.json({ success: true, message: 'PIN updated successfully' });
    } else {
      return res.status(401).json({ success: false, message: 'Incorrect old PIN' });
    }
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

    // Prevent deletion of Private folder
    if (folder.isPrivate) {
      return res.status(403).json({ message: 'Cannot delete Private folder' });
    }

    folder.deleted = true;
    await folder.save();

    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

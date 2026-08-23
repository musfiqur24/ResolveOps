const Group = require('../models/Group');
const User = require('../models/User');

exports.listGroups = async (req, res) => {
  const groups = await Group.find().sort({ name: 1 });
  const memberCounts = await User.aggregate([
    { $match: { group: { $ne: null } } },
    { $group: { _id: '$group', count: { $sum: 1 } } }
  ]);
  const counts = new Map(memberCounts.map(item => [String(item._id), item.count]));
  res.json({ groups: groups.map(group => ({
    id: group._id,
    name: group.name,
    description: group.description,
    memberCount: counts.get(String(group._id)) || 0
  })) });
};

exports.createGroup = async (req, res) => {
  const { name, description = '' } = req.body;
  if (!String(name || '').trim()) return res.status(400).json({ message: 'Group name is required.' });

  try {
    const group = await Group.create({ name, description });
    res.status(201).json({ group: { id: group._id, name: group.name, description: group.description, memberCount: 0 } });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'A group with this name already exists.' });
    throw error;
  }
};

exports.deleteGroup = async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) return res.status(404).json({ message: 'Group not found.' });
  const members = await User.countDocuments({ group: group._id });
  if (members) return res.status(400).json({ message: 'Move group members before deleting this group.' });
  await group.deleteOne();
  res.json({ message: 'Group deleted.' });
};

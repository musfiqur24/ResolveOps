const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Incident = require('../models/Incident');
const Notification = require('../models/Notification');
const Group = require('../models/Group');

function signToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function publicUser(user) {
  const group = user.group && typeof user.group === 'object'
    ? { id: user.group._id || user.group.id, name: user.group.name, description: user.group.description }
    : null;
  return { id: user._id, name: user.name, email: user.email, role: user.role, group, isOnCall: user.isOnCall };
}

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });
  const user = await User.findOne({ email }).select('+password').populate('group', 'name description');
  if (!user || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password.' });
  res.json({ token: signToken(user), user: publicUser(user) });
};

exports.me = async (req, res) => res.json({ user: publicUser(req.user) });

exports.createUser = async (req, res) => {
  const { name, email, password, role = 'frontend_engineer', group: groupId, isOnCall = false } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Name, email, and password are required.' });
  const normalizedEmail = String(email).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.com$/i.test(normalizedEmail)) {
    return res.status(400).json({ message: 'Enter a valid email address ending in .com.' });
  }
  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) return res.status(409).json({ message: 'A user with this email already exists.' });
  let group = null;
  if (groupId) {
    group = await Group.findById(groupId);
    if (!group) return res.status(400).json({ message: 'Selected group does not exist.' });
  }
  const user = await User.create({ name, email: normalizedEmail, password, role, group: group?._id, isOnCall });
  user.group = group;
  res.status(201).json({ user: publicUser(user) });
};

exports.listUsers = async (req, res) => {
  const users = await User.find().populate('group', 'name description').sort({ isOnCall: -1, name: 1 });
  res.json({ users: users.map(publicUser) });
};

exports.updateUser = async (req, res) => {
  const user = await User.findById(req.params.id).populate('group', 'name description');
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (typeof req.body.isOnCall !== 'boolean') {
    return res.status(400).json({ message: 'Provide an on-call status to update this roster member.' });
  }
  user.isOnCall = req.body.isOnCall;
  await user.save();
  res.json({ user: publicUser(user) });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  if (String(req.user._id) === String(id)) {
    return res.status(400).json({ message: 'You cannot delete your own admin account while logged in.' });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: 'User not found.' });

  await Incident.updateMany({ assignedTo: user._id }, { $unset: { assignedTo: '' } });
  await Notification.deleteMany({ targetUser: user._id });
  await User.findByIdAndDelete(user._id);

  res.json({ message: `${user.name} was deleted successfully.` });
};

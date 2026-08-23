const Notification = require('../models/Notification');
const Incident = require('../models/Incident');

function notificationAudience(userId) {
  return { $or: [{ targetUser: userId }, { targetUser: null }] };
}

async function engineerIncidentScope(userId) {
  const assignedIncidentIds = await Incident.find({ assignedTo: userId }).distinct('_id');
  return { $or: [{ incident: { $in: assignedIncidentIds } }, { incident: null }] };
}

exports.listNotifications = async (req, res) => {
  const filters = [notificationAudience(req.user._id)];
  if (req.user.role !== 'admin') filters.push(await engineerIncidentScope(req.user._id));

  const notifications = await Notification.find({ $and: filters })
    .populate('incident', 'title severity status')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ notifications });
};

exports.markRead = async (req, res) => {
  const filters = [{ _id: req.params.id, targetUser: req.user._id }];
  if (req.user.role !== 'admin') filters.push(await engineerIncidentScope(req.user._id));

  await Notification.findOneAndUpdate({ $and: filters }, { read: true });
  res.json({ message: 'Notification marked as read.' });
};

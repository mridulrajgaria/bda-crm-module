// ============================================================
// CLIENT CONTROLLER
// ============================================================
const Client = require('../models/Client');
const Lead = require('../models/Lead');

const getClients = async (req, res) => {
  try {
    const { search, status, industry, assignedTo, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role === 'bda') filter.assignedTo = req.user._id;
    else if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    if (industry) filter.industry = industry;
    if (search) filter.$or = [
      { company: { $regex: search, $options: 'i' } },
      { contactPerson: { $regex: search, $options: 'i' } },
    ];

    const [clients, total] = await Promise.all([
      Client.find(filter).populate('assignedTo', 'name email avatar').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Client.countDocuments(filter),
    ]);

    res.json({ success: true, clients, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id).populate('assignedTo', 'name email role avatar');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createClient = async (req, res) => {
  try {
    const client = await Client.create({ ...req.body, createdBy: req.user._id });
    await client.populate('assignedTo', 'name email avatar');
    res.status(201).json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('assignedTo', 'name email avatar');
    if (!client) return res.status(404).json({ success: false, message: 'Client not found.' });
    res.json({ success: true, client });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Client deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports.clientController = { getClients, getClient, createClient, updateClient, deleteClient };

// ============================================================
// ACTIVITY CONTROLLER
// ============================================================
const Activity = require('../models/Activity');

const getActivities = async (req, res) => {
  try {
    const { type, status, lead, performedBy, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (req.user.role === 'bda') filter.performedBy = req.user._id;
    else if (performedBy) filter.performedBy = performedBy;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (lead) filter.lead = lead;

    const [activities, total] = await Promise.all([
      Activity.find(filter)
        .populate('performedBy', 'name avatar role')
        .populate('lead', 'title company status')
        .populate('client', 'company')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Activity.countDocuments(filter),
    ]);
    res.json({ success: true, activities, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createActivity = async (req, res) => {
  try {
    const activity = await Activity.create({ ...req.body, performedBy: req.user._id });
    await activity.populate('performedBy', 'name avatar role');
    await activity.populate('lead', 'title company status');
    res.status(201).json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateActivity = async (req, res) => {
  try {
    if (req.body.status === 'completed' && !req.body.completedAt) req.body.completedAt = new Date();
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('performedBy', 'name avatar role')
      .populate('lead', 'title company status');
    if (!activity) return res.status(404).json({ success: false, message: 'Activity not found.' });
    res.json({ success: true, activity });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Activity deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports.activityController = { getActivities, createActivity, updateActivity, deleteActivity };

// ============================================================
// DASHBOARD CONTROLLER
// ============================================================
const User = require('../models/User');

const getDashboardStats = async (req, res) => {
  try {
    const isBDA = req.user.role === 'bda';
    const baseFilter = isBDA ? { assignedTo: req.user._id } : {};

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalLeads, wonLeads, lostLeads, newThisMonth,
      pipeline, monthlyRevenue, totalClients, pendingActivities,
    ] = await Promise.all([
      Lead.countDocuments(baseFilter),
      Lead.countDocuments({ ...baseFilter, status: 'won' }),
      Lead.countDocuments({ ...baseFilter, status: 'lost' }),
      Lead.countDocuments({ ...baseFilter, createdAt: { $gte: startOfMonth } }),
      Lead.aggregate([
        { $match: { ...baseFilter, status: { $nin: ['won', 'lost'] } } },
        { $group: { _id: null, totalValue: { $sum: '$value' }, count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: { ...baseFilter, status: 'won', actualCloseDate: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),
      Client.countDocuments(isBDA ? { assignedTo: req.user._id } : {}),
      Activity.countDocuments({ ...(isBDA ? { performedBy: req.user._id } : {}), status: 'pending' }),
    ]);

    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0;

    // Last 6 months revenue trend
    const revenueByMonth = await Lead.aggregate([
      {
        $match: {
          ...baseFilter,
          status: 'won',
          actualCloseDate: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) },
        },
      },
      {
        $group: {
          _id: { year: { $year: '$actualCloseDate' }, month: { $month: '$actualCloseDate' } },
          revenue: { $sum: '$value' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Lead funnel (status distribution)
    const leadFunnel = await Lead.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$value' } } },
    ]);

    // Source breakdown
    const sourceBreakdown = await Lead.aggregate([
      { $match: baseFilter },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      stats: {
        totalLeads,
        wonLeads,
        lostLeads,
        newThisMonth,
        conversionRate: Number(conversionRate),
        pipelineValue: pipeline[0]?.totalValue || 0,
        pipelineCount: pipeline[0]?.count || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        totalClients,
        pendingActivities,
      },
      revenueByMonth,
      leadFunnel,
      sourceBreakdown,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports.dashboardController = { getDashboardStats };

// ============================================================
// TEAM CONTROLLER
// ============================================================
const getTeamMembers = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).sort({ role: 1, name: 1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const getTeamPerformance = async (req, res) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const y = Number(year) || now.getFullYear();
    const m = Number(month) || now.getMonth() + 1;
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const bdas = await User.find({ role: 'bda', isActive: true });

    const performance = await Promise.all(
      bdas.map(async (bda) => {
        const [totalLeads, wonLeads, lostLeads, activitiesCount, revenue] = await Promise.all([
          Lead.countDocuments({ assignedTo: bda._id }),
          Lead.countDocuments({ assignedTo: bda._id, status: 'won', actualCloseDate: { $gte: startDate, $lte: endDate } }),
          Lead.countDocuments({ assignedTo: bda._id, status: 'lost' }),
          Activity.countDocuments({ performedBy: bda._id, createdAt: { $gte: startDate, $lte: endDate } }),
          Lead.aggregate([
            { $match: { assignedTo: bda._id, status: 'won', actualCloseDate: { $gte: startDate, $lte: endDate } } },
            { $group: { _id: null, total: { $sum: '$value' } } },
          ]),
        ]);

        const rev = revenue[0]?.total || 0;
        const achievement = bda.target > 0 ? Math.round((rev / bda.target) * 100) : 0;

        return {
          _id: bda._id,
          name: bda.name,
          email: bda.email,
          avatar: bda.avatar,
          initials: bda.initials,
          department: bda.department,
          target: bda.target,
          totalLeads,
          wonLeads,
          lostLeads,
          activitiesCount,
          revenue: rev,
          achievement,
          conversionRate: totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0,
        };
      })
    );

    // Sort by revenue descending (leaderboard)
    performance.sort((a, b) => b.revenue - a.revenue);

    res.json({ success: true, performance, month: m, year: y });
  } catch (err) {
    console.error('Team performance error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const createTeamMember = async (req, res) => {
  try {
    const { name, email, password, role, phone, department, target } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered.' });
    const user = await User.create({ name, email, password: password || 'Pass@1234', role, phone, department, target });
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

const updateTeamMember = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports.teamController = { getTeamMembers, getTeamPerformance, createTeamMember, updateTeamMember };

// ============================================================
// REPORTS CONTROLLER
// ============================================================
const getLeadReport = async (req, res) => {
  try {
    const { startDate, endDate, assignedTo, status, source } = req.query;
    const filter = {};
    if (req.user.role === 'bda') filter.assignedTo = req.user._id;
    else if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    if (source) filter.source = source;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const summary = {
      total: leads.length,
      totalValue: leads.reduce((sum, l) => sum + l.value, 0),
      byStatus: leads.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {}),
      bySource: leads.reduce((acc, l) => { acc[l.source] = (acc[l.source] || 0) + 1; return acc; }, {}),
    };

    res.json({ success: true, leads, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports.reportsController = { getLeadReport };

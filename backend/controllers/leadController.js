const Lead = require('../models/Lead');

// @desc    Get all leads (with filters)
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res) => {
  try {
    const { status, assignedTo, priority, source, search, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filter = {};

    // BDAs only see their own leads
    if (req.user.role === 'bda') {
      filter.assignedTo = req.user._id;
    } else if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .populate('assignedTo', 'name email role avatar')
        .populate('createdBy', 'name')
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(Number(limit)),
      Lead.countDocuments(filter),
    ]);

    res.json({
      success: true,
      count: leads.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
      leads,
    });
  } catch (err) {
    console.error('getLeads error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email role avatar phone')
      .populate('createdBy', 'name email');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    // BDA can only see their own leads
    if (req.user.role === 'bda' && lead.assignedTo?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Create lead
// @route   POST /api/leads
// @access  Private
const createLead = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };

    // If BDA creates a lead, auto-assign to themselves
    if (req.user.role === 'bda') {
      data.assignedTo = req.user._id;
    }

    const lead = await Lead.create(data);
    await lead.populate('assignedTo', 'name email role avatar');
    await lead.populate('createdBy', 'name');

    res.status(201).json({ success: true, lead });
  } catch (err) {
    console.error('createLead error:', err);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });

    if (req.user.role === 'bda' && lead.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    // Set actualCloseDate when marking as won/lost
    if (req.body.status && ['won', 'lost'].includes(req.body.status) && !['won', 'lost'].includes(lead.status)) {
      req.body.actualCloseDate = new Date();
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('assignedTo', 'name email role avatar')
      .populate('createdBy', 'name');

    res.json({ success: true, lead });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Update lead status (for Kanban drag-and-drop)
// @route   PUT /api/leads/:id/status
// @access  Private
const updateLeadStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const update = { status };
    if (['won', 'lost'].includes(status)) {
      update.actualCloseDate = new Date();
    }

    const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true }).populate('assignedTo', 'name email avatar');

    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
    res.json({ success: true, lead });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private/Manager+
const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findByIdAndDelete(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found.' });
    res.json({ success: true, message: 'Lead deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @desc    Get lead pipeline counts by status
// @route   GET /api/leads/stats
// @access  Private
const getLeadStats = async (req, res) => {
  try {
    const filter = req.user.role === 'bda' ? { assignedTo: req.user._id } : {};

    const stats = await Lead.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
    ]);

    const formatted = stats.reduce((acc, s) => {
      acc[s._id] = { count: s.count, totalValue: s.totalValue };
      return acc;
    }, {});

    res.json({ success: true, stats: formatted });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getLeads, getLead, createLead, updateLead, updateLeadStatus, deleteLead, getLeadStats };

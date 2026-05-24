const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Lead = require('../models/Lead');
const Client = require('../models/Client');
const Activity = require('../models/Activity');

const connectDB = require('./db');

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal-sent', 'negotiation', 'won', 'lost'];
const SOURCES = ['cold-call', 'email', 'referral', 'social-media', 'website', 'trade-show', 'exhibition'];
const PRIORITIES = ['low', 'medium', 'high'];
const PRODUCTS = [
  'CNC Machined Parts', 'Sheet Metal Fabrication', 'Industrial Valves',
  'Hydraulic Cylinders', 'Gear Assemblies', 'Conveyor Systems',
  'Pressure Vessels', 'Custom Castings', 'Electronic Control Panels',
];
const INDUSTRIES = ['Automotive', 'Aerospace', 'Oil & Gas', 'Pharmaceutical', 'Food Processing', 'Construction', 'Mining', 'Energy'];
const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'demo', 'follow-up', 'note'];

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomDate = (daysBack) => new Date(Date.now() - randomInt(0, daysBack) * 86400000);
const futureDate = (daysAhead) => new Date(Date.now() + randomInt(1, daysAhead) * 86400000);

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await Promise.all([User.deleteMany(), Lead.deleteMany(), Client.deleteMany(), Activity.deleteMany()]);
  console.log('🗑️  Cleared existing data');

  const hashedPassword = async (pw) => bcrypt.hash(pw, 10);

  // --- USERS ---
  const users = await User.insertMany([
    {
      name: 'Arjun Sharma',
      email: 'admin@isaii.in',
      password: await hashedPassword('Admin@123'),
      role: 'admin',
      phone: '9876543210',
      department: 'Management',
      target: 5000000,
      isActive: true,
    },
    {
      name: 'Priya Mehta',
      email: 'manager1@isaii.in',
      password: await hashedPassword('Manager@123'),
      role: 'manager',
      phone: '9876543211',
      department: 'Sales',
      target: 3000000,
      isActive: true,
    },
    {
      name: 'Ravi Kumar',
      email: 'manager2@isaii.in',
      password: await hashedPassword('Manager@123'),
      role: 'manager',
      phone: '9876543212',
      department: 'Business Development',
      target: 3000000,
      isActive: true,
    },
    {
      name: 'Sneha Patel',
      email: 'bda1@isaii.in',
      password: await hashedPassword('BDA@123'),
      role: 'bda',
      phone: '9876543213',
      department: 'Sales',
      target: 1500000,
      isActive: true,
    },
    {
      name: 'Rahul Singh',
      email: 'bda2@isaii.in',
      password: await hashedPassword('BDA@123'),
      role: 'bda',
      phone: '9876543214',
      department: 'Sales',
      target: 1500000,
      isActive: true,
    },
    {
      name: 'Anjali Nair',
      email: 'bda3@isaii.in',
      password: await hashedPassword('BDA@123'),
      role: 'bda',
      phone: '9876543215',
      department: 'Business Development',
      target: 1200000,
      isActive: true,
    },
    {
      name: 'Vikram Joshi',
      email: 'bda4@isaii.in',
      password: await hashedPassword('BDA@123'),
      role: 'bda',
      phone: '9876543216',
      department: 'Business Development',
      target: 1200000,
      isActive: true,
    },
    {
      name: 'Divya Reddy',
      email: 'bda5@isaii.in',
      password: await hashedPassword('BDA@123'),
      role: 'bda',
      phone: '9876543217',
      department: 'Sales',
      target: 1000000,
      isActive: true,
    },
  ]);
  console.log(`👥 Created ${users.length} users`);

  const bdaUsers = users.filter((u) => u.role === 'bda');
  const allUsers = users;

  // --- CLIENTS (won deals become clients) ---
  const clientData = [
    { company: 'Tata Motors Ltd', contactPerson: 'Vikash Gupta', email: 'vgupta@tatamotors.com', phone: '9811234567', industry: 'Automotive', city: 'Pune' },
    { company: 'ISRO Facilities', contactPerson: 'Dr. Ramesh Nair', email: 'r.nair@isro.gov.in', phone: '9822345678', industry: 'Aerospace', city: 'Bengaluru' },
    { company: 'ONGC Petro', contactPerson: 'Suresh Malhotra', email: 'smalhotra@ongc.co.in', phone: '9833456789', industry: 'Oil & Gas', city: 'Mumbai' },
    { company: 'Sun Pharma Industries', contactPerson: 'Kavita Shah', email: 'kshah@sunpharma.com', phone: '9844567890', industry: 'Pharmaceutical', city: 'Vadodara' },
    { company: 'Britannia Industries', contactPerson: 'Amit Chopra', email: 'achopra@britannia.co.in', phone: '9855678901', industry: 'Food Processing', city: 'Kolkata' },
    { company: 'L&T Construction', contactPerson: 'Rajendra Iyer', email: 'r.iyer@lntecc.com', phone: '9866789012', industry: 'Construction', city: 'Chennai' },
  ];

  const clients = await Client.insertMany(
    clientData.map((c, i) => ({
      ...c,
      address: { city: c.city, state: 'India', country: 'India' },
      totalRevenue: randomInt(500000, 5000000),
      status: 'active',
      assignedTo: bdaUsers[i % bdaUsers.length]._id,
      notes: `Key account. Established relationship since ${randomInt(2018, 2022)}.`,
      tags: [c.industry.toLowerCase(), 'key-account'],
      createdBy: allUsers[0]._id,
    }))
  );
  console.log(`🏢 Created ${clients.length} clients`);

  // --- LEADS ---
  const companies = [
    'Mahindra Auto', 'Hindustan Aeronautics', 'Bharat Petroleum', 'Dr. Reddy Labs',
    'Dabur India', 'GMR Infrastructure', 'Vedanta Resources', 'Adani Power',
    'Reliance Industries', 'Bajaj Auto', 'Hero MotoCorp', 'Ashok Leyland',
    'JSW Steel', 'Hindalco Industries', 'ACC Cement', 'UltraTech Cement',
    'Thermax Ltd', 'BHEL', 'Siemens India', 'ABB India', 'Bosch India',
    'Honeywell India', 'Schneider Electric', 'Emerson Automation', 'Parker Hannifin',
  ];

  const contactNames = [
    'Mohan Verma', 'Sunil Kapoor', 'Rekha Agarwal', 'Deepak Tiwari', 'Neha Bose',
    'Sandeep Yadav', 'Pooja Sharma', 'Aryan Menon', 'Kavitha Pillai', 'Girish Rao',
    'Sunita Desai', 'Manoj Dubey', 'Leela Krishnamurthy', 'Tarun Banerjee', 'Ritu Saxena',
  ];

  const leadsData = [];
  for (let i = 0; i < 60; i++) {
    const status = randomItem(LEAD_STATUSES);
    const bda = randomItem(bdaUsers);
    const value = randomInt(50000, 2000000);
    const isWon = status === 'won';
    const isLost = status === 'lost';

    leadsData.push({
      title: `${randomItem(PRODUCTS)} — ${companies[i % companies.length]}`,
      company: companies[i % companies.length],
      contactPerson: randomItem(contactNames),
      email: `contact${i}@${companies[i % companies.length].toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `98${randomInt(10000000, 99999999)}`,
      source: randomItem(SOURCES),
      status,
      value,
      priority: randomItem(PRIORITIES),
      assignedTo: bda._id,
      product: randomItem(PRODUCTS),
      industry: randomItem(INDUSTRIES),
      expectedCloseDate: isWon || isLost ? randomDate(90) : futureDate(60),
      actualCloseDate: isWon || isLost ? randomDate(30) : undefined,
      notes: `Initial inquiry from trade show. Follow up scheduled.`,
      tags: [randomItem(INDUSTRIES).toLowerCase(), randomItem(SOURCES)],
      lostReason: isLost ? randomItem(['Budget constraints', 'Competitor selected', 'No decision made', 'Requirement changed']) : undefined,
      createdBy: bda._id,
      createdAt: randomDate(120),
    });
  }

  const leads = await Lead.insertMany(leadsData);
  console.log(`📋 Created ${leads.length} leads`);

  // --- ACTIVITIES ---
  const outcomes = ['Positive response', 'Will call back', 'Needs more time', 'Ready to proceed', 'Requested proposal', 'Price negotiation'];
  const activitiesData = [];

  for (let i = 0; i < 120; i++) {
    const lead = randomItem(leads);
    const bda = randomItem(bdaUsers);
    const type = randomItem(ACTIVITY_TYPES);
    const completed = Math.random() > 0.3;

    activitiesData.push({
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} with ${lead.contactPerson}`,
      description: `Discussed ${lead.product} requirements. ${randomItem(outcomes)}.`,
      lead: lead._id,
      performedBy: bda._id,
      scheduledAt: randomDate(60),
      completedAt: completed ? randomDate(55) : undefined,
      status: completed ? 'completed' : randomItem(['pending', 'cancelled']),
      outcome: completed ? randomItem(outcomes) : undefined,
      duration: ['call', 'meeting', 'demo'].includes(type) ? randomInt(15, 90) : undefined,
      createdAt: randomDate(60),
    });
  }

  await Activity.insertMany(activitiesData);
  console.log(`📌 Created ${activitiesData.length} activities`);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:    admin@isaii.in      / Admin@123');
  console.log('Manager:  manager1@isaii.in   / Manager@123');
  console.log('BDA:      bda1@isaii.in       / BDA@123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

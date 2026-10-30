// Usage: npm run seed   (wipes the database and inserts demo data)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Lab = require('./models/Lab');
const Template = require('./models/Template');
const Inspection = require('./models/Inspection');
const Incident = require('./models/Incident');

const days = (n) => new Date(Date.now() - n * 24 * 3600 * 1000);

(async () => {
  await connectDB();
  await Promise.all([User, Lab, Template, Inspection, Incident].map((m) => m.deleteMany({})));

  const admin = await User.create({ name: 'Dr. Admin', email: 'admin@lab.com', password: 'Admin@123', role: 'admin' });
  const inspector = await User.create({ name: 'Nimal Perera', email: 'inspector@lab.com', password: 'Inspector@123', role: 'inspector' });
  const tech = await User.create({ name: 'Kamal Silva', email: 'tech@lab.com', password: 'Tech@123', role: 'technician' });

  const labs = await Lab.insertMany([
    { name: 'High Voltage Laboratory', code: 'HV-01', building: 'EIE Block A', capacity: 15, hazardLevel: 'high', manager: admin._id },
    { name: 'Electronics Laboratory', code: 'EL-02', building: 'EIE Block A', capacity: 30, hazardLevel: 'medium', manager: inspector._id },
    { name: 'Power Electronics Laboratory', code: 'PE-03', building: 'EIE Block B', capacity: 20, hazardLevel: 'high', manager: inspector._id },
    { name: 'Computer Networks Laboratory', code: 'CN-04', building: 'EIE Block C', capacity: 40, hazardLevel: 'low', manager: admin._id },
    { name: 'Chemistry Support Laboratory', code: 'CH-05', building: 'Science Block', capacity: 25, hazardLevel: 'high', manager: admin._id },
  ]);

  const generalTpl = await Template.create({
    title: 'General Laboratory Safety Checklist',
    description: 'Standard monthly inspection for all laboratories',
    createdBy: admin._id,
    items: [
      { text: 'Fire extinguishers are present, charged and within service date', category: 'Fire Safety', critical: true },
      { text: 'Emergency exits are clear and signs are illuminated', category: 'Emergency', critical: true },
      { text: 'First aid kit is stocked and accessible', category: 'Emergency' },
      { text: 'Emergency stop / main power cut-off is accessible and labelled', category: 'Electrical', critical: true },
      { text: 'Power cables are free from damage and not overloaded', category: 'Electrical' },
      { text: 'PPE (gloves, goggles, lab coats) is available and in good condition', category: 'PPE' },
      { text: 'Safety rules and emergency contacts are displayed', category: 'General' },
      { text: 'Work benches are clean and free from clutter', category: 'General' },
    ],
  });
  await Template.create({
    title: 'Chemical Storage & Handling Checklist',
    description: 'For laboratories that store or use chemicals',
    createdBy: admin._id,
    items: [
      { text: 'Chemicals are labelled and stored according to compatibility', category: 'Chemical', critical: true },
      { text: 'Safety Data Sheets (SDS) are available for all chemicals', category: 'Chemical' },
      { text: 'Fume hood airflow is operating correctly', category: 'Chemical', critical: true },
      { text: 'Eye-wash station and safety shower are functional', category: 'Emergency', critical: true },
      { text: 'Hazardous waste is segregated and containers are sealed', category: 'Waste' },
      { text: 'Spill kit is available and complete', category: 'Chemical' },
    ],
  });

  // Completed historical inspections with varied outcomes
  const outcomes = [
    { lab: labs[0], d: 20, fails: [4] },
    { lab: labs[1], d: 35, fails: [] },
    { lab: labs[2], d: 50, fails: [0, 5, 7] },
    { lab: labs[3], d: 12, fails: [7] },
  ];
  for (const o of outcomes) {
    const insp = new Inspection({
      lab: o.lab._id,
      template: generalTpl._id,
      templateTitle: generalTpl.title,
      inspector: inspector._id,
      scheduledDate: days(o.d),
      completedDate: days(o.d),
      status: 'completed',
      summary: o.fails.length ? 'Corrective actions required for failed items.' : 'Laboratory is in good condition.',
      responses: generalTpl.items.map((it, idx) => ({
        text: it.text,
        category: it.category,
        critical: it.critical,
        result: o.fails.includes(idx) ? 'fail' : 'pass',
        remarks: o.fails.includes(idx) ? 'Needs corrective action' : '',
      })),
    });
    insp.calculateResult();
    await insp.save();
    await Lab.findByIdAndUpdate(o.lab._id, { lastInspectionDate: insp.completedDate, lastScore: insp.score });
  }

  // One pending inspection to demonstrate the checklist workflow
  await Inspection.create({
    lab: labs[4]._id,
    template: generalTpl._id,
    templateTitle: generalTpl.title,
    inspector: inspector._id,
    scheduledDate: new Date(),
    responses: generalTpl.items.map((i) => ({ text: i.text, category: i.category, critical: i.critical })),
  });

  await Incident.insertMany([
    { lab: labs[2]._id, reportedBy: tech._id, title: 'Capacitor bank discharge spark', description: 'Small spark observed while discharging the DC-link capacitor bank.', severity: 'high', status: 'investigating' },
    { lab: labs[0]._id, reportedBy: tech._id, title: 'Damaged earth-leakage warning lamp', description: 'Warning lamp on test panel is not lighting.', severity: 'medium', status: 'open' },
    { lab: labs[1]._id, reportedBy: inspector._id, title: 'Minor soldering burn', description: 'Student received a minor burn. First aid administered.', severity: 'low', status: 'resolved', resolution: 'Reminded students to use soldering stand.', resolvedAt: days(3) },
  ]);

  console.log('\nSeed complete. Demo accounts:');
  console.log('  admin      admin@lab.com      / Admin@123');
  console.log('  inspector  inspector@lab.com  / Inspector@123');
  console.log('  technician tech@lab.com       / Tech@123\n');
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

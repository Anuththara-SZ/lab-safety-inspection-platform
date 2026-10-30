const Lab = require('../models/Lab');
const Inspection = require('../models/Inspection');
const Incident = require('../models/Incident');
const asyncHandler = require('../utils/asyncHandler');

const OVERDUE_DAYS = 90;

exports.getStats = asyncHandler(async (req, res) => {
  const cutoff = new Date(Date.now() - OVERDUE_DAYS * 24 * 3600 * 1000);

  const [labCount, scheduled, completed, openIncidents, avgAgg, byRisk, bySeverity, trend, overdueLabs, recentIncidents] =
    await Promise.all([
      Lab.countDocuments({ status: 'active' }),
      Inspection.countDocuments({ status: 'scheduled' }),
      Inspection.countDocuments({ status: 'completed' }),
      Incident.countDocuments({ status: { $ne: 'resolved' } }),
      Inspection.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, avg: { $avg: '$score' } } }]),
      Inspection.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: '$riskLevel', count: { $sum: 1 } } }]),
      Incident.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
      Inspection.find({ status: 'completed' })
        .sort('-completedDate')
        .limit(10)
        .select('score completedDate lab')
        .populate('lab', 'code'),
      Lab.find({
        status: 'active',
        $or: [{ lastInspectionDate: { $lt: cutoff } }, { lastInspectionDate: null }, { lastInspectionDate: { $exists: false } }],
      })
        .select('name code hazardLevel lastInspectionDate')
        .limit(10),
      Incident.find({ status: { $ne: 'resolved' } }).sort('-createdAt').limit(5).populate('lab', 'code'),
    ]);

  const toMap = (arr) => arr.reduce((m, x) => ({ ...m, [x._id]: x.count }), {});

  res.json({
    totals: {
      activeLabs: labCount,
      scheduledInspections: scheduled,
      completedInspections: completed,
      openIncidents,
      averageScore: avgAgg[0] ? Math.round(avgAgg[0].avg) : 0,
    },
    inspectionsByRisk: toMap(byRisk),
    incidentsBySeverity: toMap(bySeverity),
    scoreTrend: trend
      .reverse()
      .map((i) => ({ date: i.completedDate, lab: i.lab ? i.lab.code : '-', score: i.score })),
    overdueLabs,
    overdueDays: OVERDUE_DAYS,
    recentIncidents,
  });
});

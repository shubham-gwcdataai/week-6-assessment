const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:   { type: String, default: 'anonymous' },
  username: { type: String, default: 'anonymous' },
  role:     { type: String, default: 'unknown' },
  action:   { type: String, required: true },   
  resource: { type: String, required: true },   
  method:   { type: String },                   
  success:  { type: Boolean, default: true },
  message:  { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },

}, {
  timestamps: true,   
  collection: 'audit_logs',
});

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);

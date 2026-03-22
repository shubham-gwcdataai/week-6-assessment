const mongoose = require('mongoose');
const AuditLog = require('../models/mongo/AuditLog');

const auditLog = async ({ userId, username, role, action, resource, method, success = true, message, req }) => {
  if (mongoose.connection.readyState !== 1) {
    console.warn(` Audit log skipped (MongoDB not ready): ${action}`);
    return;
  }
  try {
    await AuditLog.create({
      userId:    userId   || 'anonymous',
      username:  username || 'anonymous',
      role:      role     || 'unknown',
      action,
      resource,
      method,
      success,
      message,
      ipAddress: req?.ip || 'unknown',
      userAgent: req?.headers?.['user-agent'] || 'unknown',
    });
  } catch (err) {
    console.error('Audit log write failed:', err.message);
  }
};

module.exports = auditLog;
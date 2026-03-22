const auditLog = require('../utils/auditLogger');
const ROLE_HIERARCHY = ['user', 'moderator', 'admin'];
const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    const userRole = req.user?.role;

    if (!userRole) {
      return res.status(401).json({ error: 'Not authenticated.' });
    }

    if (!allowedRoles.includes(userRole)) {
      await auditLog({
        userId: req.user.id,
        username: req.user.username,
        role: userRole,
        action: 'ACCESS_DENIED',
        resource: req.path,
        method: req.method,
        success: false,
        message: `Role '${userRole}' tried to access resource requiring [${allowedRoles.join(', ')}]`,
        req,
      });

      return res.status(403).json({
        error: `Access denied. Required role: [${allowedRoles.join(' or ')}]. Your role: ${userRole}`,
      });
    }

    await auditLog({
      userId: req.user.id,
      username: req.user.username,
      role: userRole,
      action: 'ACCESS_GRANTED',
      resource: req.path,
      method: req.method,
      success: true,
      req,
    });

    next();
  };
};
const authorizeMinRole = (minRole) => {
  const minIndex = ROLE_HIERARCHY.indexOf(minRole);
  return async (req, res, next) => {
    const userRoleIndex = ROLE_HIERARCHY.indexOf(req.user?.role);
    if (userRoleIndex >= minIndex) return next();
    return res.status(403).json({ error: `Requires at least '${minRole}' role.` });
  };
};

module.exports = { authorize, authorizeMinRole };

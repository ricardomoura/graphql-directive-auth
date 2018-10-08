const isAuthenticated = require('./isAuthenticated');
const isAdmin = require('./isAdmin');
const isCustomer = require('./isCustomer');
const hasRole = require('./hasRole');

module.exports = {
  isAuthenticated,
  hasRole,
  isAdmin,
  isCustomer,
};

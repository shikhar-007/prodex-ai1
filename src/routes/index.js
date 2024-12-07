const AuthRoute = require('./auth.routes');
const OtpRoute = require('./otp.routes');
const AdminRoute = require('./admin.routes');
const UserRoute = require('./user.routes');
const TwoFARoute = require('./2fa.routes');
const ChatRoute = require('./chat.routes');

module.exports = [
  new AuthRoute(),
  new OtpRoute(),
  new AdminRoute(),
  new UserRoute(),
  new TwoFARoute(),
  new ChatRoute(),
];

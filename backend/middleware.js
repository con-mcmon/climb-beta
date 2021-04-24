const User = require('./models/user');

async function getUser(req, res, next) {
  const { userId } = req.session;
  if (userId) {
    const user = await User.findOne({ _id: userId });
    res.locals.user = user;
  }
  next();
}

//route protectioon
function authenticateUser(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(403).send();
  }
}

exports.authenticateUser = authenticateUser;
exports.getUser = getUser;

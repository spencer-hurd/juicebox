function requireUser(req, res, next) {
  if (!req.user) {
    next({
      name: "MissingUserError",
      message: "You must be logged in to perform this action.",
    });
  }

  next();
}

async function requireActiveUser(req, res, next) {
  await requireUser;
  if (!req.user.active) {
    next({
      name: "InactiveUserError",
      message: "Your account must be active to perform this action.",
    });
  }

  next();
}

module.exports = {
  requireUser,
  requireActiveUser,
};

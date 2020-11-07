module.exports = function(req, res, next) {
	res.locals.isAuth = req.session.isAuthorized;
	res.locals.csrf = req.csrfToken()
	next();
};
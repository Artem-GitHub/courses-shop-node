module.exports = function(req, res, next) {
	if(!req.session.isAuthorized) {
		return res.redirect("/auth/login#login");
	}
	next();
};
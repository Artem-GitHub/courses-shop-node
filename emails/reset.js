const keys = require("../keys/keys.js");

module.exports = function(email, token) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: "Restore access",
		html: `
			<h1>Forgot your password?</h1>
			<p>If not, please ignore this letter.</p>
			<p>Otherwise click on the link below:</p>
    		<a href="${keys.BASE_URL}/auth/password/${token}">Restore access</a>
    		<hr>
			<a href="${keys.BASE_URL}">Courses shop</a>
		`
	}
};
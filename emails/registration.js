
const keys = require("../keys/keys.js");

module.exports = function(email) {
	return {
		to: email,
		from: keys.EMAIL_FROM,
		subject: "account created",
		html: `
			<h1>Welcome our shop</h1>
			<p>Account successfully created with email - ${email}</p>
			<hr>
			<a href="${keys.BASE_URL}">Courses shop</a>
		`
	}
};
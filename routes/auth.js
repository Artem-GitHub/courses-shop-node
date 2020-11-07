const {Router} = require("express");
const router = Router();
const keys = require("../keys/keys.js");
const regEmail = require("../emails/registration.js");
const resetEmail = require("../emails/reset.js");
const nodemailer = require("nodemailer");
const sendgrid = require("nodemailer-sendgrid-transport");
const User = require("../models/user.js");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const {validationResult} = require("express-validator");
const {registerValidators} = require("../utils/validators.js");

const transporter = nodemailer.createTransport(sendgrid({
	auth: {api_key: keys.SENDGRID_API_KEY}
}));

router.get("/login", async (req, res) => {
	res.render("auth/login", {
		title: "Autorization",
		isLogin: true,
		logError: req.flash("logError"),
		regError: req.flash("regError")
	});
});

router.get("/logout", async (req, res) => {
	req.session.destroy(() => {
		res.redirect("/auth/login#login");
	});
});

router.post("/login", async (req, res) => {

	try {
		const {email, password} = req.body;

		const errors = validationResult(req);

		if(!errors.isEmpty()) {
			req.flash("logError", errors.array()[0].msg);
			return res.status(422).redirect("/auth/login#login");
		}

		else {
			const candidate = await User.findOne({email});

			if(candidate) {
				const areSame = await bcrypt.compare(password, candidate.password);

				if(areSame) {
					req.session.isAuthorized = true;
					req.session.user = candidate;
					req.session.save(err => {
						if(err) {
							throw err;
						}
						res.redirect("/");
					});
				}
				else {
					req.flash("logError", "Invalid password!");
					res.redirect("/auth/login#login");
				}
			}
			else {
				req.flash("logError", "This email is not registered");
				res.redirect("/auth/login#login");
			}
		}
	}
	catch(err) {
		console.log(err);
	}
});

router.post("/register", registerValidators, async (req, res) => {
	try {
		const {email, password, name} = req.body;

		const errors = validationResult(req);

		if(!errors.isEmpty()) {
			req.flash("regError", errors.array()[0].msg);
			return res.status(422).redirect("/auth/login#register");
		}
		const hashPassword = await bcrypt.hash(password, 10);
		const user = new User({
			email, name, password: hashPassword, cart: {items: []}
		});
		await user.save();
		res.redirect("/auth/login#login");
		await transporter.sendMail(regEmail(email));

	}
	catch(err) {
		console.log(err);
	}
});

router.get("/reset", (req, res) => {
	res.render("auth/reset", {
		title: "Forgot your password",
		error: req.flash("error")
	});
});

router.post("/reset", (req, res) => {
	try {
		crypto.randomBytes(32, async (err, buffer) => {
			if(err) {
				req.flash("error", "Something went wrong, please try again later");
				return res.redirect("/auth/reset"); 
			}

			const token = buffer.toString("hex");
			const candidate = await User.findOne({email: req.body.email});

			if(candidate) {
				candidate.resetToken = token;
				candidate.resetTokenExp = Date.now() + 60 * 60 * 1000 //Время жизни один час
				await candidate.save();
				await transporter.sendMail(resetEmail(candidate.email, token));
				res.redirect("/auth/login");
			}
			else {
				req.flash("error", "Email not found");
				res.redirect("/auth/reset");
			}
		});
	}
	catch(err) {
		console.log(err);
	}
});

router.get("/password/:token", async (req, res) => {
	if (!req.params.token) {
		return res.redirect("/auth/login");
	}
	try {
		const user = await User.findOne({
			resetToken: req.params.token,
			resetTokenExp: {$gt: Date.now()}
		});

		if (!user) {
			return res.redirect("/auth/login");
		}
		else {
			res.render("auth/password", {
				title: "Restore password",
				error: req.flash("error"),
				userId: user._id.toString(),
				token: req.params.token
			});
		}
	}
	catch(err) {
		console.log(err);
	}
});

router.post("/password", async (req, res) => {
	try {
		const user = await User.findOne({
			_id: req.body.userId,
			resetToken: req.body.token,
			resetTokenExp: {$gt: Date.now()}
		});

		if(user) {
			user.password = await bcrypt.hash(req.body.password, 10);
			user.resetToken = null;
			user.resetTokenExp = null;
			await user.save();
			res.redirect("/");
		}
		else {
			req.flash("loginError", "Token expired");
			res.redirect("/auth/login");
		}
	}
	catch(err) {
		console.log(err);
	}
});

module.exports = router;
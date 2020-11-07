const {Router} = require("express");
const router = Router();
const auth = require("../middleware/auth.js");
const User = require("../models/user.js");

router.get("/", auth, async (req, res) => {
	res.render("profile", {
		title: "Profile",
		isProfile: true,
		user: req.user.toObject()
	});
});

router.post("/", auth, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);
		const toChange = {
			name: req.body.name
		}

		if (req.file) {
			toChange.photoUrl = req.file.path;
		}

		Object.assign(user, toChange);
		await user.save();
		res.redirect("/profile");
	}
	catch(err) {
		console.log(err);
	}
});

module.exports = router;
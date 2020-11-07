const {Router} = require("express");
const Course = require("../models/course");
const router = Router();
const auth = require("../middleware/auth.js");
const {validationResult} = require("express-validator");
const {courseValidators} = require("../utils/validators.js");

router.get('/', async (req, res) => {
    try {
        const courses = await Course.find()
        	.populate("userId", "email name")
        		.select("price title img");
        res.render('courses', {
            title: 'Courses',
            isCourses: true,
            userId: req.user ? req.user._id.toString() : null,
            courses
        });
    } catch (e) {
        console.log(e);
    }
});

router.get('/:id', async (req, res) => {
	try {
	    const course = await Course.findById(req.params.id);
    	res.render('course', {
	        layout: 'empty',
	        title: `Course ${course.title}`,
	        course: course.toObject()
    	});
	}
	catch(err) {
		console.log(err);
	}

});

function isOwner(course, req) {
	return course.userId.toString() === req.user._id.toString()
};

router.get("/:id/edit", auth, async (req, res) => {

	if (!req.query.allow) {
		return res.redirect("/");
	}

	try {
		const course = await Course.findById(req.params.id);

		if (!isOwner(course, req)) {
			res.redirect("/courses");
		}
		res.render("course-edit", {
			title: `Edit ${course.title}`,
			course: course.toObject()
		});
	}
	catch(err) {
		console.log(err);
	}
});

router.post("/edit", auth, courseValidators, async (req, res) => {
	try {
		const {id} = req.body;
		const errors = validationResult(req);

		if(!errors.isEmpty()) {
			return res.status(422).redirect(`/courses/${id}/edit?allow=true`)
		}

		delete req.body.id;
		const course = await Course.findById(id);

		if(!isOwner(course, req)) {
			return res.redirect("/courses");
		}

		Object.assign(course, req.body);
		await course.save();
		res.redirect("/courses");
	}
	catch(err) {
		console.log(err);
	}
});

router.post("/remove", auth, async (req, res) => {
	try {
		await Course.deleteOne({
			_id: req.body.id,
			userId: req.user._id
		});
		res.redirect("/courses");
	}
	catch(e) {
		console.log(e);
	}
});

module.exports = router;
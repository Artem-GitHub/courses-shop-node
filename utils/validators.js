const {body} = require("express-validator");
const User = require("../models/user.js");

exports.loginValidators = [
		body("email")
		.isEmail().withMessage("enter correct email")
			.normalizeEmail(),

	body("password", "Password length must be at least 6 characters")//Второй спсоб записи сообщения об ошибке
		.isLength({min: 6, max: 56})
			.isAlphanumeric()
				.trim()
];

exports.registerValidators = [
	body("name")
		.isLength({min: 3})
			.withMessage("name length must be at least 3 characters")
				.trim(),//Удаляет лишние пробелы

	body("email")
		.isEmail().withMessage("enter correct email")
			.custom( async (value, {req}) => {
				try {
					const user = await User.findOne({email: value});

					if (user) {
						return Promise.reject("Account is already registered!");//обращаемся к глобальному классу промис
					}
				}
				catch(err) {
					console.log(err);
				}
			}).normalizeEmail(),

	body("password", "Password length must be at least 6 characters")//Второй спсоб записи сообщения об ошибке
		.isLength({min: 6, max: 56})
			.isAlphanumeric()
				.trim(),

	body("confirm")
		.custom((value, {req}) => {
			if (value !== req.body.password) {
				throw new Error("Passwords do not match");
			}
			return true;
		}).trim()
];

exports.courseValidators = [
	body("title")
		.isLength({min: 3})
			.withMessage("Course name length must be at least 3 characters").trim(),

	body("price")
		.isNumeric()
			.withMessage("Fill in the price field with numbers"),

	body("img", "Enter correct URL")
		.isURL()
];
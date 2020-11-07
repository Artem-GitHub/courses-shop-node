
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const keys = require("./keys/keys.js");
const expHbs = require("express-handlebars");
const Handlebars = require('handlebars');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');
const flash = require("connect-flash");
const session = require("express-session");
const MongoStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const helmet = require("helmet"); // security headers
const compression = require("compression"); //compression static files
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const coursesRoutes = require("./routes/courses");
const cardRoutes = require("./routes/card");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile.js");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user.js");
const errorHandler = require("./middleware/error.js");
const fileMiddleware = require("./middleware/file.js");

const app = express();

const hbs = expHbs.create({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'main',
    extname: 'hbs',
    helpers: require("./utils/hbs-helpers.js")
})

app.engine("hbs", hbs.engine)
app.set("view engine", "hbs");
app.set("views", "views");

const store = new MongoStore({
	collection: "sessions",
	uri: keys.MONGODB_URI
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({extended: true}));
app.use(session({
	secret: keys.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store //аналог (store: store)
}));
app.use(fileMiddleware.single("photo"));
app.use(csrf());
app.use(flash());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(compression());

app.use(varMiddleware);
app.use(userMiddleware);

app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/card", cardRoutes);
app.use("/orders", orderRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.use(errorHandler);

const port = process.env.PORT || 3000;

async function start() {
	try {
		await mongoose.connect(keys.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});
		app.listen(port, () => {
			console.log(`Server is runing on port ${port}`);
		});
	}
	catch(e) {
		console.log(e);
	}
}
start();
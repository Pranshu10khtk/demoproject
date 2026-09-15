const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("../../utils/ExpressError.js");
const listingRoutes = require("../../routes/listing.js");
const reviewsRoutes = require("../../routes/review.js");

const app = express();
const ROOT = path.join(__dirname, "../..");
const MONGO_URL = "mongodb://127.0.0.1:27017/test";
const SESSION_SECRET = "development-session-secret";

const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../../models/user.js");
const userRoutes = require("../../routes/user.js");

mongoose.connect(MONGO_URL)
	.then(() => console.log("connected to the DB"))
	.catch((err) => console.log("database connection failed:", err.message));

app.set("view engine", "ejs");
app.set("views", path.join(ROOT, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(ROOT, "public")));

app.use(cookieParser(SESSION_SECRET));
app.use(session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 }
}));


//for user password
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(async (identifier, password, done) => {
	try {
		const normalizedIdentifier = identifier.trim();
		const user = await User.findOne({
			$or: [
				{ username: normalizedIdentifier },
				{ email: normalizedIdentifier.toLowerCase() }
			]
		});

		if (!user) {
			return done(null, false, { message: "Enter your username or email and password." });
		}

		return User.authenticate()(user.username, password, (error, authenticatedUser, info) => {
			if (error) return done(error);
			if (!authenticatedUser) {
				return done(null, false, info || { message: "Enter your username or email and password." });
			}
			return done(null, authenticatedUser);
		});
	} catch (error) {
		return done(error);
	}
}));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(flash());
app.use((req, res, next) => {
	res.locals.success = req.flash("success");
	res.locals.error = req.flash("error");
	res.locals.sessionUser = req.user || null;
	next();
});

app.get("/demouser", async (req, res) => {
	let fakeUser = new User({
		email: "my@gmail.com",
		username : "promythes"
	});

	let registereduser = await User.register(fakeUser, "helloworld");
	res.send(registereduser);
});


const classroomRouter = express.Router();

classroomRouter.get("/", (req, res) => {
	res.json({
		message: "Classroom router is working",
		routes: ["/classroom/cookie", "/classroom/stateful", "/classroom/stateless", "/classroom/session", "/classroom/flash", "/classroom/flash/failure"]
	});
});

// Stateful example: the server remembers the counter in req.session.
classroomRouter.get("/stateful", (req, res) => {
	req.session.statefulVisits = (req.session.statefulVisits || 0) + 1;
	res.json({
		protocol: "stateful",
		visits: req.session.statefulVisits,
		message: "This value is stored on the server-side session."
	});
});

// Stateless example: the client sends the cookie value on every request.
classroomRouter.get("/stateless", (req, res) => {
	const visits = Number(req.signedCookies.statelessVisits || 0) + 1;
	res.cookie("statelessVisits", String(visits), {
		signed: true,
		httpOnly: true,
		maxAge: 1000 * 60 * 60
	});
	res.json({
		protocol: "stateless",
		visits,
		message: "This value is carried by the client cookie; the server does not store the counter."
	});
});

classroomRouter.get("/cookie", (req, res) => {
	const theme = req.signedCookies.theme || "light";
	res.cookie("theme", theme === "light" ? "dark" : "light", {
		signed: true,
		httpOnly: true,
		maxAge: 1000 * 60 * 60 * 24 * 30
	});
	res.json({
		currentTheme: theme,
		nextTheme: theme === "light" ? "dark" : "light",
		message: "A signed web cookie was read and updated."
	});
});

classroomRouter.get("/session", (req, res) => {
	req.session.user = req.session.user || { id: 1, name: "Classroom learner" };
	res.json({
		sessionId: req.sessionID,
		user: req.session.user,
		message: "Session information is stored server-side and associated with this session cookie."
	});
});

classroomRouter.get("/flash", (req, res) => {
	req.flash("success", "Flash message stored in the session.");
	res.redirect("/listings");
});

classroomRouter.get("/flash/failure", (req, res) => {
	req.flash("error", "Flash failure message stored in the session.");
	res.redirect("/listings");
});

app.get("/", (req, res) => {
	res.send("Hii, I am root or api");
});
app.use("/classroom", classroomRouter);
app.use("/user", userRoutes);
app.use("/listings", listingRoutes);
app.use("/listings/:id/reviews", reviewsRoutes);

app.use((req, res, next) => next(new ExpressError(404, "Page Not Found")));
app.use((err, req, res, next) => {
	const statusCode = err.statusCode || (err.name === "CastError" ? 404 : 500);
	const message = statusCode === 404
		? "The page you requested does not exist."
		: statusCode === 500
			? "Something went wrong on the server."
			: err.message;
	res.status(statusCode).render("errors/404", { statusCode, message });
});

if (require.main === module) {
	app.listen(8080, () => console.log("server is listening to the port 8080"));
}

module.exports = app;

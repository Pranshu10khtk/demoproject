const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/Listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/test";

async function main() {
    await mongoose.connect(MONGO_URL);
}

main()
    .then(() => {
        console.log("connected to the DB");
    })
    .catch((err) => {
        console.log(err);
    });


    //ejs setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended : true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.send("Hii, I am root or api");
});

// Index Route or all listings
app.get("/listings", wrapAsync(async (req, res) => {
    const allListing = await listing.find({}).lean();
    res.render("listings/index.ejs", { allListing });
}));

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const foundListing = await listing.findById(id);

    if (!foundListing) {
        throw new ExpressError(404, "Page Not Found");
    }

    res.render("listings/show", { foundListing });
}));

// Create Route
app.post("/listings", wrapAsync (async (req, res, next) => {
    const listingData = { ...(req.body.listing || {}) };

    if (!listingData.image?.url?.trim()) {
        delete listingData.image;
    }

    if (!listingData.title?.trim() || listingData.price === undefined || listingData.price === "") {
        return res.status(400).render("listings/new.ejs", {
            error: "Title and price are required to create a listing."
        });
    }

    const newListing = new listing(listingData);
    await newListing.save();
    res.redirect("/listings");

}));

// Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;

    const foundListing = await listing.findById(id);

    if (!foundListing) {
        throw new ExpressError(404, "Page Not Found");
    }

    res.render("listings/edit", { foundListing });
}));

// Update Route
app.put("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    await listing.findByIdAndUpdate(id, {
        ...req.body.listing
    });

    res.redirect(`/listings/${id}`);
}));

// Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;

    await listing.findByIdAndDelete(id);

    res.redirect("/listings");
}));

// app.get("/textListing", async (req, res) => {

//     let sampleListing = new listing({
//         title: "My New Home",
//         description: "By the beach",
//         price: 20000,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();

//     console.log("sample was saved");
//     res.send("successful testing");
// });


app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || (err.name === "CastError" ? 404 : 500);
    const message = statusCode === 404
        ? "The page you requested does not exist."
        : "Something went wrong on the server.";

    res.status(statusCode).render("errors/404", { statusCode, message });
});

app.listen(8080, () => {
    console.log("server is listening to the port 8080");
});
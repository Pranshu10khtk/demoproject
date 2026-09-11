const express = require("express");
const app = express();
const mongoose = require("mongoose");
const listing = require("./models/Listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

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
app.get("/listings", async (req, res) => {
    const allListing = await listing.find({});
    res.render("listings/index.ejs", { allListing });
});

// New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

// Show Route
app.get("/listings/:id", async(req, res) => {
    let { id } = req.params;
    const foundListing = await listing.findById(id);
    res.render("listings/show", { foundListing });
});

// Create Route
app.post("/listings", async (req, res) => {
    const newListing = new listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
});

// Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    let { id } = req.params;

    const foundListing = await listing.findById(id);

    res.render("listings/edit", { foundListing });
});

// Update Route
app.put("/listings/:id", async (req, res) => {
    let { id } = req.params;

    await listing.findByIdAndUpdate(id, {
        ...req.body.listing
    });

    res.redirect(`/listings/${id}`);
});

// Delete Route
app.delete("/listings/:id", async (req, res) => {
    let { id } = req.params;

    await listing.findByIdAndDelete(id);

    res.redirect("/listings");
});

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

app.listen(8080, () => {
    console.log("server is listening to the port 8080");
});
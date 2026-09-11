const mongoose = require("mongoose");
const initdata = require("../data.js");
const listing = require("../models/Listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/test";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("connected to DB");
}

const initDB = async () => {
    await listing.deleteMany({});
    await listing.insertMany(initdata.data);
    console.log("data was initialized");
};

main()
    .then(() => {
        return initDB();
    })
    .then(() => {
        mongoose.connection.close();
    })
    .catch((err) => {
        console.log(err);
    });
    
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

require("dotenv-flow").config();

//routes
app.get("/api/welcome", (req, res) => {
    res.status(200).send({message: "Welcome to the MEN REST API"});
})

const PORT = process.env.PORT || 4000;

app.listen(PORT, function() {
    console.log("Server is running on port: " + PORT)
})

mongoose.connect(
    process.env.DBHOST,
    {
        useUnifiedTopology: true,
        useNewUrlParser: true
    }
).catch(error => console.log('Error connecting to MongoDB' + error));
mongoose.connection.once('open', () => console.log('Connected succesfully to MongoDB'));

module.exports = app;
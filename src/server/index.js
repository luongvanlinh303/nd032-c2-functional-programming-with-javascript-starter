require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "../public")));

// your API calls
app.get("/photos", async (req, res) => {
  try {
    let curiosity_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Curiosity/?api_key=${process.env.API_KEY}`
    ).then((res) => {
      return res.json();
    });
    let curiosity_images = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/Curiosity/photos?earth_date=${curiosity_manifest["photo_manifest"]["max_date"]}&api_key=${process.env.API_KEY}`
    ).then((res) => {
      return res.json();
    });

    let opportunity_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Opportunity/?api_key=${process.env.API_KEY}`
    ).then((res) => {
      return res.json();
    });
    let opportunity_images = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/Opportunity/photos?earth_date=${opportunity_manifest["photo_manifest"]["max_date"]}&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    let spirit_manifest = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/manifests/Spirit/?api_key=${process.env.API_KEY}`
    ).then((res) => {
      return res.json();
    });

    let spirit_images = await fetch(
      `https://api.nasa.gov/mars-photos/api/v1/rovers/Spirit/photos?earth_date=${spirit_manifest["photo_manifest"]["max_date"]}&api_key=${process.env.API_KEY}`
    ).then((res) => res.json());

    rovers_info = {
      curiosity: {
        curiosity_manifest,
        curiosity_images,
      },
      opportunity: {
        opportunity_manifest,
        opportunity_images,
      },
      spirit: {
        spirit_manifest,
        spirit_images,
      },
    };
    res.send(rovers_info);
  } catch (err) {
    console.log("error:", err);
  }
});

// example API call
app.get("/apod", async (req, res) => {
  try {
    let image = await fetch(
      `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
    ).then((res) => res.json());
    res.send({ image });
  } catch (err) {
    console.log("error:", err);
  }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));

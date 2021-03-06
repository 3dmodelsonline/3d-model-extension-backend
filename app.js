const path = require("path");
const fs = require("fs");

const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: "*" }));

// Handling static serving of files
const staticRouter = express.Router();
staticRouter.get("/s/*", (req, res) => {
    let relPath = req.path.substring(3);
    if(relPath.length < 1) return res.status(400).send("Bad Request!");

    let absPath = path.join(__dirname, "/static/" + relPath);
    if(!fs.existsSync(absPath)) return res.status(404).send("File Not Found!");
    res.sendFile(absPath);
});

// Handling API requests
const apiRouter = express.Router();
apiRouter.use(express.json());

// Loading API request handlers
let apiModules = fs.readdirSync("./api").filter(file => file.endsWith(".js"));
for(let module of apiModules) { require("./api/" + module)(apiRouter) };

// Fallback for non-existent endpoints
apiRouter.get("/api/*", (req, res) => {
    res.status(400).send("Bad Request!");
});

app.use(staticRouter, apiRouter);
let server = app.listen(5000);
require("./ws")(server);
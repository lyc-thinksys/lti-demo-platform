const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();
const cors = require("cors");
const path = require("path");
const {
  initiateLogin,
  signandSendJwt,
  verifyToken,
} = require("./authController");
const allowedDomains = [
  "http://localhost:3000",
  "http://localhost:5000",
  "https://localhost:3000",
  "https://localhost:5000",
  "self",
];
app.use(express.static(path.join(__dirname, "build")));
const PORT = process.env.PORT || 3000;
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        fontSrc: ["'self'"],
        imgSrc: ["'self'"],
        connectSrc: allowedDomains,
      },
    },
    referrerPolicy: { policy: "no-referrer" },
    xssFilter: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: false,
      preload: true,
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    originAgentCluster: true,
    frameguard: {
      action: "sameorigin",
    },
  })
);

let corsOptionsDelegate = function (req, callback) {
  let corsOptions;
  // console.log("REQUEST DATA---", req);
  if (allowedDomains.indexOf(req.header("Origin")) !== -1) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};
app.use(cors(corsOptionsDelegate));

const limiter = rateLimit({
  max: 200,
  windowMs: 60 * 60 * 1000,
  message: "Too many request from your IP, please try again in an hour!",
});

app.use("/", limiter);

app.use(express.json({ limit: "100kb" }));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.get("/verifytoken", verifyToken);

app.get("/launch/login", initiateLogin);

app.post("/validate/login", signandSendJwt);

app.get("/protected", (req, res) => {
  res.send({ message: "from Protected resource" });
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});

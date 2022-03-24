const config = require("./src/config/config.json");
const open = require("open");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const tokenData = require("./createSampleToken");
const jwksClient = require("jwks-rsa");

exports.initiateLogin = (req, res) => {
  const login_hint = config.login_hint;
  const message_hint = config.message_hint;
  const state = req.query.state;
  if (
    req.query.login_hint === login_hint &&
    req.query.lti_message_hint === message_hint
  ) {
    console.log("HINTS MATCH");
    open("http://localhost:3000?launchlogin=1&state=" + state);
    res.status(200).json({
      status: "success",
      data: { message: "Login Initiated" },
    });
  } else {
    console.log("HINTS DONT MATCH");
    open("http://localhost:3000");
    res.status(401).json({
      status: "Failed",
      data: { message: "Login hint mismatch" },
    });
  }
};

exports.signandSendJwt = async (req, res) => {
  const { user, password, message_hint, login_hint, state } = req.body;
  const passwordEnc = await bcrypt.hash(password, 12);
  const privateKey = fs.readFileSync("./certs/private.pem");
  const cookieOptions = {
    expires: new Date(Date.now() + 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  const token = jwt.sign(tokenData, privateKey, {
    expiresIn: 120,
    algorithm: "RS256",
  });

  res.status(200).json({
    status: "success",
    data: { message: "Authentication Successfull", token },
  });
};

exports.verifyToken = (req, res) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  const client = jwksClient({
    jwksUri: "http://localhost:3000/.well-known/jwks.json",
  });
  function getKey(header, callback) {
    client.getSigningKey(header.kid, function (err, key) {
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  }

  jwt.verify(token, getKey, { algorithm: "RS256" }, function (err, decoded) {
    if (err) {
      res
        .status(401)
        .send({ isTokenVerified: false, message: "token invalid !!" });
    } else {
      console.log("VERIFIED");
      res
        .status(200)
        .send({ isTokenVerified: true, message: "Token Verified" });
    }
  });
};

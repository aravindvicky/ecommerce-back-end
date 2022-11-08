const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = function(req, res, next) {
  const token = req.header("jwt_token");
  // console.log("Hello ",token);
  if (!token) {
    return res.status(403).json({ msg: "authorization denied" });
  }
  try {
    const verify = jwt.verify(token, process.env.jwtSecret,{
      expireIn :'1hr'
    });
    // console.log('verify', req.user)
    req.user = verify.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};

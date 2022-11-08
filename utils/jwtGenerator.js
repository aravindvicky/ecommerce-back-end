const jwt = require("jsonwebtoken");
require("dotenv").config();

function jwtGenerator(user_id,role) {
  // console.log('entered',role)
  const payload = {
    user: {
      id: user_id,
      role 
    }
  };
  // console.log(payload,'hi')
  return jwt.sign(payload, process.env.jwtSecret, { expiresIn: "1h" });
}

module.exports = jwtGenerator;

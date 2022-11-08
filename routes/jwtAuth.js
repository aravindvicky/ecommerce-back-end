const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorize = require("../middleware/authorize");

//authorizeentication

router.post("/register", validInfo, async (req, res) => {
  const { email, name, password } = req.body;

  try {
    const user = await pool.query(`select * from users where user_email = '${email}'`);
    //console.log("user", user)
    // console.log("entered register")
    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    }
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);

    let newUser = await pool.query(
      `insert into users (user_name, user_email, user_password,role) values ($1, $2, $3,$4) returning *`,
      [name, email, bcryptPassword, role='user']
    );
    // console.log(newUser)
    const jwtToken = jwtGenerator(newUser.rows[0].user_id);
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.post("/login", validInfo, async (req, res) => {
  const { email, password} = req.body;
  // console.log("entered login")
  
  try {
    const user = await pool.query(`select * from users where user_email = '${email}'`);
    // console.log("user",user)
    if (user.rows.length === 0) {
      return res.status(401).send({
        accessToken: null,
        authRole: null,
        message: 'Invalid Email or password',
        status: 'failed',
      });
    }
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].user_password
    );
    if (!validPassword) {
      return res.status(401).json("Invalid Credential");
    }
    const jwtToken = jwtGenerator(user.rows[0].user_id,user.rows[0].role);
    // console.log(jwtToken,"helloooooo")
    res.json({ jwtToken ,role:user.rows[0].role});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
}); 


router.post("/add-product", validInfo, async(req, res) =>{
  const {productName, description, price, features,imageurl} = req.body;
  console.log(req.body)
  try {
    const data = await pool.query(`select * from products where product_name='${productName}' and description='${description}' and price='${price}' and features='${features}' and image_url='${imageurl}'`)
    if(data.rows.length > 0){
      return res.status(401).json('product already exists')
    }
    let newData = await pool.query(`insert into products(product_name,description,price,features,image_url) values ($1, $2, $3, $4, $5) returning *`,
    [productName, description, price, features, imageurl])
    console.log(newData,"hiiiiiiiiii")
    return res.json(newData)
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

router.post("/verify", authorize, (req, res) => {
  try {
    res.json(true);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
module.exports = router;
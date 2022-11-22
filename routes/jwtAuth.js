const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db");
const validInfo = require("../middleware/validInfo");
const jwtGenerator = require("../utils/jwtGenerator");
const authorize = require("../middleware/authorize");

//authorizeentication

router.post("/register", validInfo, async (req, res) => {
  const obj = req.body;
  const {name,email,password,mobile,country,reg_date } = obj
  try {
    const user = await pool.query(`select * from users where user_email='${email}' and user_mobile='${mobile}'`);
    if (user.rows.length > 0) {
      return res.status(401).json("User already exist!");
    }
    const salt = await bcrypt.genSalt(10);
    const bcryptPassword = await bcrypt.hash(password, salt);
    var date = new Date()
    obj.reg_date = date;
    let newUser = await pool.query(
      `insert into users (user_name, user_email,user_password,role,user_mobile,user_country,reg_date) values ($1, $2, $3, $4, $5, $6, $7) returning *`,
      [name, email, bcryptPassword, role='user',mobile, country,reg_date]
      
    );
    // console.log(newUser)
    const jwtToken = jwtGenerator(newUser.rows[0].user_id);
    return res.json({ jwtToken });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// Login api

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
    const jwtToken = jwtGenerator(user.rows[0].user_id,user.rows[0].role,user.rows[0].user_email,user.rows[0].user_name,user.rows[0].user_mobile);
    // console.log(jwtToken,"helloooooo")
    res.json({ jwtToken ,role:user.rows[0].role,email:user.rows[0].user_email,mobile:user.rows[0].user_mobile,name:user.rows[0].user_name});
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
}); 

// add product api

router.post("/add-product", async(req, res) =>{
  const {productName, description, price, features,imageurl, category} = req.body;
  console.log(req.body, 'hello')
  try {
    const data = await pool.query(`select * from products where product_name='${productName}' and description='${description}' and price='${price}' and features='${features}' and image_url='${imageurl}'`)
    if(data.rows.length > 0){
      return res.status(401).json('product already exists')
    }
    let newData = await pool.query(`insert into products(product_name,description,price,features,image_url,category) values ($1, $2, $3, $4, $5, $6) returning *`,
    [productName, description, price, features, imageurl,category])
    console.log(newData,"hiiiiiiiiii")
    return res.json(newData)
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
})

// all products api

router.get('/all-products', async (req, res) =>{
  try {
    const data = await pool.query(`select * from products`)
    console.log(data)
    res.json(data.rows)
  } catch (err) {
    console.error(err.message)
  }
})


// edit api

router.get('/edit/:id', async(req, res) =>{
  try {
    const data = await (await pool.query(`select * from products where id=${req.params.id}`)).rows
    console.log(res)
    res.send(data).end()
  } catch (err) {
    console.error(err.message)
  }
})


router.get("/get/:id",async(req,res)=>{
  const {id} = req.params;
  const editProduct=await pool.query(`select * from products where id=${id}`)
  res.send(editProduct.rows)
})


// updated api 

router.put('/update', async(req, res) =>{
  try {
    const {productName, description, price,features,category, imageurl} = req.body
    // console.log(req.body,"hiiiiiiiiiiiiiiiiiiiiiiiiiii")
    const data = await pool.query(`update products set product_name='${productName}',description='${description}',features='${features}',price='${price}',category='${category}',image_url='${imageurl}'`).rows
    console.log(data)
    res.send({msg:'Done'})
  } catch (err) {
    console.error(err.message)
  }
})


// delete api 


router.delete('/delete/:id', async(req, res) =>{
  try {
    const deleteData = await pool.query(`delete from products where id=${req.params.id}`)
    const data = await pool.query(`select * from products`)
    // console.log(deleteData,"helloooooooooo")
    res.send(data).end()
  } catch (err) {
    console.error(err.message)
  }
})

// Getting the Customer data

router.get("/all-customers", async(req, res) =>{
  try {
    const customerData = await pool.query(`select user_name,user_email,user_mobile,user_country,role from users`)
    res.send(customerData.rows).end()
  } catch (err) {
    console.error(err.message)
  }
})

router.get('/user-details/:id', async(req, res) =>{
  const {id} = req.params
  try {
    const userData = (await pool.query(`select * from users where user_id=${id}`)).rows
    res.send(userData).status(200)
    console.log(id)
  } catch (err) {
    console.error(err.message)
    res.status({msg: 'something is wrong'})
  }
})

router.post('/user-details-update',async(req, res) =>{
  const{name,email,passowrd,mobile,country} = req.body
  try {
    const data = (await pool.query(`update users set user_name='${name}',user_email='${email}',`))
  } catch (error) {
    console.error(err.message)
  }
})


// Ecommerce page data routes


router.get('/all-products-data', async(req, res) =>{
  try {
    const productData = (await pool.query(`select product_name,description, image_url,price,features from products`)).rows
    res.send(productData).status(200)
  } catch (err) {
    console.error(err.message)
    res.status(401)
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
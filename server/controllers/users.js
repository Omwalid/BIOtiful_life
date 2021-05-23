const util = require('util');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const con = require('../models/connect_db');


const query = util.promisify(con.query).bind(con);
bcrypt.compare = util.promisify(bcrypt.compare);
bcrypt.hash = util.promisify(bcrypt.hash);


exports.LoggedIn = async (req, res) => {
    try {
        var user = await query("SELECT id, email, userName, role_id FROM users WHERE id=?", res.locals.user_id)
        user = JSON.parse(JSON.stringify(user))
        res.status(200).json({ isLoggedIn: true, user: user[0] })
    } catch (e) {
        res.status(401).json({ isLoggedIn: false, message: "user doesn't exist" })
        throw e

    }
}



exports.Register = async (req, res) => {
    try{

    var user_role_id = 3
    
    //crypt the password 
    var hashedPasswd= await bcrypt.hash(req.body.password, 10)
    
    const newUser = {
        fullName: req.body.fullName,
        userName: req.body.userName,
        email: req.body.email,
        phone_number: req.body.phoneNumber,
        password: hashedPasswd,
        role_id : user_role_id
    }

    //create a user in the db
    var adding= await query('INSERT INTO users SET ?', newUser)

    delete newUser.password;
    newUser.user_id=adding.insertId

    //generate a token
    const token = jwt.sign(newUser, process.env.JWT_SECRET)
    res.cookie('access_token', token, { maxAge: 300000, httpOnly: true })
    res.status(201).json({ userAdded: true, user: newUser });
  }
  catch (e) { 
    if (e.message.includes('ER_DUP_ENTRY'))
     return res.status(409).json({userAdded: false, message:"email already exists"})
    else 
    return res.status(500).json({userAdded: false, message:"server problem, retry after a while"})}
}



exports.Login = async (req, res) => {
    try {
        //get info from the req
        const userLogin = {
            email: req.body.email,
            password: req.body.password
        }

        //search for the email in db
        var user = await query("SELECT id,email, password, userName, role_id FROM users WHERE email=?", userLogin.email)
        user = JSON.parse(JSON.stringify(user))

        //if email not found
        if (!user[0]) {
            return res.status(401).json({ isLoggedIn: false, message: "incorrect email" });
        }
        //if found
        //check the passwrd
        const passwordMatched = await bcrypt.compare(userLogin.password, user[0].password);

        // if it's incorrect
        if (!passwordMatched) {
            return res.status(401).json({ isLoggedIn: false, message: "incorrect password" });
        }

        //if it's correct 
        const dataTosend = {
            user_id: user[0].id,
            userName: user[0].userName,
            email: user[0].email,
            role_id: user[0].role_id
        }
        const token = jwt.sign(dataTosend, 'secretTest')
        res.cookie('access_token', token, { maxAge: 300000, httpOnly: true, sameSite: 'Lax' })
        res.status(200).json({ isLoggedIn: true, user: dataTosend });
    }
    catch (e) { res.status(500).end(); console.log(e);}
}




exports.Logout=(req,res)=>{

    //clear the cookie

try{
    req.session = null
    res.cookie('connect.sid', '', {expires: new Date(1), path: '/' });
    res.cookie('access_token', '', {expires: new Date(1), path: '/', httpOnly: false});
    res.status(200).json({loggedOut: true})
    }
    catch(e){console.log(e); res.status(500).end();}
}
const express = require('express');
const jwt = require('jsonwebtoken');


module.exports = async(req ,res ,next)=>{
    var token = req.cookies.access_token
    if (!token) {
       return  res.status(401).json({ message: "not logged_in" })
    }
   try{
    var decoded = await jwt.verify(token, 'secretTest')
    res.locals.user_id= decoded.user_id
    res.locals.role_id= decoded.role_id

    next()
   }
   catch(e){res.status(401).json({ message: "not logged_in" });
       throw(e) }
}
var express = require('express');
var router  = express.Router();
const csv = require('csv-parser')
const multer   = require('multer');
var upload = multer({ dest: './public/uploads/'});
var results = []
const { DB } = require('../Model/DB');
var db = new DB
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs')
router.get("/", (req, res) => {
   // console.log(req.body)
    res.render('dashboard/dashboard',req.user)
})

 



module.exports = router
var express = require('express');
var router  = express.Router();
var AWS = require('aws-sdk');

const multer   = require('multer');
var multerS3   = require('multer-s3-transform')
const sharp    = require('sharp');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { DB } = require('../Model/DB');

var db = new DB
// UPLOAD PARA BUCKET VOXCITY-ERP S3
var s3 = new AWS.S3({
    apiVersion:       '2006-03-01',
    region:           process.env.AWS_REGION,
    accessKeyId:      process.env.AWS_KEY ,
    secretAccessKey:  process.env.AWS_SECRET
  });

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb(new Error(message.FAIL.invalidImage), false);
    }
};


const upload = multer({
    fileFilter,
    storage: multerS3({
        s3,
        bucket: 'voxcity-chat',
        acl: 'public-read',
        shouldTransform: function (req, file, cb) {
            cb(null, true);
        },
        transforms: [
            {
                id: 'resized',
                key: function (req, file, cb) {
                    cb(null, Date.now().toString() + '-' + file.originalname);
                },
                transform: function (req, file, cb) {
                    cb(null, sharp().resize(640, 640).jpeg())
                },
            }
        ],
        contentType: multerS3.AUTO_CONTENT_TYPE
    })
});



router.get("/", (req, res) => {
    console.log(req.user,'usuario')
    res.send(req.user)    
})

router.post('/edit',upload.single('change-pic-input'),(req, res)=>{
    var obj = req.body
    console.log(req.file)
    console.log(obj)    
    db.editByID(req.user.id,obj,callback=>{
        if(req.file){
            
            var link=req.file.transforms[0].location; ;
            db.savePicById(req.user.id,link,callback=>{
                
                res.send(link)
            })
        }
        
        else{
            res.send(callback)
        }
    })
})

router.post('/changePass', async (req,res,next)=>{
    var password = req.body.nova
    console.log(password)
    await new Promise((resolve, reject) => {
        bcrypt.hash(password, saltRounds, function(err, hash) {
          if (err) reject(err)
          resolve(hash)
        });
      }).then(hash=>{
          db.changePass(req.user.id, hash, callback=>{
              res.send(callback)
          })
      }).catch((err)=>{console.log(err)})
})
module.exports = router
var express = require('express');
var router  = express.Router();

const bcrypt = require('bcrypt');
const saltRounds = 10;

var ForgotPassword = require('../Model/ForgotPassword.js')
const { DB }       = require('../Model/DB.js')

var db = new DB()

router.get('/change/:token', (req,res) => {
    var token     = req.params.token
    res.render('forgot/pwdrecovery',{token})
})

router.post('/change', (req,res) => {
    var token     = req.body.token
    
    var password  = req.body.password

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(password, salt, function(err, hash) {
            db.changePassword(token,hash,callback => {
                res.json({msg:callback})
            })
        });
    });

 
})

router.post("/",  (req,res) => {
    
    var email = req.body.data // Colocar e-mail que recebe do cookie
    email =JSON.stringify(email)
    console.log(email)
    //var Forgot = new ForgotPassword(email)



    db.emailIsValid(email,callbackHash => {
        console.log(callbackHash)
        if(callbackHash == true){
            new ForgotPassword(email)
                .createHash(call=>{    // Cria link Hash
                    db.linkRememberPassword(call,email,callback => { // Atualiza link na tabela users_db
                        hash = callback
                        new ForgotPassword(email,hash).sendEmail(call=> {
                            res.json({msg:call})
                        })    
                    })
                })
                
        }else{
            res.json({msg:'Usuário não encontrado. '+callbackHash})
        }
    })
})
 
module.exports = router
 
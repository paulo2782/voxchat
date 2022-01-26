const bcrypt = require('bcrypt');
const saltRounds = 10;

const LocalStrategy = require('passport-local').Strategy;
const { DB } = require('./Model/DB.js');
var db = new DB
module.exports = function(passport) {
    passport.serializeUser((user, done) => {
        const usuarioSessao = {
            name: user.name,
            email: user.email,
            organization_id: user.organization_id,
            id: user.id,
            master: user.master,
            picture: user.picture
        }
        done(null, usuarioSessao);
    })

    passport.deserializeUser((usuarioSessao, done) => {
        try {

            console.log(usuarioSessao, 'DESERIALIZE')
            done(null, usuarioSessao)

        } catch (err) {
            console.log('DESERIALIZE:' + err)
            return done(err, null)
        }
    })
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, (email, password, done) => {
        db.auth(email, rows => {
            //console.log(rows)
            if (rows.length > 0) {
              //  console.log(rows[0].password)
                hash = rows[0].password
                bcrypt.compare(password, hash, function(err, result) {
                    //console.log('result:' + result)
                    if (result == true) {
                        var user = {}
                        if(rows[0].active == 1){
                            user.id = rows[0].id
                            user.name = rows[0].name
                            user.email = rows[0].email
                            user.organization_id = rows[0].organization_id
                            user.master = rows[0].master
                            user.picture = rows[0].file_picture
                            user.allow = rows[0].allow

                            return done(null, user)
                          }
                        else{
                            return done(null, false, {msg:'Usuário Desativado'})
                        }
                    }else {
                        return done(null, false, {msg:'Senha inválida.'})
                    }
                });
               
            } else {
                return done(null, false,  {msg:'Usuário não cadastrado.'})
            }
        })
    }))
}
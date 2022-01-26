var express = require('express');
var router = express.Router();

const passport = require('passport')

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(function(err) {
        if (!err) {
            res.status(200).clearCookie('connect.sid', { path: '/' }).redirect('/');
        } else {
            // handle error case...
            console.log(err)
        }
    })
})
router.post('/', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if(info){
            return res.send(info)
           }
        else if(user){
            req.logIn(user, function(err) {
            if (err) { return next(err);}
            if(user.master == null){user.master = 0}
            return res.send(user.master.toString())
            });
        }
    })(req, res, next);
});


module.exports = router;


 
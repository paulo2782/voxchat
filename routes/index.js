var express = require('express');
const router = express();
router.all('*',function(req,res,next){
    if(req.headers['x-forwarded-proto']!='https' &&  process.env.NODE_ENV !== "development") {
      res.redirect(`https://${req.get('host')}`+req.url);
    } else {
      next(); /* Continue to other routes if we're not redirecting */
    }
  });

router.get('/', function(req, res) {
    res.render('login/login')
})

module.exports = router
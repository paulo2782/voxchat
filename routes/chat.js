var express = require('express');
var router = express.Router();

router.get("/", (req, res, next) => {
    user = req.user //DECLARANDO USER GLOBAL PARA OS SOCKETS  // NÃO REMOVER

    res.render('chat/chat', req.user)
});
router.post("/", (req, res, next) => {
    res.render('chat/chat', req.user)

});


router.get("/changePass", (req, res, next) => {
    res.render('chat/changeP', req.user)
});
module.exports = router
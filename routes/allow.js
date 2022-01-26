var express = require('express');
var router = express.Router();
var { DB } = require("../Model/DB")
var db = new DB()




router.get("/", (req, res, next) => {
    res.render("groups/groups", req.user)
})


router.get('/listUsers/:id', (req, res, next) => {
    var id = req.params.id
    db.showUserByDeps(id, users => {
        res.json(users)
    })
})

router.post('/', (req, res, next) => {
    var allows = req.body.myAllows
    var groups = req.body.groupsAllow
    console.log(req.body)
    var userToChange = req.body.user
    db.saveAllows(userToChange, allows,groups, callback => {
        res.send('ok')
    })
})

module.exports = router;
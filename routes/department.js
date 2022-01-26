const bcrypt = require('bcrypt');
const saltRounds = 10;
var express = require('express');
const { DB } = require('../Model/DB');
var router = express.Router();

var db = new DB()
var editUserId;
var editUser;



router.get("/", (req, res, next) => {
    res.render('department/department', req.user)
})

router.post("/", (req, res, next) => {
    var obj = {}
    obj.name = req.body.data
    obj.organization_id = req.user.organization_id
    db.newDepartment(obj, msg => {
        console.log(msg ,'AQUIII')
        res.send(msg)
    })
})

router.get('/depList', function(req, res, next) {
    var id = req.user.organization_id
    db.allDepsFromID(id, infos => {
       

        if (infos == "errors") return res.send('error')
        console.log(infos, 'infosDepList')
        let table = JSON.parse(infos)
        console.log(table)
        res.json({ table })
    })
})

router.get("/list", (req, res) => {
    db.listUserByOrg(req.user.organization_id, listOrg => {
        console.log(listOrg, 'hre')
        table = JSON.parse(listOrg)
        console.log(table)
        res.send({ table })

    })
})

////updateAllUsers


router.post('/updateAllUsers', function(req, res) {
    var obj = req.body
    console.log(obj)

    var actArr = Object.keys(obj.act)
    var depsArr = Object.keys(obj.deps)
    var depF = false;
    var actF = false;

    var notSend = true
    depsArr.forEach((k, v) => {
        // console.log()
        var userId = k
        var newDep = obj.deps[k]
        db.addDepInUser(userId, newDep, msg => {
            if (depsArr.length == v) {
                depF = true;
            }
            if (depF == true || actF == true || notSend == true) {
                notSend = false
                return res.send(msg.department)
            }
        })
    })
    actArr.forEach((k, v) => {
        var userIdDep = k
        var activity = obj.act[k]
        db.changeActivityUser(userIdDep, activity, (msg) => {
            if (actArr.length == v) {
                actF = true;
            }
            if (depF == true || actF == true || notSend == true) {
                notSend = false
                return res.send(msg)
            }
        })
    })
})


/////////////////
router.get("/editUser/:id", (req, res, next) => {
    editUserId = req.params.id
    db.findOneToEdit(editUserId, user => {
        editUser = user;
        res.send('ok')
    })


})

router.get("/editUserById", (req, res, next) => {
    console.log(editUser, 'edits')
    res.render('users/users', editUser)
})
////////////////////

router.post("/users/edit/", (req, res, next) => {
    var obj = req.body

    db.editByEmail(obj.email, obj, msg => {

        res.send(msg)
    })
})

router.post("/editDep",(req,res,next)=>{
    var obj = req.body
    db.editDepById(obj.id, obj.dep, callback=>{
        res.send('ok')
    })
})

module.exports = router
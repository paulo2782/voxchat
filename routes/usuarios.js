var express = require('express');
var router  = express.Router();
path = require('path')

const csv = require('csv-parser')
const multer   = require('multer');
var upload = multer({ dest: './public/uploads/'});
var results = []
const { DB } = require('../Model/DB');
var db = new DB
const bcrypt = require('bcrypt');
const saltRounds = 10;
const fs = require('fs')

const { convertArrayToCSV } = require('convert-array-to-csv');
const converter = require('convert-array-to-csv');

var maxUsers;
var howManyUsers ;
const depsName = []
const depsIdByName =[]





router.get('/', function(req, res) {
    const org =req.user.organization_id
    db.getUserPlan(org, limit=>{
        maxUsers = limit;
    })
    db.howMany(org, users=>{
        howManyUsers = users
    })

    db.allDepsFromID(org,deps=>{
        console.log(deps)
        deps = JSON.parse(deps)
        deps.forEach(dep=>{
             depsName.push(dep.name)
        })
        deps.forEach(dep=>{
            var id = dep.id
            var name = dep.name
          
            depsIdByName.push({name,id})
        })
        res.render('usuarios/usuarios')
    })
    
    return depsName && depsIdByName && maxUsers
})


router.get('/limitUpload', (req,res)=>{
    db.getLimitUpload(req.user.organization_id, limit=>{
        console.log(limit)
        res.send({limit})
    })
})

router.get('/exportCsvUser', function(req,res){
    var id = req.user.organization_id
    
    db.listUserByOrg2(id, data => {
        listData = JSON.parse(data)

        const header = ['name', 'email', 'department_name', 'phone', 'extension'];

        const dataObjects = listData

        const csvFromArrayOfObjects = convertArrayToCSV(dataObjects);

          fs.writeFile(path.join(__dirname, '..', '/public/templates/csvUsers.csv'), csvFromArrayOfObjects, function (err) {
            if (err) throw err;
            res.send({msg:'Arquivo criado!'})
          });

    })
    
})
router.post('/updateOrgUsers',upload.single('update-table-input'), function(req,res,next){
    var results = []
    var dadosDep ={}
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data)=> results.push(data))
    .on('end',async ()=>{
        for (var index = 0; index <= results.length-1; index++) {
            console.log(results[index])
            var user = results[index]
            user.organization_id = req.user.organization_id
            dadosDep.name = user.department_name
            dadosDep.organization_id = req.user.organization_id
            if(depsName.includes(dadosDep.name)){
                
                await new Promise((resolve,reject)=>{
                    depsIdByName.forEach(dep=>{
                        if(user.department_name === dep.name){
                            user.department_id = dep.id
                            db.atualizaUser(user.email,user,retorno=>{
                                resolve()
                            })
                        }else return 
                    })
                })
            }else{
                await new Promise((resolve,reject)=>{
                    db.newDepartment( dadosDep, (msg)=>{
                        var name = dadosDep.name
                        var id = msg.id
                        depsIdByName.push({name, id})
                        depsName.push(name)
                        user.department_id = msg.id
                        db.atualizaUser(user.email,user,retorno=>{
                            resolve()
                        
                        })
                    })              
                })    
            }
        }
    })
})

router.post('/newOrgUsers', upload.single('insert-csv-table'), function(req,res,next){
    var dadosDep ={}
    var result = []
    fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
        for (var index = 0; index <= results.length-1; index++) {
            var user =results[index]
            user.organization_id = req.user.organization_id
            dadosDep.name = user.department_name
            dadosDep.organization_id = req.user.organization_id
             await new Promise((resolve, reject) => {
                bcrypt.hash(user.password, saltRounds, function(err, hash) {
                  if (err) reject(err)
                  resolve(hash)
                });
              })
              .then(async hash=>{
                  user.password = hash
                    console.log(depsIdByName,depsName,'TESTE')
                    if(depsName.includes(dadosDep.name)){
                        await new Promise((resolve,reject)=>{
                            depsIdByName.forEach(dep=>{
                                if(user.department_name === dep.name){
                                    user.department_id = dep.id
                                    console.log(user.department_id,"aqui")
                                    if(maxUsers >= howManyUsers){
                                        res.send('LIMITE DE USUÁRIOS ATINGIDO')
                                    }else{
                                        db.newUser(user, msg => {
                                            console.log('usuario',user)
                                            db.allowAll(user.organization_id )
                                            resolve()
                                        })
                                    }
                                }
                                else{
                                    return
                                }
                            })
                        })                        
                    }
                    else{
                        await new Promise((resolve,reject)=>{
                            db.newDepartment( dadosDep, (msg)=>{
                                var name = dadosDep.name
                                var id = msg.id
                                console.log(id,'AQUEE')
                                depsIdByName.push({name, id})
                                depsName.push(name)
                              
                                user.department_id = msg.id
                                console.log(msg,"aqui NEW")
                                if(maxUsers >= howManyUsers){
                                    res.send('LIMITE DE USUÁRIOS ATINGIDO')
                                }else{
                                    db.newUser(user, msg => {
                                        console.log('usuario',user)
                                        db.allowAll(user.organization_id )
                                        resolve()          
                                    })
                                }
                            })              
                        })    
                    }
                })
                .catch(err=>console.log(err))
        }
    })
})




router.post('/newUsers', function(req, res) {
    

    var user = req.body
    user.organization_id = req.user.organization_id
    bcrypt.hash(user.password, saltRounds, function(err, hash) {
        user.password = hash
        if(maxUsers >= howManyUsers){
            res.send('LIMITE DE USUÁRIOS ATINGIDO')
        }else{
            db.newUser(user, msg => {
                console.log(msg)
                db.allowFirst(user.organization_id )
                res.send(JSON.stringify(msg))
            })
        }
    });
})

module.exports = router
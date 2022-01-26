
var mysql   = require('mysql');

var con =  mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    charset: 'utf8mb4',
    port:  process.env.DB_PORT
});

  
var express = require('express');
var router  = express.Router();


const multer   = require('multer');
const multerS3 = require('multer-s3');
var AWS = require('aws-sdk');



 const bcrypt = require('bcrypt');
 const saltRounds = 10;

// USUÁRIOS
router.get("/users", (req, res) => {
    SQL = 'SELECT * FROM users order by nome'
    con.query(SQL,(err,rows) => {
        if(err) throw err
        res.json({rows:rows,nome_usuario:rows[0].nome})    
    })
})
// DEPARTAMENTOS
router.get("/department", (req, res) => {
        //console.log(req.user)
    SQL = 'SELECT * FROM department_db WHERE organization_id = '+req.user.organization_id+' order by name '
    con.query(SQL,(err,rows) => {
        if(err) throw err
        
            res.json({rows:rows})    
        
    })
})
router.delete("/deleteDepartamento/:id", (req, res) => {
    id = req.params.id 

    SQL = 'DELETE FROM department where id = '+id+' '
    con.query(SQL,(err,rows) => {

    if(err) throw err
        res.json({msg:'Registro apagado'})    
    })
})

// SALVA USUÁRIOS
/////////////////////////////////////////////////////////
// UPLOAD DE ARQUIVOS PARA AMAZON
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, __dirname + '/public/uploads/')
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })

var s3 = new AWS.S3({
    apiVersion:       '2006-03-01',
    region:           process.env.AWS_REGION,
    accessKeyId:      process.env.AWS_KEY ,
    secretAccessKey:  process.env.AWS_SECRET
});

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'voxcity',
        acl: 'public-read',
        metadata: function(req, file, cb) {
             cb(null, { fieldName: file.fieldname })
        },
        key: function(req,file,cb) {
            cb(null,Date.now().toString() + ' - ' + file.originalname)
        }
    })
})

router.post("/salva_usuario", upload.single('arquivo_foto'), (req, res) => {
    if(req.file == null){
        arquivo_foto = ''
    }else{
        
        arquivo_foto = Date.now().toString() + ' - ' + req.file.originalname
    }   

    nome         = req.body.nome
    email        = req.body.email
    senha        = req.body.senha
    telefone     = req.body.telefone
    ramal        = req.body.ramal

    bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(senha, salt, function(err, hash) {
            SQL = 'INSERT INTO users (arquivo_foto, nome, email, departamento_id, senha, telefone, ramal) VALUES ("'+arquivo_foto+'","'+nome+'","'+email+'",0,"'+hash+'","'+telefone+'","'+ramal+'")'
            con.query(SQL,(err,rows) => {
                if(err){
                    if(err.errno=1062) {
                        res.json([{mensagem:'Email duplicado'}])
                    }else{
                        res.json([{mensagem:err}])                
                    }
                }else{
                    res.json([{mensagem:'Registro Salvo!'}])
                }
                
            })                    
        });
    });
})

// SALVA DEPARTAMENTOS
router.post("/salva_departamento", (req,res) => {
    nome     = req.body.nome
    organizacao_id = req.body.organizacao_id

     SQL = 'INSERT INTO department (nome,organizacao_id) values("'+nome+'","'+organizacao_id+'")'
    con.query(SQL,(err, rows) => {
        if(err){
            if(err.errno=1062){
                res.json([{mensagem:'Nome duplicado'}])
            }else{
                res.json([{mensagem:err}])
            }
        }else{
            res.json([{mensagem:'Registro Salvo!'}])
        }
    })    
})

module.exports = router;


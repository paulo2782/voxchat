var mysql     = require('mysql');

require('dotenv').config({ path: __dirname + '/.env' });

var con =  mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DB,
  charset: 'utf8mb4',
  port:  process.env.DB_PORT
});

const express = require("express");
 
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const app = express();
const path = require('path');

var AWS = require('aws-sdk');
var fs = require('fs')


const passport = require('passport')
const session  = require('express-session')
require('./auth')(passport)

var sessionStore = new session.MemoryStore()

//////////////////////////////////////////////////

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api')
var chatRouter = require('./routes/chat')
var dashboardRouter = require('./routes/dashboard')
var departamentRouter = require('./routes/department')
var forgotRouter      = require('./routes/forgot')
var usersRouter = require('./routes/users')
var loginRouter = require('./routes/login')
var allowRouter = require('./routes/allow')
var usuariosRouter = require('./routes/usuarios')
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {maxAge:8*60*60*1000}, //8horas de duração
  store: sessionStore
  //store: new DynamoDBStore()
}))

const http = require('http').Server(app)
var io               = require("socket.io")(http)
var passportSocketIo = require("passport.socketio")

io.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same middleware you registrer in express
  key:          'connect.sid',       // the name of the cookie where express/connect stores its session_id
  secret:       process.env.SECRET,    // the session_secret to parse the cookie
  store:        sessionStore,        // we NEED to use a sessionstore. no memorystore please
 // success:      onAuthorizeSuccess,  // *optional* callback on success - read more below
 // fail:         onAuthorizeFail,     // *optional* callback on fail/error - read more below
}));

app.use(passport.initialize());
app.use(passport.session());




app.use(function(req, res, next) {
  req.passport = passport;
  next();
})




function authMidWare(req,res,next){
  if(req.isAuthenticated()) return next();
  res.redirect('/')
}
function masterMidWare(req,res,next){
 
  if(req.isAuthenticated()) if(req.user.master) return next();
  res.redirect('/chat')
}

app.use('/', indexRouter);
app.use('/login', loginRouter)
app.use('/forgot', forgotRouter)
app.use('/api', masterMidWare, apiRouter);
app.use('/chat',authMidWare, chatRouter);
app.use('/usuarios', masterMidWare, usuariosRouter);

app.use('/allow', masterMidWare, allowRouter)
app.use('/dashboard',masterMidWare, dashboardRouter);
app.use('/department',masterMidWare, departamentRouter);
app.use('/users',authMidWare, usersRouter);



const bodyParser = require('body-parser')
const expressHandlebars = require('express-handlebars')


//configura o view engine Handlebars
app.engine('handlebars', expressHandlebars({
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir  : [
        //  path to your partials
        path.join(__dirname, 'views/partials'),
    ]    
}))
app.set('view engine', 'handlebars')

var ss = require("socket.io-stream");

 
const { callback } = require("util");
const { IOStream } = require("socket.io-stream");
const auth = require('./auth');



// Inicializando Servidor

const porta = process.env.PORT || 8000

const host = process.env.HEROKU_APP_NAME ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com` : "http://localhost"


http.listen(porta, function(){
  
  const portaStr = porta === 80 ? '' :  ':' + porta
    if (process.env.HEROKU_APP_NAME) 
        console.log('Servidor iniciado. Abra o navegador em ' + host)
    else console.log('Servidor iniciado. Abra o navegador em ' + host + portaStr)
})

usuarios = []
io.on("connection", (socket) => {

  console.log(socket.request.user, 'passport no socoket')
  connected = io.engine.clientsCount;  
  io.emit('usuarios online', connected)

  //Atualiza SOCKET ID do contato - Entra na sala
  socket.on("usuario entra no chat",(contato_id,callback) => {
    status = 'online'

    connected = io.engine.clientsCount;  
    io.emit('usuarios online', connected)
  
    usuarios[socket.id] = socket.id 
    
    SQL = 'UPDATE users_db SET socket_id = "'+socket.id+'", status = "'+status+'" WHERE id = "'+contato_id+'"'
    con.query(SQL, (err) => {
      callback({
        status: 'Usuario entrou na sala ', 
        socket_id: socket.id,
        contato_id:contato_id
      }) 

      SQL = 'SELECT users_db.id, users_db.allow from users_db where id = "'+contato_id+'"'
      con.query(SQL, (err,rows) => {
        allow = rows[0].allow;

        if(err) throw err
        SQL = 'SELECT users_db.id, users_db.allow, users_db.allow_dep, users_db.organization_id, users_db.status,users_db.name,'
          +' users_db.email, users_db.department_id, max(message_db.created),'
          +' message_db.receiver, max(message_db.id) as msg_id, count(message_db.emitter)'+
          'as iMensagemRecebida, users_db.file_picture as file_picture from users_db LEFT JOIN message_db '+
          'ON users_db.id = message_db.emitter and message_db.receiver = "'+contato_id+'" and verify = 0 '+
          'WHERE users_db.id IN ('+allow+') and users_db.organization_id = '+user.organization_id+
          ' group by email order by msg_id DESC'

      
        con.query(SQL, (err,rows) => {
          if(err) throw err
          io.to(socket.id).emit('lista usuarios',{usuarios:rows})
        })
      })
    }) 
    /// CARREGA OS GRUPOS
    socket.on("carrega departamentos",(contato_id,callback) => {
      SQL = 'SELECT users_db.id,users_db.allow_dep from users_db where id = "'+contato_id.contato_id+'" '
      con.query(SQL, (err,rows) => {

        allow_dep = rows[0].allow_dep

        a = allow_dep.split(',')
        
        for(i = 0 ; i <= a.length-1 ; i++){
           room = "D_"+a[i].toString()
           socket.join(room);
           socket.join(a[i]);
         }

        SQL = 'SELECT department_db.* from department_db where id IN ('+allow_dep+') '
        con.query(SQL, (err,rows) => {
          
          callback({
            data:rows
          })
        })
      })   
    })


  })
  
//Usuario sai da sala


socket.on("disconnect", (contato_id) => {

  connected = io.engine.clientsCount;  

  io.emit('usuarios online', connected)

  SQL = 'SELECT * from users_db where socket_id = "'+socket.id+'"'
  console.log(con)

  con.query(SQL, (err,rows) => {
   if(err) throw err

    if(rows.length > 0){
      contato_id = rows[0].id
      
      io.emit('saiu',{contato_id:contato_id})
    }
  })

  status = 'offline'


  SQL = 'UPDATE users_db SET socket_id = "", status = "'+status+'"  WHERE socket_id = "'+socket.id+'"'
  
  con.query(SQL, () => {}) 

  // MOSTRA USUARIOS ONLINE NO DASHBOARD
  SQL = "SELECT * from users_db where status = 'online'"
  con.query(SQL, (err,rows) => {
  if(err) throw err
    socket.emit('usuarios online dashboard',{usuarios:rows})  
  }) 
  
})


//BIO DO CONTATO
socket.on("bio do usuario",(contato_id,callback) => {
  SQL = 'SELECT * from users_db where id = "'+contato_id+'"'
  con.query(SQL, (err,rows) => {
    if(err) throw err
    callback({
      resposta:rows
    })
  })

})

//ENVIAR MENSAGEM PRIVADO
  socket.on('verifica socket id',(msg,callback) => {

    SQL = 'SELECT * FROM users_db where id = "'+msg.destinatario_id+'" '
    con.query(SQL, (err,rows) => {
    if(err) throw err
      checkAllow = rows[0].allow.split(',')

      checkAllowAux = []
      for(i = 0 ; i <= checkAllow.length-1 ; i++){
        checkAllowAux.push(checkAllow[i])
      }

      check = checkAllowAux.indexOf(msg.remetente)


      if(check > -1) {
        
        callback({
          socket_id:rows[0].socket_id,
          allow:msg.remetente,
          msgAllow:true
        })
      }else{
        callback({
          msgAllow:false,
          txtMsg:'Você não tem autorização para enviar mensagem a este usuário. Favor Verificar com o administrador do Sistema.'
        })
      }

    })
  })


  socket.on('enviar mensagem grupo',(msg,callback) => {
    
    
    nameRoom = "D_"+msg.room

    SQL = 'INSERT INTO message_db (message,emitter,group_receiver,verify,file) values("'+msg.mensagem+'","'+msg.remetente_id+'","'+msg.room+'",0,"'+msg.arquivo+'")'
    con.query(SQL, (err,rows) => {

      if(err) throw err
      callback({
        status:'Mensagem Salva'
      })

      socket.to(nameRoom).emit("atualiza mensagem grupo",{msg:msg,nome_remetente:msg.nome});
      console.log(nameRoom)
      callback({
        data:msg
      })
    })
  })

  socket.on("enviar mensagem privada",(msg,callback) => {

 
    SQL = 'INSERT INTO message_db (message,emitter,receiver,verify,file) values("'+msg.mensagem+'","'+msg.remetente_id+'","'+msg.destinatario_id+'",0,"'+msg.arquivo+'")'
    con.query(SQL, (err,rows) => {

      if(err) throw err
      callback({
        status:'Mensagem Salva'
      })

      SQL = 'SELECT * FROM users_db where id = "'+msg.destinatario_id+'" '

      con.query(SQL, (err,rows) => {

        io.to(rows[0].socket_id).emit("atualiza mensagem",{remetente:msg.destinatario_id,destino:msg.remetente_id,mensagem:msg.mensagem,email:msg.email,arquivo:msg.arquivo,socket_id:msg.socket_id});
      
        SQL = 'SELECT id,count(id) as iMsgNaoLida, emitter as remetente_id, receiver FROM message_db where emitter = "'+msg.remetente_id+'" and receiver = "'+msg.destinatario_id+'" and verify = 0 '
       
        con.query(SQL, (err,rows) => {
        if(err) throw err

        callback({
          status:msg.socket_id
        })

        iMsgNaoLida = rows[0].iMsgNaoLida
        remetente_id  = rows[0].remetente_id
        
       

          io.to(msg.socket_id).emit("conta mensagem nao lida",{iMsgNaoLida:iMsgNaoLida,remetente_id:remetente_id});
          
          SQL = 'SELECT users_db.id, users_db.allow from users_db where id = "'+msg.destinatario_id+'"'
          con.query(SQL, (err,rows) => {
            allow = rows[0].allow;

            SQL = 'SELECT users_db.id, users_db.organization_id, users_db.status,users_db.name, '+
            'users_db.file_picture, users_db.email, max(message_db.created), message_db.receiver, '+
            'max(message_db.id) as msg_id, count(message_db.emitter)'+
            'as iMensagemRecebida from users_db LEFT JOIN message_db '+
            'ON users_db.id = message_db.emitter and message_db.receiver = "'+msg.destinatario_id+'" and verify = 0 '+
            'WHERE users_db.id IN ('+allow+') and organization_id = '+user.organization_id+
            ' group by email order by msg_id DESC'
            con.query(SQL, (err,rows) => {
              if(err) throw err
              io.to(msg.socket_id).emit('lista usuarios',{usuarios:rows})
            })
          })
        })
      })
    })
  })

//DADOS DOS DEPARTAMENTO
socket.on("dados do departamento",(dados) => {
  id = dados.id
  SQL = 'SELECT * from department_db where id = "'+id+'" '
  con.query(SQL, (err,rows) => {
    if(err) throw err
    socket.emit("departamento selecionado",{dados:rows})
  })
})  

//USUARIO DIGITANDO
socket.on('digitando',(dados) => {
  console.log(dados)
  opcao = dados.opcao
  switch(opcao){
    case '0':
      io.to(dados.socket_id).emit('mostra usuario digitando',{msg:' Está digitando...',id:dados.id,opcao:dados.opcao})
    break;      
    case '1':
      nameRoom = 'D_'+dados.nameRoom
      socket.to(nameRoom).emit("mostra usuario digitando",{msg:'Alguém está digitando',nameRoom:dados.nameRoom,opcao:dados.opcao});
    break;
  }
    
  

})

//DADOS DOS CONTATO
  socket.on("dados do contato",(dados) => {
    id = dados.id
//    SQL = 'SELECT * from users_db where id = "'+id+'" '
  SQL = 'SELECT department_db.name as department_name, department_db.id, users_db.* FROM users_db '
  +'INNER JOIN department_db ON users_db.department_id = department_db.id WHERE users_db.id = "'+id+'"'
  con.query(SQL, (err,rows) => {
      if(err) throw err
      socket.emit("contato selecionado",{dados:rows})
    })
  })  

//CONFIRMA LEITURA DA MENSAGEM
  socket.on("confirma leitura mensagem",(contato_id,callback) => {
    SQL = 'UPDATE message_db SET verify = 1 WHERE emitter = "'+contato_id.destinatario+'" '
    con.query(SQL, (err) => {
      if(err) throw err
      callback({
        status:"Leitura confirmada "+contato_id.destinatario
      })
  
    })
  })

//HISTORICO DE MENSAGEM
  socket.on("historico de mensagem",(msg,callback) => {

    console.log(msg)
    switch(msg.opcao){
      case '0':
        remetente = msg.remetente
        destinatario = msg.destinatario
        SQL = 'SELECT users_db.name,users_db.email,'+
        'message_db.id, '+
        'message_db.message,message_db.emitter,'+
        'message_db.receiver,message_db.emitter,'+
        'message_db.file,'+
        'message_db.created '+
        'FROM message_db INNER JOIN users_db ON message_db.emitter = users_db.id where emitter = "'+remetente+'" and '+
        'receiver = "'+destinatario+'" or '+
        'emitter = "'+destinatario+'" and '+
        'receiver = "'+remetente+'" order by message_db.id asc limit 1000'


        con.query(SQL, (err,rows) => {
          if(err) throw err
          callback({
            resposta:rows
          })
          
        })
      break;
      case '1':
        remetente     = msg.remetente
        group_receiver= msg.destinatario
        console.log("ID DO GRUPO: "+group_receiver)
        SQL = 'SELECT users_db.name,users_db.email,'+
        'message_db.id, '+
        'message_db.message,message_db.emitter,'+
        'message_db.group_receiver,message_db.emitter,'+
        'message_db.file,'+
        'message_db.created '+
        'FROM message_db INNER JOIN users_db ON message_db.emitter = users_db.id where group_receiver = "'+group_receiver+'" '+
        "order by message_db.id asc limit 1000"

        con.query(SQL, (err,rows) => {
          if(err) throw err
            console.log(rows)
          callback({
            resposta:rows
          })
          
        })
      break;      

    }
  })



//Muda STATUS
socket.on('muda status',(usuario,callback) => {
  SQL = 'UPDATE users_db SET status = "'+usuario.status+'" WHERE id = "'+usuario.contato_id+'"'
  con.query(SQL, () => {}) 
  callback({
    status:'Status alterado',
  })
 

  io.emit('novo status', {status:usuario.status,usuario_id:usuario.contato_id})  
})


var albumBucketName = ""; 
var bucketRegion = "";
var IdentityPoolId = ""; 
var mimetype = 'image/jpeg';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName }
});


ss(socket).on('file', function(stream, data) {
  
  console.log(data, data.name)
  id          = data.id
  data_upload = data.data_upload
  hora_upload = data.hora_upload
  name        = data.name

  var extension = path.extname(name) 
  

  switch(extension.toUpperCase()){
    case '.JPG':
      myContentType = 'image/jpeg'
    break;
    case '.JPEG':
      myContentType = 'image/jpeg'
    break;
    case '.PNG':
      myContentType = 'image/png'
    break;
    case '.GIF':
      myContentType = 'image/gif'
    break;
    case '.BMP':
      myContentType = 'image/bmp'
    break;
    case '.TIFF':
      myContentType = 'image/tiff'
    break;
    default:
      myContentType = 'application/octet-stream'
    break;
  }
  
  stream.pipe(fs.createWriteStream('public/uploads/'+id+'-'+data_upload+'-'+hora_upload+'-'+name));
  
  stream.on('finish', function() {
  // UPLOAD S3
    var Uploader = require('s3-streaming-upload').Uploader,
      upload = null,
      arquivo = fs.readFileSync(__dirname + '/public/uploads/'+id+'-'+data_upload+'-'+hora_upload+'-'+name);

    upload = new Uploader({
      // CREDENCIAIS ACESSO AWS
      accessKey: process.env.AWS_KEY,
      secretKey: process.env.AWS_SECRET,
      bucket: process.env.SBUCK,
      objectName: id+'-'+data_upload+'-'+hora_upload+'-'+name,
      stream: arquivo,
       objectParams: {
        ACL: 'public-read',
        ContentType: myContentType
      }
    });

    upload.send(function(err) {
      if (err) {
        console.error('Upload error' + err);
      }
    });
  })
});
 
}); 

app.use("/blueimp-md5", express.static(path.join(__dirname, "node_modules/blueimp-md5/js")));
app.use("/socket", express.static(path.join(__dirname, "node_modules/socket.io")));
app.use("/socket-stream", express.static(path.join(__dirname, "node_modules/socket.io-stream")))
app.use("/moment", express.static(path.join(__dirname, "node_modules/moment")));


app.use("/websocket", express.static(path.join(__dirname, "public/websocket")));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use("/templates", express.static(path.join(__dirname, "public/templates")));
app.use("/conf", express.static(path.join(__dirname, "public/conf")));
var md5 = require("nodejs-md5");
const nodemailer = require("nodemailer");

class ForgotPassword {
    constructor(email,hash){
        this.email = email
        this.hash  = hash
        //console.log(hash)
    }
    createHash(callback){
        md5.string(this.email + Math.random() * 99999, function (err, md5) {
            if(err){
                callback(err)
            }else{
                var hash = md5.split(" ")
                callback(hash[3])
                
            }
        })
    }    
    sendEmail(callback){
        var email = this.email
        async function main() {
        let transporter = nodemailer.createTransport({
        // host: "smtp.uhserver.com",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'voxcitydev@gmail.com', // generated ethereal user
            pass: '@V0xc1t12o2o', // generated ethereal password
        }
    });
   // console.log(this.email,'metodoSend')
        // send mail with defined transport object
        var message =  `
        Olá,
        
        
        Você está recebendo este e-mail porque recebmos uma solicitação de redefinição de senha para sua conta.
        
        Clique no Link abaixo para redefinir sua senha
        
        
        Link:
        
        Esse link é valido somente por 30 minutos.
        
        
        
        Se você não solicitou uma redefinição de senha, apenas ignore esse e-mail.`

        console.log(typeof message, 'tipo')



        let info = await transporter.sendMail({
            from: '"VoxDev"<voxcitydev@gmail.com>', // sender address
            to: email, //(INCLUIR E-MAIL DE QUEM VAI RECEBER O E-MAIL) list of receivers
            subject: "Esqueceu a senha?", // Subject line
            text:"Olá", // plain text body
            html:"Olá,"
            
            
            +"Você está recebendo este e-mail porque recebmos uma solicitação de redefinição de senha para sua conta."
            
            +"Esse link é valido somente por 30 minutos.<br>"
            
            +"<a href='https://voxcity-chat-app.herokuapp.com/forgot/change/"+hash+"'>Clique aqui<a ><br><br><br>"
            
            +"Se você não solicitou uma redefinição de senha, nenhuma ação adicional será necessária.", // html body
        });
    
        console.log("Mensagem enviada: %s", info.messageId);
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
        main().catch(console.error);
        callback('Email enviado')
    }
          
}


module.exports = ForgotPassword


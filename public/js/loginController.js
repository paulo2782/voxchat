class loginController {
    constructor() {
        this.initEvents()
        //this.init()
        this.modalIsOpened = false
    }
    initEvents(){
        var loginBtn=document.querySelector("#enter")
        var modal = document.querySelector("#exampleModal")
        var openLogin = document.querySelector("#open-modal")
        loginBtn.addEventListener("click",e=>{
            this.auth()
        })

        openLogin.addEventListener("click",(e)=>{
            this.modalIsOpened = true
        })


        window.addEventListener("keypress",(e)=>{
            if(modal.classList.contains("show")){
                if(e.which == 13 && this.modalIsOpened){
                this.auth()
                }
            }
            else{
                return false
            }
            
        })
    }
    auth(){
        
        var email =document.querySelector("#email-login").value
        var passw = document.querySelector("#password-login").value
        axios.post("/login",{email,password:passw}).then(data=>{
            console.log(data)
            if (data.data ==1) {
                window.location.href = '/dashboard'
            }
            else if (data.data == 0 ) {
                window.location.href = '/chat'
            }else{
                bootbox.alert({ title:"Aviso" ,closeButton: false,message:data.data.msg})
               
            
            }

        }).catch(err=>{console.log(err, err.response)})
    }

}






/*
  console.log('init')
        var myHeaders = new Headers({ 'Content-Type': 'application/json' })
        var config = {
            headers: myHeaders,
            mode: 'cors',
            cache: 'default',
          
        };
        config.body= $('#login')
        config.method = 'post'
        $('#enter').click(function(){
            fetch('/login', config).then(resp => {
            return resp.blob()
        })
            .then(async resp => {
            var msg = await resp.text()
            console.log(msg)
            return
            })
        })


*/
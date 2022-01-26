var locale = window.location.href
if(locale.includes('localhost')){
    server = 'http://localhost:8000'
    websocket = 'ws://localhost:8000'
    
}else{
 
server = 'https://voxcity-chat-app.herokuapp.com/'
websocket = 'wss://voxcity-chat-app.herokuapp.com'
   
}



const socket = io(websocket); 

const record = document.querySelector('.record');
const stop   = document.querySelector('.stop');
const cancel = document.querySelector('.cancel');


if (navigator.mediaDevices.getUserMedia) {
	
  const constraints = { audio: true };
  let chunks = [];

  let onSuccess = function(stream) {
    const mediaRecorder = new MediaRecorder(stream);

    record.onclick = function() {
	  	record_status = 'recorder'
    	
    	$('#contacts').hide()

      mediaRecorder.start();
      $('#gravacao').show()
      
    }

    cancel.onclick = function() {
		record_status = 'canceled'
	    mediaRecorder.stop();
    	$('#gravacao').hide()
      
    }

    stop.onclick = function() {
      
      mediaRecorder.stop();
      $('#gravacao').hide()

    }

    mediaRecorder.onstop = function(e) {
	    	

    	$('#contacts').show()

    	if(record_status != 'recorder'){ return false }

	      const blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus' });
	      chunks = [];
	      const audioURL = window.URL.createObjectURL(blob);

	      $('#audio_record').prop('src',audioURL)

	      file = blob
		
		    var stream = ss.createStream();

				id = "{{id}}"

				var nameMp3 = 'audio.mp3';
				var data_upload = moment().format('DDMMYYYY')
				var hora_upload = moment().format('HHmmss')

				if(file.size > 1000024){
					alert('ARQUIVO NÃO PODE SER MAIOR QUE 1 MB')
					return false
				}

				ss(socket).emit('file', stream, {size: file.size, name:nameMp3, id:id, data_upload:data_upload, hora_upload:hora_upload});

	    	ss.createBlobReadStream(file).pipe(stream);
	
				$('#conteudo-message').append(
					"<li class='replies'>"+
							"<audio controls src='"+audioURL+"' style='float:right'> </audio>"+
					"</li>"	
				)

			remetente_id    = contato_id
			
			destinatario_id = $('#contact-profile-destinatario_id').val()

			email           = $('#profile-email').val()
			
			arquivo = id+'-'+data_upload+'-'+hora_upload+'-'+nameMp3;
			
			message         = ''	

			socket.emit('verifica socket id', {destinatario_id:destinatario_id}, (response) => {
				// console.log(response)
				$('#contact-profile-socket_id').val(response.socket_id)
				socket_id       = $('#contact-profile-socket_id').val()
			
				socket.emit("enviar mensagem privada",{remetente_id:remetente_id,destinatario_id:destinatario_id,mensagem:message,socket_id:socket_id,email:email,arquivo:arquivo}, (response) => {
					// console.log(response)
				})		
			})


	    }

	    mediaRecorder.ondataavailable = function(e) {
	      chunks.push(e.data);
	    }
	}

  let onError = function(err) {
    console.log('Seguinte erro ocorreu: ' + err);
  }

  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);

} else {
   console.log('getUserMedia seu navegador não suporta!');
}




$(document).ready(function() {


  socket.on('saiu', (response) => {
  	//console.log(response)
  	$('#status'+response.contato_id).attr('class','offline')
  })

  socket.on('novo status', (status) => {
	novo_status = status.status
	$('#status'+status.usuario_id).attr('class',novo_status)
  })

  img = 0;
  $('input[type=file]').change(function(e) {

  id = "{{id}}"

  var data_upload = moment().format('DDMMYYYY')
  var hora_upload = moment().format('HHmmss')

  var file = e.target.files[0];

  var stream = ss.createStream();

	if(file.size > 1000024){
		alert('ARQUIVO NÃO PODE SER MAIOR QUE 1 MB')
		return false
	}

    // UPLOAD ARQUIVO PARA O SERVIDOR

	ss(socket).emit('file', stream, {size: file.size, name:file.name, id:id, data_upload:data_upload, hora_upload:hora_upload});

  	ss.createBlobReadStream(file).pipe(stream);


	var blobStream = ss.createBlobReadStream(file);
	var size = 0;

	var iTamanho = file.size;

	var filename = file.name
	var iTam = filename.length

	var extension = filename.substr(-3,iTam)



	if(
		extension.toLowerCase() == 'jpg' || 
		extension.toLowerCase() == 'bmp' ||
		extension.toLowerCase() == 'gif' ||
		extension.toLowerCase() == 'png' &&
		extension.toLowerCase() != 'mp3' 
		
	){
		$('#conteudo-message').append(
			"<li class='replies'>"+
					"<img src='' alt='' />"+
				"<p>Anexo <span id='percentual"+img+"'>- </p>"+
			"</li>"	
		)

		$('#conteudo-message').append(
				"<p>"+
				"<img "+
				"src='"+window.URL.createObjectURL(this.files[0])+"' "+
				"width='150px' style='position:relative;float:right'> "
		)
	}else{
		$('#conteudo-message').append(
			"<li class='replies'>"+
				"<p>Anexo <span id='percentual"+img+"'> - "+
			"</li>"+
			"<li class='replies'>"+
				"<p><a href='"+window.URL.createObjectURL(this.files[0])+"'>"+filename+"</a>"+	
			"</li>"

		)
	}



	blobStream.on('data', function(chunk) {
		size += chunk.length; 
	
		$('#percentual'+img+'').html(Math.floor(size / file.size * 100)+'%'+' - '+moment().format('HH:mm')); 
	
	});

	
	blobStream.on('end',function(){
		
		img++

		arquivo = id+'-'+data_upload+'-'+hora_upload+'-'+file.name
		remetente_id    = contato_id
		destinatario_id = $('#contact-profile-destinatario_id').val()
		// socket_id       = $('#contact-profile-socket_id').val()
		email           = $('#profile-email').val()
		arquivo         = arquivo
		message         = ''	


		// socket.emit("enviar mensagem privada",{remetente_id:remetente_id,destinatario_id:destinatario_id,mensagem:message,socket_id:socket_id,email:email,arquivo:arquivo}, (response) => {
		// 	console.log(response)
		// })
	socket.emit('verifica socket id', {destinatario_id:destinatario_id}, (response) => {
		// console.log(response)
		$('#contact-profile-socket_id').val(response.socket_id)
		socket_id       = $('#contact-profile-socket_id').val()
	
		socket.emit("enviar mensagem privada",{remetente_id:remetente_id,destinatario_id:destinatario_id,mensagem:message,socket_id:socket_id,email:email,arquivo:arquivo}, (response) => {
			// console.log(response)
		})		
	})


	})		

  	
    $("#arquivo").val(null);
	
}); 

// MUDA STATUS DO USUARIO

$('#profile-img').click(function(){
	$('.message-input').hide()
})

$('#status-online').click(function(){
	
	status = $('#status-online').data('status')
	socket.emit("muda status",{contato_id:contato_id,status:status},(response) => {
				
	});

})
$('#status-away').click(function(){
	status = $('#status-away').data('status')
	socket.emit("muda status",{contato_id:contato_id,status:status},(response) => {
 		
	});
})
$('#status-busy').click(function(){
	status = $('#status-busy').data('status')
	socket.emit("muda status",{contato_id:contato_id,status:status},(response) => {
 
	});
})
$('#status-offline').click(function(){
	status = $('#status-offline').data('status')
	socket.emit("muda status",{contato_id:contato_id,status:status},(response) => {
 
	});
})

///////////////////////////////////////////////////
$('#busca_contatos').keyup(function(){

	socket.on('novo status', (status) => {
		// console.log(status)
		novo_status = status.status
		$('#status'+status.usuario_id).attr('class',novo_status)

	})

	busca = $('#busca_contatos').val()
	destinatario_id = $('#contact-profile-destinatario_id').val()
	destinatario_id = "{{id}}"

	socket.emit("busca contatos",{busca:busca,destinatario_id:destinatario_id},(usuarios) => {
		//console.log(usuarios)
		
		$('#contacts').empty()
		TotalUsuarios = usuarios.usuarios.length
		for(i = 0 ; i<=TotalUsuarios-1 ; i++){
			gravatar  = md5(usuarios.usuarios[i].email);
			id        = usuarios.usuarios[i].id;
			iMensagemRecebida = usuarios.usuarios[i].iMensagemRecebida
			

			if(iMensagemRecebida == '0'){ iMensagemRecebida = ''}
			if(usuarios.usuarios[i].id != "{{id}}" ){ 
			$('#contacts').append(
								"<ul onclick='localizaUsuario("+id+","+telefone+")'>"+
									"<li class='contact contact-active"+id+"'> "+
										"<div class='wrap'>"+
											"<span class='contact-status "+usuarios.usuarios[i].status+"'></span>"+
											"<img src='https://secure.gravatar.com/avatar/"+gravatar+"'/>"+
											"<div class='meta'>"+
												"<p class='name'>"+usuarios.usuarios[i].name+"</p>"+
												"<p class='preview' ></p>"+
												"</p>"+
											"</div>"+
										"</div>"+
										"<span class='badge badge-pill badge-danger' id='badge"+id+"'>"+iMensagemRecebida+"</span>"+
									"</li>"+
								"</ul>"
			)
			}
		}

	})

})


$('.clip').click(function(){
	$('#arquivo').click()
})
contact_id = "{{id}}"

var input = document.querySelector('.mensagem');
const picker = new EmojiButton({
    position: "bottom"
    
})

picker.on('emoji', function(emoji){
    input.value += emoji;
})

$('.smile').click(function(){
    picker.pickerVisible ? picker.hidePicker() : picker.showPicker(input);
})


$("#profile-img").click(function() {
	$("#status-options").toggleClass("active");
});

$(".expand-button").click(function() {
  $("#profile").toggleClass("expanded");
	$("#contacts").toggleClass("expanded");
});

$("#status-options ul li").click(function() {
	$("#profile-img").removeClass();
	$("#status-online").removeClass("active");
	$("#status-away").removeClass("active");
	$("#status-busy").removeClass("active");
	$("#status-offline").removeClass("active");
	$(this).addClass("active");
	
	if($("#status-online").hasClass("active")) {
		$("#profile-img").addClass("online");
	} else if ($("#status-away").hasClass("active")) {
		$("#profile-img").addClass("away");
	} else if ($("#status-busy").hasClass("active")) {
		$("#profile-img").addClass("busy");
	} else if ($("#status-offline").hasClass("active")) {
		$("#profile-img").addClass("offline");
	} else {
		$("#profile-img").removeClass();
	};
	
	$("#status-options").removeClass("active");

});


function newMessage(minhaFoto) {

 	message = $(".message-input input").val();

	if($.trim(message) == '') {
		return false;
	}
	$('<li class="replies"><img src="'+minhaFoto+'" alt="" id="replies-img" /><p>' + message + '<span id="dataHora"> - '+moment().format('HH:mm')+'</span></p></li>').appendTo($('.messages ul'));
	$('.message-input input').val(null);
	$('.contact.active .preview').html('<span>Você: </span>' + message);
 
	remetente_id    = contato_id
	destinatario_id = $('#contact-profile-destinatario_id').val()
	email           = $('#profile-email').val()
	arquivo         = ''

	socket.emit('verifica socket id', {destinatario_id:destinatario_id}, (response) => {
		 console.log(response)
		$('#contact-profile-socket_id').val(response.socket_id)
		socket_id       = $('#contact-profile-socket_id').val()
	
		socket.emit("enviar mensagem privada",{remetente_id:remetente_id,destinatario_id:destinatario_id,mensagem:message,socket_id:socket_id,email:email,arquivo:arquivo}, (response) => {
			console.log(response)
			
		})		
		
		socket.emit('teste',{contato_id:contato_id})

	})


};


$('.submit').click(function() {
  minhaFoto = $('#profile-img').attr('src')
  newMessage(minhaFoto);
});

$(window).on('keydown', function(e) {
  if (e.which == 13) {
	minhaFoto = $('#profile-img').attr('src')
	
    newMessage(minhaFoto);
    return false;
  }
});
///
//CONECTAR - ATUALIZA O SOCKET ID DO CONTATO

contato_id = "{{id}}"

socket.emit("usuario entra no chat",contato_id, (response) =>{
	// console.log(response)
 	socket.emit("muda status",{contato_id:contato_id,status:'online'},(response) => {});

	socket.on("lista usuarios", (usuarios) =>{
		
		for(i = 0 ; i <= usuarios.usuarios.length-1; i++){
			$('#status'+usuarios.usuarios[i].id).attr('class',usuarios.usuarios[i].status)		
		} 

	})
	
})

socket.emit("bio do usuario",contato_id, (response) =>{
 	telefone = response.resposta[0].telefone

	$('#profile-phone').val(telefone)		
	$('#profile-email').val(response.resposta[0].email)

	
})

// LISTAR USUARIOS
socket.on("lista usuarios", (usuarios) =>{
	$('#contacts').empty()

	socket.on("conta mensagem nao lida",(response) => { 
 		$('#badge'+response.emitter_id).html(response.iMsgNaoLida)
 		$('#titulo').html('VoxChat - (Nova Mensagem)')
	})

	

	TotalUsuarios = usuarios.usuarios.length
  	for(i = 0 ; i<=TotalUsuarios-1 ; i++){
 		gravatar  = md5(usuarios.usuarios[i].email);
		id        = usuarios.usuarios[i].id;
		telefone  = usuarios.usuarios[i].phone
		iMensagem = usuarios.usuarios[i].iMensagemRecebida;




		if(usuarios.usuarios[i].id != "{{id}}" ){
			if(iMensagem > 0){
				$('#contacts').append(
										"<ul onclick='localizaUsuario("+id+","+telefone+")'>"+
											"<li class='contact contact-active"+id+"'> "+
												"<div class='wrap'>"+
													"<span class='contact-status"+usuarios.usuarios[i].status+"' id='status"+id+"'></span>"+
													"<img src='https://secure.gravatar.com/avatar/"+gravatar+"'/>"+
													"<div class='meta'>"+
														"<p class='name' title='"+usuarios.usuarios[i].status+"'>"+usuarios.usuarios[i].name+"</p>"+
														"<p class='preview'></p>"+
														"</p>"+
													"</div>"+
												"</div>"+
												"<span class='badge badge-pill badge-danger' id='badge"+id+"'>"+iMensagem+"</span>"+
											"</li>"+
										"</ul>"
				)
			}
			if(iMensagem <= 0){


				$('#contacts').append(
										"<ul onclick='localizaUsuario("+id+","+telefone+")' >"+
											"<li class='contact contact-active"+id+"' >"+
												"<div class='wrap' id='wrap"+id+"''>"+
													"<span class='contact-status"+usuarios.usuarios[i].status+"' id='status"+id+"'></span>"+
													"<img src='https://secure.gravatar.com/avatar/"+gravatar+"'/>"+
													"<div class='meta'>"+
														"<p class='name' title='"+usuarios.usuarios[i].status+"'>"+usuarios.usuarios[i].name+"</p>"+
														"<p class='preview'></p>"+
														"</p>"+
													"</div>"+
												"</div>"+
												"<span class='badge badge-pill badge-danger' id='badge"+id+"'></span>"+
											"</li>"+
										"</ul>"
				)
			}
		}

 	}

 	email = md5("{{email}}") 
	
	$('#profile-img').attr('src',"https://secure.gravatar.com/avatar/"+email)
 	$('#profile-name').html("{{name_usuario}}")
	 
  
})

socket.on("atualiza mensagem", (response) => {
	 console.log(response.destino)
	mensagem = response.mensagem
	gravatar = md5(response.email);
	dataHora = moment().format('HH:mm')
	console.log(response)
////	
	if(response.destino == $('#contact-profile-destinatario_id').val()) {

		if(response.arquivo != ''){

			setTimeout(function(){ 
			
			var filename = response.arquivo
			var iTam = filename ? filename.length : ""
			var extension = filename ? filename.substr(-3,iTam) : ""

			// AUDIO RECEBIDO DO SERVIDOR 

			if(extension.toLowerCase() == 'mp3'){
				if($('#contact-profile-destinatario_id').val() ==  response.destino){
					$('#conteudo-message').append(
							"<li class='replies'>"+
									"<audio controls src='uploads/"+filename+"' > </audio>"+
							"</li>"	
						)
					return false
				} 
				return false
			}

			if(
				extension.toLowerCase() == 'jpg' || 
				extension.toLowerCase() == 'bmp' ||
				extension.toLowerCase() == 'gif' ||
				extension.toLowerCase() == 'png' ||
				extension.toLowerCase() != 'mp3'
			){

				// IMAGEM RECEBIDA DO SERVIDOR 

				$('#conteudo-message').append(
					"<img class='img-recebida card-image' "+
					"src='uploads/"+filename+"'>"+
					"<li class='sent'>"+
					"<p><a href='uploads/"+filename+"' target='_blank'>"+filename+"</a>"+
					"</li>"

				)
				
			}else{
				
				$('#conteudo-message').append(
					"<li class='sent'>"+
						"<p><a href='uploads/"+filename+"' target='_blank'>>"+response.file+"</a>"+
					"</li>"
				)
			}
			
			}, 4000)

			
		}else{ 


				if($('#contact-profile-destinatario_id').val() ==  response.destino){
					$('#conteudo-message').append(
						"<li class='sent'>"+
							"<img src='https://secure.gravatar.com/avatar/"+gravatar+"'/>"+
							"<p>"+mensagem+"<span id='dataHora'> - "+dataHora+"</p>"+
						"</li>"			
					)		
			}
		}
	}	
})

	socket.on("contato selecionado", (dados) => {
		$('#phoneVoxSip').val(dados.dados[0].ramal)
		email = md5(dados.dados[0].email)
		$('#contact-profile-img').attr('src',"https://secure.gravatar.com/avatar/"+email)
		$('#contact-profile-name').html(dados.dados[0].name)
		$('#contact-profile-socket_id').val(dados.dados[0].socket_id)
		$('#contact-profile-destinatario_id').val(dados.dados[0].id)
		$('#contact-profile-email').val(dados.dados[0].email)
	})



})

var lastClick = 0
var delay     = 30

function localizaUsuario(id,telefone){
	$('#titulo').html('VoxChat')

  $('.message-input').show()
  $('.mensagem').focus()
  // Evitar Duplo Clique
  if (lastClick >= (Date.now() - delay))
  return
  lastClick = Date.now()
  /////////////////////////////////////////

	x = $('#contact-profile-destinatario_id').val() 
	if(id != $('#contact-profile-destinatario_id').val()){
		$('#conteudo-message').empty()

		$('#phoneVoxSip').val(telefone)
				
		$('.voxsip').click(function(e){
			tel = $('#phoneVoxSip').val()
			window.open('tel:'+tel)
		})
		
		$('.message-input').show()


		$('.mensagem').focus()
		remetente = "{{id}}"
		
		$('.contact').removeClass('active')
		$('.contact-active'+id).addClass('active')

		socket.emit('dados do contato',{id:id}) 

		
		socket.emit('confirma leitura mensagem',{destinatario:id}, (response) => {
	 		$('#badge'+id).empty()
		})


		socket.emit('historico de mensagem',{remetente:remetente,destinatario:id}, (response) => {
			console.log(response.resposta)
			pathAWS = 'https://voxcity.s3.sa-east-1.amazonaws.com/'

			minhaFoto = minhaFoto = $('#profile-img').attr('src')
			
			iMensagem = response.resposta.length

	 		for(i = 0 ; i <= iMensagem-1 ; i++){		 
				var filename = response.resposta[i].file
				var iTam = filename.length
				var extension = filename.substr(-3,iTam)
				
				file  = response.resposta[i].file
				mensagem = response.resposta[i].message
				dataHora = moment(response.resposta[i].created).format('HH:mm:ss')
				enviada  = response.resposta[i].emitter
				gravatar = md5(response.resposta[i].email);
				fotoDestinatario = 'https://secure.gravatar.com/avatar/'+gravatar

				
				if(extension.toLowerCase() == 'mp3'){
			  	if(enviada == remetente){
							if(file.length > 0){
								$('#conteudo-message').append(					
												"<audio controls src='"+pathAWS+file+"' class='audio-enviada'> </audio> "
									)
							}
					}else{
							$('#conteudo-message').append(			

											"<audio controls src='"+pathAWS+file+"' class='audio-recebido'> </audio> "
								)				
					} 
				}

				if(
					extension.toLowerCase() == 'jpg' || 
					extension.toLowerCase() == 'bmp' ||
					extension.toLowerCase() == 'gif' ||
					extension.toLowerCase() == 'png' ||
					extension.toLowerCase() != 'mp3' 

				){			
				// Busca mensagem enviada na tabela
	  		if(enviada == remetente){

					if(arquivo.length > 0){
						$('#conteudo-message').append(
							"<img class='img-enviada'"+
							 "src='"+pathAWS+arquivo+"' alt='' '>"+
							"<li class='replies'>"+
								"<p><a href='"+pathAWS+arquivo+"' target='_blank'>"+arquivo+"</a>"+
							"</li>"
						)					

					}else{
				
						$('#conteudo-message').append(
								"<li class='replies'>"+
									"<img src='"+minhaFoto+"' alt='' />"+
									"<p>"+mensagem+" - "+dataHora+"</p>"+
								"</li>"	
				
						)
					}
				}else{
					// IMAGEM DA TABELA
					if(arquivo.length > 0){
						$('#conteudo-message').append(
							"<img class='img-recebida'"+
							"src='"+pathAWS+arquivo+"' alt='' >"+
							"<li class='sent'>"+
								"<p><a href='"+pathAWS+arquivo+"' target='_blank'>"+arquivo+"</a>"+
							"</li>"

					
						)					

					}else{

						$('#conteudo-message').append(
								"<li class='sent'>"+
									"<img src='"+fotoDestinatario+"' alt='' />"+
									"<p>"+mensagem+" - "+dataHora+"</p>"+
								"</li>"			
						)
						
					}

				}

			}else{
				// Arquivos Recebidos
	  			if(enviada == remetente){

					if(arquivo.length > 0){
						$('#conteudo-message').append(
							"<li class='replies'>"+
								"<p><a href='"+pathAWS+arquivo+"'  target='_blank'>"+arquivo+"</a></span>"+
							"</li>"	
							
						)					

					}else{
				
						$('#conteudo-message').append(
								"<li class='replies'>"+
									"<img src='"+minhaFoto+"' alt='' />"+
									"<p>"+mensagem+" - "+dataHora+"</p>"+
								"</li>"			
						)
					}
				}else{

					if(arquivo.length > 0){
						$('#conteudo-message').append(
							"<li class='sent'>"+						
								"<p><a href='"+pathAWS+arquivo+"'  target='_blank'>"+arquivo+"</a></span>"+				
							"</li>"
					
						)					

					}else{
						// MENSAGEM RECEBIDA 
						
						$('#conteudo-message').append(
								"<li class='sent'>"+
									"<img src='"+fotoDestinatario+"' alt='' />"+
									"<p>"+mensagem+" - "+dataHora+"</p>"+
								"</li>"			
						)	
					}
				}
			}
			}
		})	
		
	}
}
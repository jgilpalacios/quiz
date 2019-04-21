let modeloLocal;

function checkTodas(datos){
	let msgAciertos= datos.msg;
	let texto=`<p>${msgAciertos}</p>
			<button class="vuelve" onclick="index()">Go back</button>`;
		$('#form').html(texto);
		$('#form').show();
		$('#msg').hide()
}

function quizForm(datos){
		let action=datos.action;
		let msg=datos.msg;
		let id=datos.id;
		let question=datos.question;
		let answer=datos.answer;
		let modo=datos.modo;
		let texto=`<form id="pregunta"  method="post"   action="${action}" onsubmit="return Conecta($(this));">
				${msg}: <p>
				<input type="hidden" name="id" value="${id}" />
				<input  type="text"  name="question" value="${question}" placeholder="Question" />
				<input  type="text"  name="answer"   value="${answer}"   placeholder="Answer" />
				<input  type="submit" value="${modo}"/> <br>
		</form>
		</p>
		<button class="vuelve" onclick="index()">Go back</button>`
		$('#form').html(texto);

		$('#form').show();
		$('#msg').hide()
}

function check(datos){
			let id=datos.id;
			let msg=datos.msg;
			let resp=datos.response;
			let texto=`<strong><div id="msg">${msg}</div></strong>
							<p>
							<button class="vuelve" onclick="index()">Go back</button>
							<button class="vuelve" onclick="Conecta('GET', '/quizzes/${id}/play?response=${resp}')">Try again</button></p>`;
			$('#form').html(texto);

			$('#form').show();
			$('#msg').hide()
}

function play(datos){
				let id=datos.id;
				let question=datos.question;
				let resp=datos.response;
				let method=datos.method;
				let preguntas=datos.preguntas;
				let msgAciertos= datos.msgAciertos;//alert(method);
				let texto=`${msgAciertos}
			        <form id="play" method="${method}" action="/quizzes/${id}/check" onsubmit="return Conecta($(this));">
			            ${question}: <p>
			            <input type="text" name="response" value="${resp}" placeholder="Answer" />
			            <input type="submit" value="Check"/> <br>
			            <input type="hidden" name="preguntas" value="${preguntas}" />
			        </form>
			        </p>
			      <button class="vuelve" onclick="index()">Go back</button>`;
        	$('#form').html(texto);
          $('#form').show();
          $('#msg').hide();
}

function index(quizzes){
		if(quizzes){
			modeloLocal=quizzes;
			let texto=`<table>`+ quizzes.reduce((ac, quiz) => ac +=`<tr><td>
			<span class="play" onclick="Conecta('GET', '/quizzes/${quiz.id}/play')">${quiz.question}</span></td><td>
			<button class="vuelve" onclick="Conecta('GET','/quizzes/${quiz.id}/edit')">Edit</button>
			<button class="vuelve" onclick="if (confirm('Delete: ${quiz.question}')) Conecta('GET','/quizzes/${quiz.id}?_method=DELETE');">Delete</button></td></tr>\n`,"") +
			`</table><button class="vuelve" onclick="Conecta('GET','/quizzes/new')">New Quiz</button>
			<button class="vuelve" onclick="Conecta('LOCAL','/quizzes/playAll')">Play All</button>`;
			$('#msg').html(texto);
		}
		$('#msg').show();
    $('#form').hide();
}

//Local CONTROLLERs
let tanda=[];//ordenación local de las preguntas para tanda playAll, se mantine como global local
function playAll(datos){
		let quizzes=[];//contendra en local la ordenación de aleatoria de las preguntas
	 	modeloLocal.forEach((aux, j)=>{
				let pos=Math.floor(modeloLocal.length*Math.random());
				if (pos!=j){
						if(quizzes[pos]===undefined) {
								if(quizzes[j]===undefined){
									quizzes[j]=pos;
									quizzes[pos]=j;
								}else{
									quizzes[pos]=quizzes[j];
									quizzes[j]=pos;
								}
						} else {
							if(quizzes[j]===undefined){
								quizzes[j]=quizzes[pos];
								quizzes[pos]=j;
							}else{
								let aux=quizzes[pos]
								quizzes[pos]=quizzes[j];
								quizzes[j]=aux;
							}
						}
				}else	if (quizzes[j]===undefined) quizzes[j]=j;
		})
		tanda=quizzes;
		return {generador:'play', Datos:{id: 	modeloLocal[quizzes[0]].id,  question:modeloLocal[quizzes[0]].question, response:'', method: 'LOCAL', preguntas:0, msgAciertos: ''}};
}

function playQuestions (datos) {
	 let aux=datos.split('&');
	 let aciertos = aux[1].split('=')[1];
	 let quizzes = tanda;
	 let response = decodeURI(aux[0].split('=')[1]);
	 if(modeloLocal[quizzes[0]].answer===response){
			 aciertos++;
			 let msgAciertos=`Ok, seguimos con la pregunta nº ${aciertos+1}<br>`;//como pos no guarda el nº de preguntas hechas
			 quizzes.splice(0,1);//quitamos la pregunta ya hecha
			 if(quizzes.length>0){
				 return {generador:'play', Datos:{id: modeloLocal[quizzes[0]].id, question:modeloLocal[quizzes[0]].question, response:'', method:'LOCAL', preguntas:aciertos, msgAciertos: msgAciertos}};
			 }else return {generador:'checkTodas', Datos:{ msg: `Ha tenido  ${aciertos} aciertos.`}};
	 }else {
			 msgFallo=`Ha fallado esta pregunta, "${modeloLocal[quizzes[0]].question}" no es "${response}" sino  "${modeloLocal[quizzes[0]].answer}".<br/>`;
			 return {generador:'checkTodas', Datos:{ msg: `${msgFallo}Ha tenido  ${aciertos} aciertos.`}};
	 }
 }

//analizador de rutas
function compara(base,ruta){
	let bases=base.split('/');
	let rutas=ruta.split('/');
	let request={};
	let ok=true;
	bases.forEach((base,i)=>{
		if (base.substring(0,1)===':'){
			request[base.substring(1)]=rutas[i];
		}else{
			if(base!==rutas[i]){
				ok=false;
				return
			}
		}
	});
	//alert(JSON.stringify(request));
	return ok;
}

function Conecta(tipo, url, datos){
		if(typeof tipo !== 'string'){
			if(tipo.href){
				url=tipo.href;
			}else{
				url=tipo.attr("action");
				datos = tipo.serialize();
				tipo=tipo.attr("method");
			}
		}


		if (tipo==='LOCAL'){ //enrutamiento en cliente sin ir al servidor
			//router LOCAL
			let paquete;
			if(compara('/quizzes/playAll',url)) paquete=playAll(datos);
			else if(compara('/quizzes/:id/check',url)) paquete=playQuestions(datos);

			// vistas
			let generador=paquete.generador; //alert(JSON.stringify(paquete));

			if(generador==='play') play (paquete.Datos);
			else if(generador==='checkTodas') checkTodas(paquete.Datos);

		}else $.ajax({//AYAX AL SERVIDOR
			type: tipo,
			url: url,
			data:datos||'',
			success: function(response){
				let paquete=JSON.parse( decodeURI(response));
				let generador=paquete.generador;
				if(generador==='index') index(paquete.Datos);
				else if(generador==='play') play (paquete.Datos);
				else if(generador==='check') check (paquete.Datos);
				else if(generador==='quizForm') quizForm (paquete.Datos);
				else if(generador==='checkTodas') checkTodas(paquete.Datos)
			}
		});

		return false;//NO SE ENVIAN LOS FORMULARIOS COMO TALES
}

$(function(){
		alert('se entra');
		//Conecta('GET', '/quizzes');
});

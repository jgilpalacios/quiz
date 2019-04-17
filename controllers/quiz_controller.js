var models = require('../models/models.js');

// Autoload - factoriza el código si ruta incluye :qizId
exports.load = function(req, res, next, quizId){
	models.Quiz.findByPk(Number(quizId), { include: [ { model: models.Comment }] })
	.then( function(quiz){
		if (quiz){
			req.quiz=quiz;
			next();
		} else { next(new Error('No existe quizId'+quizId));}
	})
	.catch (function(error) { next(error);});
	/*models.Quiz.find({
		where: { id: Number(quizId) },
		include: [{ model: models.Comment }]
	     }).then(
	     function(quiz){
		if (quiz){
			req.quiz=quiz;
			next();
		} else { next(new Error('No existe quizId'+quizId));}
	     }
	).catch (function(error) { next(error);});*/
};

//GET /quizes
exports.index = function(req, res, next){
	//const Op = Sequelize.Op;
	var condicion=req.query.search || '%';
	if (condicion!='%') condicion='%'+condicion.replace(/\s/g, '%')+'%';
	
	//models.Quiz.findAll({where: ["pregunta like ?", condicion]})
	models.Quiz.findAll({where: {pregunta: { [models.Op.like]: condicion}}})
	//models.sequelize.query('SELECT * FROM Quizzes WHERE pregunta like ?', { raw: true, replacements: [condicion] } )
	//models.Quiz.findAll()
	.then(
	  function(quizes){
		res.render('quizes/index',{quizes: quizes, errors: []});
	  })
	.catch(function(error) { next(error);})
};

//GET /quizes/:id
exports.show = function(req, res){
	res.render('quizes/show',{quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res){
	var resultado='Incorrecto.';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado='Correcto.';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res){
	var quiz = models.Quiz.build(// crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta", tema: ""}
	);
	res.render('quizes/new', {quiz: quiz, errors: []});
};

// POST /quizes/create
exports.create = function(req, res, next){
	let {pregunta, respuesta, tema}=req.body.quiz;
	let quiz={pregunta, respuesta, tema};
	models.Quiz.build({pregunta, respuesta, tema})
	.validate()
	.then((quiz)=>{
		quiz.save()
		.then((quiz) => res.redirect('/quizes'))
	})
	.catch((errors) => {
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};

		//`Quiz not created:\n${error}`
		res.render('quizes/new', {quiz: quiz, errors: errores});
	});
	/*var quiz = models.Quiz.build( req.body.quiz );
	
	var errors = quiz.validate();//ya qe el objeto errors no tiene then(
	if (errors)
	{
		var i=0; var errores=new Array();//se convierte en [] con la propiedad message por compatibilida con layout
		for (var prop in errors) errores[i++]={message: errors[prop]};		
		res.render('quizes/new', {quiz: quiz, errors: errores});
	} else {
		quiz // save: guarda en DB campos pregunta y respuesta de quiz
		.save({fields: ["pregunta", "respuesta", "tema"]})
		.then( function(){ res.redirect('/quizes')}) ;
	}*/
};

// GET /quizes/:id/edit
exports.edit = function(req, res){
	var quiz = req.quiz; // autoload de instancia quiz
		
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res, next){
	req.quiz.pregunta   = req.body.quiz.pregunta;
	req.quiz.respuesta  = req.body.quiz.respuesta;
	req.quiz.tema       = req.body.quiz.tema;
	//let id = +req.body.quiz.id;
	//let quiz={pregunta ,respuesta, tema};

	req.quiz.validate()
	.then((quiz)=>{
		req.quiz // save: guarda en DB campos pregunta y respuesta de quiz
		.save()
		.then( function(){ res.redirect('/quizes')}) ;
	})
	.catch((errors) => {
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};
		res.render('quizes/edit', {quiz: req.quiz, errors: errores});
	});
	
	/*var errors = req.quiz.validate();//ya qe el objeto errors no tiene then( y aparece error al invocarlo
	if (errors)
	{
		var i=0; var errores=new Array();//se convierte en [] con la propiedad message por compatibilidad con layout
		for (var prop in errors) errores[i++]={message: errors[prop]};		
		res.render('quizes/edit', {quiz: req.quiz, errors: errores});
	} else {
		req.quiz // save: guarda en DB campos pregunta y respuesta de quiz
		.save({fields: ["pregunta", "respuesta", "tema"]})
		.then( function(){ res.redirect('/quizes')}) ;
	}*/
};

// DELETE /quizes/:id
exports.destroy = function(req, res){
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch( function(error){ next(error)});
};

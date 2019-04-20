let models = require('../models/models.js');
let topicController = require('../controllers/topic_controller');

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
};

//GET /quizes
exports.index = function(req, res, next){
	//const Op = Sequelize.Op;
	let condicion=req.query.search || '%';
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
	let resultado='Incorrecto.';
	if (req.query.respuesta === req.quiz.respuesta){
		resultado='Correcto.';
	}
	res.render('quizes/answer', {quiz: req.quiz, respuesta: resultado, errors: []});
};

// GET /quizes/new
exports.new = function(req, res){
	let quiz = models.Quiz.build(// crea objeto quiz
		{pregunta: undefined/*"Pregunta"*/, respuesta: null/*"Respuesta"*/, tema: ""}
	);
	//let topics; //consultamosla lista de temas
	models.Topic.findAll({attributes: ['texto'], order: ['texto']})
	.then(
	  function(topics){
	  	/*console.log(JSON.stringify( result ));
		topics=result;*/
		//console.log('Vamos que no sale: '+JSON.stringify( topics ));
		res.render('quizes/new', {quiz: quiz, topics: topics, errors: []});
	  })
	.catch(function(error) { next(error);})
	/*console.log('Vamos que no sale: '+JSON.stringify( topics ));
	res.render('quizes/new', {quiz: quiz, topics: topics, errors: []});*/
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

};

// GET /quizes/:id/edit
exports.edit = function(req, res){
	let quiz = req.quiz; // autoload de instancia quiz
	//console.log('jjjj'+JSON.stringify(quiz));
	models.Topic.findAll({attributes: ['texto'], order: ['texto']})
	.then((topics)=>{
		res.render('quizes/edit', {quiz: quiz, topics: topics, errors: []});
	})
	.catch((errors)=>{
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};
		res.render('quizes/edit.ejs', {quiz: req.quiz, errors: errores});
	});
};

// PUT /quizes/:id
exports.update = function(req, res, next){
	req.quiz.pregunta   = req.body.quiz.pregunta;
	req.quiz.respuesta  = req.body.quiz.respuesta;
	req.quiz.tema       = req.body.quiz.tema;

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
	
};

// DELETE /quizes/:id
exports.destroy = function(req, res){
	req.quiz.destroy().then( function() {
		res.redirect('/quizes');
	}).catch( function(error){ next(error)});
};

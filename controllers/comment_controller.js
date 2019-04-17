var models = require('../models/models.js');

// Autoload :id de comentarios
/*exports.load = function(req, res, next, commentId){
	models.Comment.find({
		where: {
			id: Number(commentId)
		}
	}).then(function(comment) {
		if(comment){
		        console.log('comment'
			req.comment =comment;
			next();
		} else { 
			next(new Error ('No existe commentId=' + commentId ))}
		}
	).catch( function (error) { next( error )});
};*/

// GET /quizes/:quizId/comments/new
exports.new = function(req, res){
	res.render('comments/new.ejs', {quizid: req.params.quizId, errors: []});
};

// POST /quizes/:quizId/comments
exports.create = function(req, res){
	let comment = models.Comment.build( 
		{ texto: req.body.comment.texto,
		  QuizId: req.params.quizId } 
	);
	comment.validate()
	.then((comment)=>{
		comment.save()
		.then((comment) => res.redirect('/quizes/'+req.params.quizId))
	})
	.catch((errors) => {
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};
		res.render('comments/new.ejs', {comment: comment, quizid: req.params.quizId, errors: errores});
	});
	
	/*var errors = comment.validate();//ya qe el objeto errors no tiene then(
	if (errors)
	{
		var i=0; var errores=new Array();//se convierte en [] con la propiedad message por compatibilida con layout
		for (var prop in errors) errores[i++]={message: errors[prop]};		
		res.render('comments/new.ejs', {comment: comment, quizid: req.params.quizId, errors: errores});
	} else {
		comment // save: guarda en DB campo texto de comment
		.save()
		.then( function(){ res.redirect('/quizes/'+req.params.quizId)}) ;
	}//.catch(function(error){next(error)})*/
};

// GET /quizes/:id/comments/edit/:posicion
exports.edit = function(req, res){
	//console.log('kk de vaca:'+req.params.quizId+'; req.params.posicion: '+req.params.posicion+'; req.quiz.comments[0]: '+req.quiz.comments[+req.params.posicion].texto );
	res.render('comments/edit.ejs', {	quizid: req.params.quizId, 
						taedit: req.quiz.Comments[+req.params.posicion].texto,//req.comments[req.params.posicion].texto, 
						posicion: req.params.posicion,//req.comments[req.params.posicion].id, 
						errors: []});
};

// PUT /quizes/:id/comments/:posicion(\\d+)
exports.update = function(req, res){
	var comment=req.quiz.Comments[+req.params.posicion];
	
	comment.texto = req.body.comment.texto;
	comment.validate()
	.then((comment)=>{
		comment.save()
		.then((comment) => res.redirect('/quizes/'+req.params.quizId))
	})
	.catch((errors) => {
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};
		res.render('comments/edit.ejs', {comment: comment,
						 quizid: req.params.quizId,
						 taedit: comment.texto,
						 posicion: req.params.posicion,
						 errors: errores});
	});
	
	/*var errors = comment.validate();//ya qe el objeto errors no tiene then( y aparece error al invocarlo
	if (errors)
	{
		var i=0; var errores=new Array();//se convierte en [] con la propiedad message por compatibilidad con layout
		for (var prop in errors) errores[i++]={message: errors[prop]};		
		res.render('comments/edit.ejs', {comment: comment,
						 quizid: req.params.quizId,
						 taedit: comment.texto,
						 posicion: req.params.posicion,
						 errors: errores});
	} else {
		comment // save: guarda en DB campo texto de comment
		.save()
		.then( function(){ res.redirect('/quizes/'+req.params.quizId)}) ;
	}*/
};

// DELETE /quizes/:id/comments/:posicion(\\d+)
exports.destroy = function(req, res){
	console.log('kk de vaca:'); 
	req.quiz.Comments[+req.params.posicion].destroy().then( function() {
		res.redirect('/quizes/'+req.params.quizId);
	}).catch( function(error){ next(error)});
};

// --GET /quizes/:quizId/comments/:commentId/publish
// PUT /quizes/:quizId/comments/:posicion/publish
exports.publish = function(req, res) {
	//console.log("++++++++req.comment: "+req.quiz.comments[+req.params.posicion].publicado);
	var comment=req.quiz.Comments[+req.params.posicion];
	comment.publicado = true;
	
	comment.save( { fields: ["publicado"]})
		.then( function() { res.redirect('/quizes/'+req.params.quizId);})
		.catch( function(error){next(error)});
};

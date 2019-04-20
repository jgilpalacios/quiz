let models = require('../models/models.js');

// Autoload :id de comentarios
/*exports.load = function(req, res, next, topicId){
	models.topic.find({
		where: {
			id: Number(topicId)
		}
	}).then(function(topic) {
		if(topic){
		        console.log('topic'
			req.topic =topic;
			next();
		} else { 
			next(new Error ('No existe topicId=' + topicId ))}
		}
	).catch( function (error) { next( error )});
};*/

// promesa que devuelve todos los comentarios de la BD
/*const topicsAll = () => {
	return new Sequelize.Promise ((resolve, reject) => {
		models.Topic.findAll()
		.then(
	  	function(results){
			console.log('AAAAA'+JSON.stringify(results));
			resolve (results);
	  	})
		.catch(reject(errors));
	});
};

exports.topicsAll;*/

// GET /quizes/topics/
exports.show = function(req, res){
	models.Topic.findAll()
	.then(
	  function(topics){
		console.log(JSON.stringify(topics));
		res.render('topics/show.ejs',{topics: topics, errors: []});
	  })
	.catch(function(error) { next(error);});
};

// GET /quizes/topics/new
exports.new = function(req, res){
	/*console.log(JSON.stringify(req.query)+'\n         ---------');
	console.log(req.query.topics);
	console.log('         ---------');
	console.log(decodeURI(req.query.topics));*/
	let topics=JSON.parse(decodeURI(req.query.topics))||[];
	res.render('topics/new.ejs', { topics: topics, errors: []});
};

// POST /quizes/topics
exports.create = function(req, res){
	let topic = models.Topic.build( 
		{ texto: req.body.topic.texto} 
	);
	topic.validate()
	.then((topic)=>{
		return topic.save();
		//.then((topic) => res.redirect('/quizes/topics/show'))
	})
	.then((topic) => res.redirect('/quizes/topics/'))
	.catch((errors) => {
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};
		res.render('/', {topic: topic, errors: errores});
	});
	
};

// GET /quizes/topics/edit/:posicion
exports.edit = function(req, res){
	models.Topic.findByPk(Number(req.params.posicion))
	.then(topic => {
		res.render('topics/edit.ejs',  {taedit:topic.texto, posicion:req.params.posicion, topic: topic, errors: []});
	})
	.catch((errors) => {
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};
		res.render('topics/edit.ejs', {topic: topic,
						 taedit: topic.texto,
						 posicion: req.params.posicion,
						 errors: errores});
	});
};

// PUT /quizes/topics/:posicion(\\d+)
exports.update = function(req, res){
	models.Topic.findByPk(Number(req.params.posicion))
	.then(topic => {
		topic.texto = req.body.topic.texto;
		return topic.validate();
	})
	.then((topic)=>{
		topic.save()
		.then((topic) => res.redirect('/quizes/topics/'))
	})
	.catch((errors) => {
		let errores=[];
		let i=0; 
		for (let prop in errors) errores[i++]={message: JSON.stringify(errors[prop])};
		res.render('topics/edit.ejs', {topic: topic,
						 taedit: topic.texto,
						 posicion: req.params.posicion,
						 errors: errores});
	});	
};

// DELETE /quizes/topics/:posicion(\\d+)
exports.destroy = function(req, res){ 
	models.Topic.destroy({where: {id: Number(req.params.posicion)}}).then( function() {
		res.redirect('/quizes/topics/');
	}).catch( function(error){ next(error)});
};




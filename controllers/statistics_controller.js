var models = require('../models/models.js');

// GET /quizes/statistics
exports.show = function(req, res){
    	var statistics={ n_preguntas: ' -- ',
			 n_comentarios: ' -- ',
    			 promedio_comentarios: ' -- ',
    			 preg_sin_com: ' -- ',
    			 preg_con_com: ' -- ',
    			 comentarios_no_pub: '--'
    			};

	models.sequelize.query('SELECT count(*) AS n FROM "Quizzes"').then(function(cuenta) {//nº de preguntas
		statistics.n_preguntas=cuenta[0].n;
		return models.sequelize.query('SELECT count(*) AS n FROM "Comments"');
	}).then(function(cuenta) {//nº de comentarios
		statistics.n_comentarios=cuenta[0].n;
		if(+statistics.n_preguntas>0) statistics.promedio_comentarios=cuenta[0].n/statistics.n_preguntas;//si es 0 el número de preguntas no está definido
		return models.sequelize.query('SELECT count(*) AS n FROM "Quizzes" WHERE "id" IN (SELECT DISTINCT "QuizId" FROM "Comments")')
	}).then(function(cuenta) {//nº de preguntas con comentario
		statistics.preg_con_com=cuenta[0].n;
		statistics.preg_sin_com=+statistics.n_preguntas-cuenta[0].n;
		return models.sequelize.query('SELECT count(*) AS n FROM "Comments" WHERE NOT "publicado"')
	}).then(function(cuenta) {//nº de comentarios no publicados				
		statistics.comentarios_no_pub=cuenta[0].n;
		res.render('statistics/show.ejs', {statistics: statistics, errors: []});		
  	}).catch(function(errors){
			var i=0; var errores=new Array();//se convierte en [] con la propiedad message por compatibilidad con layout
			for (var prop in errors) errores[i++]={message: errors[prop]};		
			res.render('statistics/show.ejs', {statistics: statistics, errors: errores});
	});

};
// GET /quizes/statisticsORM
exports.showORM = function(req, res){
    	var statistics={ n_preguntas: ' -- ',
			 n_comentarios: ' -- ',
    			 promedio_comentarios: ' -- ',
    			 preg_sin_com: ' -- ',
    			 preg_con_com: ' -- ',
    			 comentarios_no_pub: '--'
    			};
	models.Quiz.count().then(function(result){
		statistics.n_preguntas=result;
		return models.Comment.count();
	}).then(function(result){
		statistics.n_comentarios=result;
		if(+statistics.n_preguntas>0) statistics.promedio_comentarios=result/statistics.n_preguntas;//si es 0 el número de preguntas no está definido
		return models.sequelize.query('SELECT COUNT( DISTINCT ("QuizId")) as n FROM "Comments"');
	}).then(function(result){
		statistics.preg_con_com=result[0].n;
		statistics.preg_sin_com=+statistics.n_preguntas-result[0].n;
		return models.Comment.count({where: ['NOT "publicado"']});
	}).then(function(result){
		statistics.comentarios_no_pub=result;
		res.render('statistics/show.ejs', {statistics: statistics, errors: []});
	}).catch(function(errors){
			var i=0; var errores=new Array();//se convierte en [] con la propiedad message por compatibilidad con layout
			for (var prop in errors) errores[i++]={message: errors[prop]};		
			res.render('statistics/show.ejs', {statistics: statistics, errors: errores});
	});


};
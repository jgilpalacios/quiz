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

	models.sequelize.query("SELECT count(*) as n FROM `Quizzes`").then(function(cuenta) {//nº de preguntas
		statistics.n_preguntas=cuenta[0].n;
		models.sequelize.query("SELECT count(*) as n FROM `Comments`").then(function(cuenta) {//nº de comentarios
			statistics.n_comentarios=cuenta[0].n;
			if(+statistics.n_preguntas>0) statistics.promedio_comentarios=cuenta[0].n/statistics.n_preguntas;//si es 0 el número de preguntas no está definido
			models.sequelize.query("select count(*) as n from Quizzes where id in (Select distinct QuizId from Comments)").then(function(cuenta) {//nº de preguntas con comentario
				statistics.preg_con_com=cuenta[0].n;
				statistics.preg_sin_com=+statistics.n_preguntas-cuenta[0].n;
				models.sequelize.query("select count(*) as n from Comments where not publicado").then(function(cuenta) {//nº de comentarios no publicados
					statistics.comentarios_no_pub=cuenta[0].n;
					res.render('statistics/show.ejs', {statistics: statistics, errors: []});
				});
			});
		});
  	});

};
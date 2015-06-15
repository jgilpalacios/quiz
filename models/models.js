var path = require('path');

//Postgres DATABASE_URL = postgres://usr:passwd@host:port/database
//SQLite DATABSE_URL = sqlite://:@:/
var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);
var DB_name  = (url[6]||null);
var user     = (url[2]||null);
var pwd      = (url[3]||null);
var protocol = (url[1]||null);
var dialect  = (url[1]||null);
var port     = (url[5]||null);
var host     = (url[4]||null);
var storage  = process.env.DATABASE_STORAGE;

// Cargar Modelo ORM
var Sequelize = require('sequelize');

//Usar BBDD SQLite o Postgres:
var sequelize = new Sequelize(DB_name, user, pwd,
		{ dialect:  protocol,
		  protocol: protocol,
		  port:     port,
		  host:     host,
		  storage:  storage, //solo SQLite (.env)
		  omitNull: true     //solo Postgres
		}
	);

// Importar la definicion de la tabla Quiz en quiz.js
var quiz_path = path.join(__dirname, 'quiz');
var Quiz = sequelize.import(quiz_path);

// Importar la definicion de la tabla Comment en comment.js
var comment_path = path.join(__dirname, 'comment');
var Comment = sequelize.import(comment_path);

//relacion Quiz 1:n Coment
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment,{
	'constraints': true,
	'onUpdate': 'cascade',
	'onDelete': 'cascade',
	'hooks': true
}); 


exports.Quiz = Quiz; //exportar la definición de la tabla Quiz
exports.Comment = Comment; //exportar la definición de la tabla Comment
exports.sequelize = sequelize;//exportamos BD para estadísticas.

// sequelize.sinc() crea e inicializa tabla de preguntas en DB
sequelize.sync().success(function() {
	// succes(..) ejecuta el manejador una vez creada la tabla
	Quiz.count().success(function (count){
		if(count === 0) { // la tabla se incializa solo si está vacía
			Quiz.create({ pregunta: 'Capital de Italia',
				      respuesta: 'Roma',
				      tema: 'Humanidades'
				    });
			Quiz.create({ pregunta: 'Capital de Portugal',
				      respuesta: 'Lisboa',
				      tema: 'Humanidades'
				    })
			.then(function(){console.log('Base de datos inicializada')});
		};
	});
});


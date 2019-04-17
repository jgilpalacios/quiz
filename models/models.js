var path = require('path');

//Postgres DATABASE_URL = postgres://usr:passwd@host:port/database
//SQLite DATABSE_URL = sqlite://:@:/
const dotenv = require('dotenv');
dotenv.config();
//process.env.DATABASE_URL = "sqlite://:@:";
//process.env.DATABASE_STORAGE = 'quiz.sqlite';
//process.env.DATABASE_URL = "postgres://sayxlxlqysfpvl:a7d7071dadfacd3b59b865b3d06701cd3bc5ae81394d8b19fa1960246897dd4c@ec2-54-227-251-233.compute-1.amazonaws.com:5432/d4hi85ukvknq5l";

var url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);

console.log(process.env.DATABASE_URL+'--'+url);

var DB_name  = (url[6]||null);//var DB_name  = (url[6]||null);
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
//const options = { /*logging: false, operatorsAliases: false*/};
//const sequelize = new Sequelize("sqlite:quiz.sqlite", options);

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

const Op=Sequelize.Op;
exports.Op=Op;
console.log(JSON.stringify(Op));

sequelize.sync() // Syncronize DB and seed if needed
.then(() => Quiz.count())
.then((count) => {
    if (count===0) {
        return ( 
            Quiz.bulkCreate([
                { id: 1, pregunta: "Capital de Italia", respuesta: "Roma", tema: 'Humanidades' },
                { id: 2, pregunta: "Capital de Francia", respuesta: "París", tema: 'Humanidades' },
                { id: 3, pregunta: "Capital de España", respuesta: "Madrid", tema: 'Humanidades' },
                { id: 4, pregunta: "Capital de Portugal", respuesta: "Lisboa", tema: 'Humanidades' }
            ])
            .then( c => console.log(`  DB created with ${c.length} elems`))
        )
    } else {
        return console.log(`  DB exists & has ${count} elems`);
    }
})
.catch( err => console.log(`   ${err}`));
// sequelize.sinc() crea e inicializa tabla de preguntas en DB
/*sequelize.sync().success(function() {
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
});*/


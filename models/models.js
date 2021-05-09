let path = require('path');

//Postgres DATABASE_URL = postgres://usr:passwd@host:port/database
//SQLite DATABSE_URL = sqlite://:@:/
const dotenv = require('dotenv');
dotenv.config();
//process.env.DATABASE_URL = "sqlite://:@:";
//process.env.DATABASE_STORAGE = 'quiz.sqlite';
//process.env.DATABASE_URL = "postgres://sayxlxlqysfpvl:a7d7071dadfacd3b59b865b3d06701cd3bc5ae81394d8b19fa1960246897dd4c@ec2-54-227-251-233.compute-1.amazonaws.com:5432/d4hi85ukvknq5l";

let url = process.env.DATABASE_URL.match(/(.*)\:\/\/(.*?)\:(.*)@(.*)\:(.*)\/(.*)/);

console.log(process.env.DATABASE_URL+'--'+url);

let DB_name  = (url[6]||null);//let DB_name  = (url[6]||null);
let user     = (url[2]||null);
let pwd      = (url[3]||null);
let protocol = (url[1]||null);
let dialect  = (url[1]||null);
let port     = (url[5]||null);
let host     = (url[4]||null);
let storage  = process.env.DATABASE_STORAGE;

let tildeBD='`';//mysql para entrecomillar los nombres de tablas, campos etc. en raw consultas
if(protocol==='postgres'||protocol==='sqlite') tildeBD='"';
console.log(`protocolo: ${protocol} se usa para raw la tilde:${tildeBD}`);
// Cargar Modelo ORM
let Sequelize = require('sequelize');

//Usar BBDD SQLite o Postgres:
let sequelize = new Sequelize(DB_name, user, pwd,
		{ dialect:  protocol,
          dialectOptions: {
             ssl: true
          },
		  protocol: protocol,
		  port:     port,
		  host:     host,
		  storage:  storage, //solo SQLite (.env)
		  omitNull: true,     //solo Postgres
		  logging: false //no muestra en consola las consultas
		}
	);
//const options = { /*logging: false, operatorsAliases: false*/};
//const sequelize = new Sequelize("sqlite:quiz.sqlite", options);

// Importar la definicion de la tabla Quiz en quiz.js
let quiz_path = path.join(__dirname, 'quiz');
let Quiz = sequelize.import(quiz_path);

// Importar la definicion de la tabla Comment en comment.js
let comment_path = path.join(__dirname, 'comment');
let Comment = sequelize.import(comment_path);

// Importar la definicion de la tabla Topic en topic.js
let topic_path = path.join(__dirname, 'topic');
let Topic = sequelize.import(topic_path);

// Importar la definicion de la tabla User en user.js
let user_path = path.join(__dirname, 'user');
let User = sequelize.import(user_path);

//relacion Quiz 1:n Coment
Comment.belongsTo(Quiz);
Quiz.hasMany(Comment,{
	'constraints': true,
	'onUpdate': 'cascade',
	'onDelete': 'cascade',
	'hooks': true
}); 


exports.tildeBD=tildeBD; //para entrecomillar nombres de campos tablas en bd dependiendo del protocolo en raw consultas
exports.Quiz = Quiz; //exportar la definición de la tabla Quiz
exports.Comment = Comment; //exportar la definición de la tabla Comment
exports.Topic = Topic; //exportar la definición de la tabla Topic
exports.User = User; //exportar la definición de la tabla Topic
exports.sequelize = sequelize;//exportamos BD para estadísticas.

const Op=Sequelize.Op;
exports.Op=Op; //exportar operadores parametrizados

sequelize.sync() // Syncronize DB and seed if needed
.then(() => Quiz.count()) //Creamos la tabla de preguntas iniciales
.then((count) => {
    if (count===0) {
        return ( 
            Quiz.bulkCreate([
                { id: 1, pregunta: "Capital de Italia", respuesta: "Roma", tema: 'Humanidades' },
                { id: 2, pregunta: "Capital de Francia", respuesta: "París", tema: 'Humanidades' },
                { id: 3, pregunta: "Capital de España", respuesta: "Madrid", tema: 'Humanidades' },
                { id: 4, pregunta: "Capital de Portugal", respuesta: "Lisboa", tema: 'Humanidades' }
            ])
            .then( c => console.log(`  DB Quiz created with ${c.length} elems`))
        )
    } else {
        return console.log(`  DB Quiz exists & has ${count} elems`);
    }
})
.then(() => Topic.count()) //Creamos la tabla de temas inciales
.then((count) => {
    if (count===0) {
        return ( 
            Topic.bulkCreate([
                { id: 1, texto: "Ciencia" },
                { id: 2, texto: "Humanidades" },
                { id: 3, texto: "Ocio" },
                { id: 4, texto: "Otro" },
                { id: 5, texto: "Tecnología" }
            ])
            .then( c => console.log(`  DB Topic created with ${c.length} elems`))
        )
    } else {
        return console.log(`  DB Topic exists & has ${count} elems`);
    }
})
.then(() => User.count()) //Creamos la tabla de usuarios inciales
.then((count) => {
    if (count===0) {
        return ( 
            User.bulkCreate([
                {id: 1, username: 'admin', password: '1234'},
                {id: 2, username: 'pepe',  password: '5678'}
            ])
            .then( c => console.log(`  DB User created with ${c.length} elems`))
        )
    } else {
        return console.log(`  DB User exists & has ${count} elems`);
    }
})
.catch( err => console.log(`   ${err}`));



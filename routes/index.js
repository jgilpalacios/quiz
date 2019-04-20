let express = require('express');
let router = express.Router();

let quizController = require('../controllers/quiz_controller');
let commentController = require('../controllers/comment_controller');
let sessionController = require('../controllers/session_controller');
let statisticsController =require('../controllers/statistics_controller');
let topicController = require('../controllers/topic_controller');

/* Página de entrada (home page) */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: [] });
});

//Autoload de comandos con :quizId
router.param('quizId', quizController.load); //autoload :quizId
//router.param('comentId', commentController.load); //autoload :commentId

// Definición de rutas de estadísticas
router.get('/quizes/statistics',        statisticsController.show); 
router.get('/quizes/statisticsORM',        statisticsController.showORM);  

// Definición de rutas de sesion
router.get('/login', sessionController.new); 		// formularioo login
router.post('/login', sessionController.create); 	// crear sesión
router.get('/logout', sessionController.destroy);	// destruir sesión

// Definición de rutas de /quizes
router.get('/quizes',                       quizController.index);
router.get('/quizes/:quizId(\\d+)',         quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',  quizController.answer);
router.get('/quizes/new',                   sessionController.loginRequired, quizController.new);
router.post('/quizes/create',               sessionController.loginRequired, quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',    sessionController.loginRequired, quizController.edit);
router.put('/quizes/:quizId(\\d+)',         sessionController.loginRequired, quizController.update);
router.delete('/quizes/:quizId(\\d+)',      sessionController.loginRequired, quizController.destroy);

// Definción de rutas de comentarios
router.get('/quizes/:quizId(\\d+)/comments/new', 			commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',    			commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/edit/:posicion(\\d+)', sessionController.loginRequired, commentController.edit);
router.put('/quizes/:quizId(\\d+)/comments/:posicion(\\d+)', sessionController.loginRequired, commentController.update);
router.delete('/quizes/:quizId(\\d+)/comments/:posicion(\\d+)', sessionController.loginRequired, commentController.destroy);
router.put('/quizes/:quizId(\\d+)/comments/:posicion(\\d+)/publish',    sessionController.loginRequired, commentController.publish);
router.put('/quizes/:quizId(\\d+)/comments/:posicion(\\d+)/unpublish',    sessionController.loginRequired, commentController.unpublish);

// Definición de las rutas de temas
router.get('/quizes/topics/', sessionController.loginRequired, topicController.show);
router.get('/quizes/topics/new', sessionController.loginRequired, topicController.new);
router.post('/quizes/topics/create', sessionController.loginRequired, topicController.create);
router.get('/quizes/topics/edit/:posicion(\\d+)', sessionController.loginRequired, topicController.edit);
router.put('/quizes/topics/:posicion(\\d+)', sessionController.loginRequired, topicController.update);
router.delete('/quizes/topics/:posicion(\\d+)', sessionController.loginRequired, topicController.destroy);

router.get('/author', function(req, res) {
  res.render('author', { title: 'Quiz', errors: [] });
});

module.exports = router;

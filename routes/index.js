var express = require('express');
var router = express.Router();

var quizController = require('../controllers/quiz_controller');
var commentController = require('../controllers/comment_controller');
var sessionController = require('../controllers/session_controller');

/* Página de entrada (home page) */
router.get('/', function(req, res) {
  res.render('index', { title: 'Quiz', errors: [] });
});

//Autoload de comandos con :quizId
router.param('quizId', quizController.load); //autoload :quizId

// Definición de rutas de sesion
router.get('/login', sessionController.new); 		// formularioo login
router.post('/login', sessionController.create); 	// crear sesión
router.get('/logout', sessionController.destroy);	// destruir sesión

router.get('/quizes',                       quizController.index);
router.get('/quizes/:quizId(\\d+)',         quizController.show);
router.get('/quizes/:quizId(\\d+)/answer',  quizController.answer);
router.get('/quizes/new',                   quizController.new);
router.post('/quizes/create',               quizController.create);
router.get('/quizes/:quizId(\\d+)/edit',    quizController.edit);
router.put('/quizes/:quizId(\\d+)',         quizController.update);
router.delete('/quizes/:quizId(\\d+)',      quizController.destroy);

router.get('/quizes/:quizId(\\d+)/comments/new', 			commentController.new);
router.post('/quizes/:quizId(\\d+)/comments',    			commentController.create);
router.get('/quizes/:quizId(\\d+)/comments/edit/:posicion(\\d+)',    	commentController.edit);
router.put('/quizes/:quizId(\\d+)/comments/:posicion(\\d+)',        	commentController.update);
router.delete('/quizes/:quizId(\\d+)/comments/:posicion(\\d+)',          commentController.destroy);


router.get('/author', function(req, res) {
  res.render('author', { title: 'Quiz', errors: [] });
});

module.exports = router;

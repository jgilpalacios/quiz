// Definicion del modelo User

module.exports = function(sequelize, DataTypes){
	return sequelize.define('User', 
		{ 	username: {
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Falta nombre de usuario."}}
			},
			password: {
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Se requier contraseña."}}
			}
		});
}

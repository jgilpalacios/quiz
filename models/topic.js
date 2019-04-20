// Definicion del modelo Topic

module.exports = function(sequelize, DataTypes){
	return sequelize.define('Topic', 
		{ 	texto: {
				type: DataTypes.STRING,
				validate: { notEmpty: {msg: "-> Falta tema."}}
			}
		});
}

// Module =======================================================================================================================================================================================================================>
const Token = (sequelize, Sequelize) => {
  const Token = sequelize.define("tokens", {
    tokenId: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    token: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  });

  return Token;
};

export default Token;
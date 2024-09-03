// Module =======================================================================================================================================================================================================================>
const User = (sequelize, Sequelize) => {
  const User = sequelize.define("users", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: Sequelize.UUID,
      allowNull: false
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    isActivated: {
      type: Sequelize.STRING,
      defaultValue: false,
      allowNull: false
    },
    isBanned: {
      type: Sequelize.STRING,
      defaultValue: false,
      allowNull: false
    }
  });

  return User;
};

export default User;
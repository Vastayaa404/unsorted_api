// Import all dependencies ======================================================================================================================================================================================================>
import createRoleModel from './role.model.mjs';
import createTokenModel from './token.model.mjs';
import createUserModel from './user.model.mjs';
import Sequelize from 'sequelize';
// import 'dotenv/config';

// Module =======================================================================================================================================================================================================================>
const sequelize = new Sequelize(
  process.env.DB_NAME,//"auth_db",//process.env.DB_NAME,
  process.env.DB_USER,//"postgres",//process.env.DB_USER,
  process.env.DB_PASSWORD,//"postgres",//process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,//"localhost",//process.env.DB_HOST,
    dialect: 'postgres',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.user = createUserModel(sequelize, Sequelize);
db.role = createRoleModel(sequelize, Sequelize);
db.token = createTokenModel(sequelize, Sequelize);

db.user.belongsToMany(db.role, { through: 'user_roles' });
db.user.hasMany(db.token);

export default db;
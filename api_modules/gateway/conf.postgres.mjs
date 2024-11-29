// Import all dependencies ======================================================================================================================================================================================================>
import 'dotenv/config';
import createRoleModel from './conf.role.model.mjs';
import createTokenModel from './conf.token.model.mjs';
import createUserModel from './conf.user.model.mjs';
import Sequelize from 'sequelize';

// Module =======================================================================================================================================================================================================================>
const sequelize = new Sequelize(
  "auth_db",//process.env.DB_NAME,
  "postgres",//process.env.DB_USER,
  "postgres",//process.env.DB_PASSWORD,
  {
    host: "localhost",//process.env.DB_HOST,
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
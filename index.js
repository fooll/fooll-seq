const fs = require('fs');
const path = require('path');
const Foola = require('foola');
const Sequelize = require('sequelize');

class FoollSeq extends Foola {

  constructor(dirname, server) {
    super(dirname, server);
    this.loadModels();
  }

  loadDBConfig() {
    var rcPath = path.resolve('.sequelizerc');
    var rc = require(rcPath);
    var configText = fs.readFileSync(rc.config);
    var config = JSON.parse(configText);
    return config[this.server.env];
  }

  loadModels() {
    var db = this.loadDBConfig();
    var sequelize = new Sequelize(db.database, db.username, db.password, db);
    var models = {};
    var modelsFolderPath = path.resolve(this.dirname, 'models');
    var modelsDirFiles = fs.readdirSync(modelsFolderPath);
    modelsDirFiles.forEach(function (modelBase) {
      var modelPath = path.resolve(modelsFolderPath, modelBase);
      var model = sequelize.import(modelPath);
      var modelName = path.parse(modelBase).name;
      models[modelName] = model;
    });
    this.models = models;
  }

  static coordinateDB(server) {
    var db = {};

    for (var moduleName in server.modules) {
      var appModule = server.modules[moduleName];
      Object.assign(db, appModule.models);
    }

    for (var moduleName in server.modules) {
      for (var modelName in server.modules[moduleName].models) {
        if (server.modules[moduleName].models[modelName].associate) {
          server.modules[moduleName].models[modelName].associate(db);
        }
      }
    }

  }
}

module.exports = FoollSeq;
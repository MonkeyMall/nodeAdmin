/*
 * 侃言的模型类
 */
var mongoose = require('mongoose');
//引入对应schemas的表结构
var ridiculeSchema = require('../schemas/ridicule');
//创建模型
module.exports = mongoose.model('Ridicule',ridiculeSchema);

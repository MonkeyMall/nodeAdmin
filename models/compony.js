/*
 * user的模型类
 */
var mongoose = require('mongoose');
//引入对应schemas的表结构
var componySchema = require('../schemas/compony');
//创建模型
module.exports = mongoose.model('Compony',componySchema);

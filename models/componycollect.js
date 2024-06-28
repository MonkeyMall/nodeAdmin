/*
 * 用户收藏公司的模型类
 */
var mongoose = require('mongoose');
//引入对应schemas的表结构
var componycollectSchema = require('../schemas/componycollect');
//创建模型
module.exports = mongoose.model('Componycollect',componycollectSchema);

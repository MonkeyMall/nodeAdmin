/*
 * 公司评论的模型类
 */
var mongoose = require('mongoose');
//引入对应schemas的表结构
var commentsComponySchema = require('../schemas/commentsCompony');
//创建模型
module.exports = mongoose.model('CommentsCompony',commentsComponySchema);

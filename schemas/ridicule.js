/*
 * 侃言的数据库的结构
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//侃言的表结构
module.exports = new mongoose.Schema ({
  title: String,
  cons: String,
  cover: String,
  
})

/*
 * 公司的数据库的结构
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//视频的表结构
module.exports = new mongoose.Schema ({
  name: String,
  logo: String,
  industry: String,
  scale: String,
  accumulation: String,
  insurance: String,
  welfare: String,
  address: String,
})

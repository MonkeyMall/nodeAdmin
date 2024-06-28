/*
 * 用户收藏公司的表结构
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
module.exports = new mongoose.Schema ({
	 userId:{
    type: mongoose.Schema.Types.ObjectId,//关联字段
    ref:'Wechatusers'//引用另一张表
	 },
	 componyId:{
      type: mongoose.Schema.Types.ObjectId,//关联字段
      ref:'Compony'//引用另一张表
	 },
	 startTime: {
		 type:Date,
		 default:new Date()
	 }
})

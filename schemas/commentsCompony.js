/*
 * 公司评论的表结构
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//分类的表结构
module.exports = new mongoose.Schema ({
	componyId: {//公司的ID
		 type: mongoose.Schema.Types.ObjectId,//关联字段
		 ref:'Compony'//引用另一张表
	},
	userId: {//评论人
		 type: mongoose.Schema.Types.ObjectId,//关联字段
		 ref:'Wechatusers'//默认值
	},
	componyContents: {//评论的内容
		type: String,
		default:''//默认值
	},
	startTime: Number
})

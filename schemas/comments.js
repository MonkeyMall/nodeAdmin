/*
 * 评论的表结构
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//分类的表结构
module.exports = new mongoose.Schema ({
	contentId: {//评论文章的ID
		 type: mongoose.Schema.Types.ObjectId,//关联字段
		 ref:'Content'//引用另一张表
	},

	userId: {//评论人
		 type: mongoose.Schema.Types.ObjectId,//关联字段
		 ref:'User'//默认值
	},
  creatUserId: {//被评论人
    type: mongoose.Schema.Types.ObjectId,//关联字段
    ref:'User'//默认值
 },
	commentContents: {//评论的内容
		type: String,
		default:''//默认值
	},
	startTime: Number
})

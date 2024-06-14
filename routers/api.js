//加载express模块
var https = require('https');
var express = require('express');
var router = express.Router();//创建路由
// var WXBizDataCrypt = require('../public/js/WXBizDataCrypt.js');//解密获取微信小程序的用户信息
//引入模型类,操作数据库
var User = require('../models/users');
var Category = require('../models/category');
var Content = require('../models/contents');
var Comments = require('../models/comment');
var Compony = require('../models/compony');
var Wechatusers = require('../models/wechatusers');
var VideoList = require('../models/videoList');
var Pushsource = require('../models/pushsource');
var Banner = require('../models/banner');
var Source = require('../models/source');
var Plug = require('../models/plug');
//统一一下ajax返回客户端的格式
var responseData;
router.use(function(req,res,next){
	responseData = {
		code:500,//错误码
		message:''//错误信息
	}
	next();
})
/*
 *首页获取数据库的数据
 *
 */
var getIp = function(req) {  
    var ip = req.headers['x-real-ip'] ||  
        req.headers['x-forwarded-for'] ||  
        req.socket.remoteAddress || '';  
    if(ip.split(',').length>0){  
        ip = ip.split(',')[0];  
    }  
    return ip;  
};  
/*
 * 登陆逻辑
 */
router.post('/user/login',function(req,res,next){
	var username =  req.body.username;
	var password = req.body.password;
  console.log('执行了', username)
	if(username == ''){
		responseData.code = 5;
		responseData.message = '用户名不能为空';
		res.json(responseData);
		return;
	}
	if(password == ''){
		responseData.code = 6;
		responseData.message = '密码不能为空';
		res.json(responseData);
		return;
	}
	//查找数据库中是否有相似的用户名
	User.findOne({
		username:username,
		password:password
	}).then(function(userInfo){
		if(!userInfo){
			responseData.code = 7;
			responseData.message = '用户名不存在,请先注册';
			res.json(responseData);
			return;
		}
		responseData.code = 200;
		responseData.message = '登陆成功';
		responseData.data = {
			username : userInfo.username
		}
    res.cookie("account", username);
    // res.cookie('asd', userInfo.username);
    // 设置cookies 返回给客户端
		req.cookies.set('userInfo',JSON.stringify({
			_id : userInfo._id,
			username : userInfo.username
		}));
		res.json(responseData);
		return;
	})
})
/*
 *退出接口
 */
router.post('/user/exit',function(req,res,next){
	res.clearCookie('account')
	//设置cookies 返回给客户端
	req.cookies.set('userInfo',null);
	res.json(responseData);
	return;
})
/*
 * 创建公司接口
 */
router.post('/company/add',function(req,res,next){
  var name = req.body.name || '公司名' // 公司名
  var logo = req.body.logo || 'logo' // logo
  var industry = req.body.industry || '行业'  // 行业
  var scale = req.body.scale || '规模' // 规模
  var accumulation = req.body.accumulation || '公积金'  // 公积金
  var insurance = req.body.insurance || '五险' // 五险
  var welfare = req.body.welfare || '福利'  // 福利
  var address = req.body.address || '位置'  // 位置
  console.log('创建公司',req.body)
	
  // 查找数据库是否有同名的用户 两种方法其实一个意思
	Compony.findOne({
		name:name
	}).then(function(componyInfo){
    console.log('查找公司',res)
		if(componyInfo){
     console.log('查找公司1')
			responseData.code = 500;
			responseData.message = '不要重复添加！';
			res.json(responseData);
			return;
		}
		var compony = new Compony({
      name: name,
      logo: logo,
      industry: industry,
      scale: scale,
      accumulation: accumulation,
      insurance: insurance,
      welfare: welfare,
      address: address,
      startTime:Number(Date.parse(new Date()))
    });
    console.log('查找公司2')
		return compony.save().then(function(componyInfo){
      responseData.code = 200;
      responseData.message = '添加成功';
      res.json(responseData);
  });
	}).then(function(res){
    console.log('查找公司3')
		responseData.code = 200;
		responseData.message = '添加成功';
		res.json(responseData);
	})
})
/*
 * 编辑公司接口
 */
router.post('/company/edit',function(req,res,next){
  var id = req.body.id || ''
  var name = req.body.name || '' // 公司名
  var logo = req.body.logo || '' // logo
  var industry = req.body.industry || ''  // 行业
  var scale = req.body.scale || '' // 规模
  var accumulation = req.body.accumulation || ''  // 公积金
  var insurance = req.body.insurance || '' // 五险
  var welfare = req.body.welfare || ''  // 福利
  var address = req.body.address || ''  // 位置
  console.log('创建公司',req.body)
	
  // 查找数据库是否有同名的用户 两种方法其实一个意思
	Compony.findById({
		_id:id
	}).then(function(componyInfo){
		if(!componyInfo){
			responseData.code = 500;
			responseData.message = '没有要编辑的数据！';
			res.json(responseData);
			return;
		}
		return Compony.update({
      _id:id
    }, {
      name: name,
      logo: logo,
      industry: industry,
      scale: scale,
      accumulation: accumulation,
      insurance: insurance,
      welfare: welfare,
      address: address,
      startTime:Number(Date.parse(new Date()))
    }).then(function(componyInfo){
      responseData.code = 200;
      responseData.message = '修改成功';
      res.json(responseData);
    })
	})
})
/*
 * 公司列表
 */
router.get('/company/list',function(req,res,next){
	console.log(req.query)
    var name = req.query.name || '';
    var page = Number(req.query.page || 1);
    var limte = Number(req.query.limte || 10);
    var pages = 0;
    const searchObj = {}
    if (name) {
      searchObj.name = name
    }
    //从数据库中获取网站的分类名称
    // Category.find().then(function(categories){
        //查询数据库中的数据的条数
        Compony.count().then(function(count) {
            pages = Math.ceil(count / limte);//客户端应该显示的总页数
            page = Math.min(page, pages);//page取值不能超过pages
            page = Math.max(page, 1);//page取值不能小于1
            var skip = (page - 1) * limte;
            //sort()排序  -1 降序 1 升序
            //populate('category')  填充关联内容的字段的具体内容(关联字段在指定另一张表中的具体内容)
            Compony.find(searchObj).sort({_id: -1}).limit(limte).skip(skip).then(function (contents) {
                responseData.code = 200;
                responseData.message = "列表获取成功";
                responseData.count = count;
                responseData.data = contents;
                res.json(responseData);
                return;
            })
        })
    // })
})
/*
 * 侃言创建
 */
router.post('/ridicule/add',function(req,res,next){
  var category = req.body.category || 1; //文章的分类
	var title = req.body.title || ''; //文章的标题
	var posted = req.body.posted || false;//是否发布
	var description = req.body.description; //文章的简介
	var contents = req.body.contents; //文章的内容
	console.log('侃言提交的数据',req.body)
	// if(!category){//表示没有这条数据
	// 	res.render('admin/error',{
	// 		userInfo:req.userInfo,
	// 		errorMessage:"文章分类不能为空!"
	// 	})
	// 	return Promise.reject();
	// }
	// if(!title){//表示没有这条数据
	// 	res.render('admin/error',{
	// 		userInfo:req.userInfo,
	// 		errorMessage:"文章标题不能为空!"
	// 	})
	// 	return Promise.reject();
	// }
	// if(!description){//表示没有这条数据
	// 	res.render('admin/error',{
	// 		userInfo:req.userInfo,
	// 		errorMessage:"文章简介不能为空!"
	// 	})
	// 	return Promise.reject();
	// }
	// if(!contents){//表示没有这条数据
	// 	res.render('admin/error',{
	// 		userInfo:req.userInfo,
	// 		errorMessage:"文章内容不能为空!"
	// 	})
	// 	return Promise.reject();
	// }
	//保存侃言内容到数据库
  console.log('0', title)
  Content.findOne({
		title:title
	}).then(function(contentInfo){
    if(contentInfo){
       responseData.code = 500;
       responseData.message = '不要重复添加！';
       res.json(responseData);
       return;
     }
     var content = new Content({
      category:category,
      title:title,
      posted:posted,
      description:description,
      content:contents,
      startTime:Date.parse(new Date())
    });
    return content.save().then(function(contents){
      console.log('2')
      responseData.code = 200;
      responseData.message = '侃言保存成功';
      res.json(responseData);
    });
  }).catch(function(err){
    console.log('3', err)
		responseData.code = 500;
		responseData.message = err;
		res.json(responseData);
    return
	})
})
/*
 * 侃言列表
 */
router.get('/ridicule/list',function(req,res,next){
  var page = Number(req.query.page || 1);
  var limte = Number(req.query.limte || 10);
  var pages = 0;
  // Category.find().then(function(categories){
      //查询数据库中的数据的条数
      Content.count().then(function(count) {
          pages = Math.ceil(count / limte);//客户端应该显示的总页数
          page = Math.min(page, pages);//page取值不能超过pages
          page = Math.max(page, 1);//page取值不能小于1
          var skip = (page - 1) * limte;
          //sort()排序  -1 降序 1 升序
          //populate('category')  填充关联内容的字段的具体内容(关联字段在指定另一张表中的具体内容)
          Content.find().sort({_id: -1}).limit(limte).skip(skip).then(function (contents) {
              responseData.code = 200;
              responseData.message = "列表获取成功";
              responseData.count = count;
              responseData.data = contents;
              res.json(responseData);
              return;
          })
      })
  // })
})
/*
 * 侃言内容的评论
 */
router.post('/comment/add',function(req,res,next){
	var contentId = req.body.contentId;//评论侃言的ID
	var userId = req.userInfo;//评论人的ID
	var commentContents =  req.body.commentContents;//评论内容
	if(!contentId){
		responseData.code = 500;
		responseData.message = "没有要评论的侃言";
		res.json(responseData);
		return;
	}
	// if(!userId){
	// 	responseData.code = 500;
	// 	responseData.message = "对不起,您还没有登陆";
	// 	res.json(responseData);
	// 	return;
	// }
	if(!commentContents){
		responseData.code = 500;
		responseData.message = "对不起,您提交的评论内容不能为空";
		res.json(responseData);
		return;
	}
	//保存评论内容到数据库中
	var comment = new Comments({
		contentId:contentId,
		userId:userId,
		commentContents:commentContents,
		startTime:Number(Date.parse(new Date()))
	});
	return comment.save().then(function(newComment){
		Comments.find().populate('userId').then(function(comments){
			responseData.code = 200;
			responseData.message = "您的评论保存成功了!!!";
			responseData.data = comments;
			res.json(responseData);
		})
	})
	return;
})
/*
 * 侃言内容的评论列表
 */
router.post('/comment/commentList',function(req,res,next){
  var page = Number(req.query.page || 1);//req.query.page 获取?后面的页数
	var limte = 10;
	var pages = 0;
	var contentId = req.body.contentId;//评论文章的ID

  Comments.count().then(function(count){
    pages = Math.ceil(count / limte);//客户端应该显示的总页数
		page = Math.min(page,pages);//page取值不能超过pages
		page = Math.max(page,1);//page取值不能小于1
		var skip = (page - 1) * limte;
    //sort()排序  -1 降序 1 升序
    Comments.find({
      contentId:contentId
    }).sort({_id: -1}).limit(limte).skip(skip).populate('contentId').populate('userId').then(function(comments){
      console.log('comments', comments)
      responseData.code = 200;
      responseData.message = "侃言评论获取成功";
      responseData.data = comments;
      // responseData.userInfo = req.userInfo;
      responseData.page = page
      responseData.count = count
      responseData.pages = pages
      responseData.limte = limte
      res.json(responseData);
      return;
    })

  })


})
module.exports = router;
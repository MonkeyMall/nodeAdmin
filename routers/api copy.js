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
// --------------新版需要的接口
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
// 管理后台
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
    var page = Number(req.query.page || 1);
    var limte = Number(req.query.limte || 10);
    var pages = 0;
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
            Compony.find().sort({_id: -1}).limit(limte).skip(skip).then(function (contents) {
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
// ------------新版需要的接口结束
router.post('/articlesList',function(req,res,next){
	var page =  req.body.page;
	var limte = 10;
	var pages = 0;
	var comments;
	var clientIp = getIp(req);  
	//从数据库中获取网站的分类名称
	// Category.find({
    //     posted: "true"
	// }).then(function(categories){
		// console.log(categories)
		//查询数据库中的数据的条数
		Content.find({
			    posted: "true"
			}).count().then(function(count) {
			comments = {
				"count" : count
			}
			responseData.code = 24;
			responseData.message = "数据获取成功!";
			responseData.data = comments;
			responseData.ip = clientIp;
			res.json(responseData);
			return;
		})
	// })
})
/*
 *获取分类首页下的数据的条数
 *
 */
router.post('/categoryList/articlesList',function(req,res,next){
	var id = req.body.id || "";//当前点击的分类的ID
	//从数据库中获取网站的分类名称
	Category.find().then(function(categories){
		//查询数据库中的数据的条数
		Content.find(
			{
				category:id//分类的ID
            },
			{
                posted:true//是否发布
			}
		).count().then(function(count) {
			comments = {
				"count" : count
			}
			responseData.code = 24;
			responseData.message = "数据获取成功!";
			responseData.data = comments;
			res.json(responseData);
			return;

		})
	})
})
/*
 * 用户注册逻辑
 */
router.post('/user/register',function(req,res,next){
	var username =  req.body.username;
	var password = req.body.password;
	var repassword = req.body.repassword;
	var time = req.body.time;
	console.log("注册的时间：",time)
	console.log(username)
	console.log(password)
	console.log(repassword)
	if(username == ''){
		responseData.code = 01;
		responseData.message = '用户名不能为空';
		res.json(responseData);
		return;
	}
    if(username.length > 10){
        responseData.code = 02;
        responseData.message = '用户名不能超过10个字符';
        res.json(responseData);
        return;
    }
    if(password.length < 6){
        responseData.code = 03;
        responseData.message = '密码不能少于6位';
        res.json(responseData);
        return;
    }
	if(password == ''){
		responseData.code = 04;
		responseData.message = '密码不能为空';
		res.json(responseData);
		return;
	}
	if(repassword != password){
		responseData.code = 05;
		responseData.message = '两次输入的密码不一致';
		res.json(responseData);
		return;
	}
	// 查找数据库是否有同名的用户 两种方法其实一个意思
	User.findOne({
		username:username
	}).then(function(userInfo){
		if(userInfo){//有的话就标示数据库里面有这个用户
			responseData.code = 4;
			responseData.message = '用户名重复';
			res.json(responseData);
			return;
		}
		//保存用户注册的账号到数据库中
		var user = new User({
			username:username,
			password:password,
            time:time
		});
		return user.save();
	}).then(function(newUserInfo){
		responseData.code = 8;
		responseData.message = '注册成功';
		res.json(responseData);
	})
})
/*
 * 用户注册 -- 小程序
 */
router.get('/user/WeChat/register',function(req,res,next){
	var header = req.query.header;
	var username = req.query.username;
    var appid = req.query.appid;
	var secret = req.query.secret;
	var jscode = req.query.jscode;
	var openid;
    https.get('https://api.weixin.qq.com/sns/jscode2session?appid='+appid+'&secret='+secret+'&js_code='+jscode+'&grant_type=authorization_code', function(wxRes) {
        wxRes.on('data', function(d) {
            openid = JSON.parse(d.toString()).openid
			console.log(openid)
            // 查找数据库是否有同名的用户 两种方法其实一个意思
            Wechatusers.findOne({
                openid:openid
            }).then(function(userInfo){
                if(userInfo){//有的话就标示数据库里面有这个用户
                    responseData.code = 4;
                    responseData.message = '用户名重复';
                    responseData.data = userInfo;
                    console.log("00000")
					console.log(responseData)
                    res.json(responseData);
                    return;
                }
                console.log("别走了")
                //保存用户注册的账号到数据库中
                var wechatusers = new Wechatusers({
                    openid:openid,
                    header:header,
                    username:username
                });
                return wechatusers.save().then(function(userInfo){
                    responseData.code = 38;
                    responseData.message = '注册成功';
                    responseData.data = userInfo;
                    res.json(responseData);
                })
            })
		});
	}).on('error', function(e) {
        console.error(e);
	});

})
// 查看是否登陆
router.get('/isLogin',function(req,res,next){
	if(req.headers.cookie.indexOf(';') > 0) {
        var cookieArray = req.headers.cookie.split(';');
        var usernameArray = cookieArray[cookieArray.length - 2].split('=');
        var username = usernameArray[usernameArray.length - 1]
        //查找数据库中是否有相似的用户名
        User.findOne({
            username:username
        }).then(function(userInfo){
			if(userInfo.username) {
                responseData.code = 24;
                responseData.message = "您当前已经登陆成功!";
                responseData.data = {
                    username: userInfo.username,
                    isAdmin: userInfo.isAdmin,
                    vip:userInfo.vip
                }
                res.json(responseData);
			}
		}).catch(function(){
            responseData.code = 1001;
            responseData.message = "请您先登陆注册";
            res.json(responseData);
		})
	} else {
        responseData.code = 1001;
        responseData.message = "请您先登陆注册";
        res.json(responseData);
	}
    return;
})

/*
 * 用户评论   new Comment();
 */
//前端评论提交的接口评论
router.post('/comment/commit',function(req,res,next){
	var contentId = req.body.contentId;//评论文章的ID
	var userId = req.userInfo;//评论人的ID
	var commentContents =  req.body.commentContents;//评论内容
	if(!contentId){
		responseData.code = 20;
		responseData.message = "没有要评论的文章";
		res.json(responseData);
		return;
	}
	if(!userId){
		responseData.code = 21;
		responseData.message = "对不起,您还没有登陆";
		res.json(responseData);
		return;
	}
	if(!commentContents){
		responseData.code = 22;
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
			responseData.code = 23;
			responseData.message = "您的评论保存成功了!!!";
			responseData.data = comments;
			res.json(responseData);
			res.render('main/contentInfo', {
				categories:categories,
				userInfo: req.userInfo,
				content:content,
				comments:comments
			});
		})
	})
	return;
})
/*获取该文章下面的评论
 *
 * 该文章的ID
 *
 * 这个接口在后面的时候再去使用
 *
 */
router.post('/comments/commentList',function(req,res,next){
	var contentId = req.body.contentId;//评论文章的ID
	Comments.find({
		contentId:contentId
	}).then(function(comments){
		responseData.code = 24;
		responseData.message = "文章品论获取成功";
		responseData.data = comments;
		res.json(responseData);
		return;
	})
})
/*
 *
 *热门文章接口
 *
 */
router.post('/content/hotContents',function(req,res,next){
	var limte = 10;
	Content.find().sort({views: -1}).limit(limte).populate('category').then(function(hotContents){
    console.log('获取成功！！')
		responseData.code = 30;
		responseData.message = "热门文章获取成功";
		responseData.data = hotContents;
		res.json(responseData);
		return;
	})
})
// 文章内容保存post的路由(添加)
router.post('/content/add',function(req,res,next) {
	var category = req.body.category; //文章的分类
	console.log(category)
	var title = req.body.title; //文章的标题
	var posted = req.body.posted;//是否发布
	var description = req.body.description; //文章的简介
	var contents = req.body.contents; //文章的内容
	console.log('文章提交的数据',req.body)
	if(!category){//表示没有这条数据
		res.render('admin/error',{
			userInfo:req.userInfo,
			errorMessage:"文章分类不能为空!"
		})
		return Promise.reject();
	}
	if(!title){//表示没有这条数据
		res.render('admin/error',{
			userInfo:req.userInfo,
			errorMessage:"文章标题不能为空!"
		})
		return Promise.reject();
	}
	if(!description){//表示没有这条数据
		res.render('admin/error',{
			userInfo:req.userInfo,
			errorMessage:"文章简介不能为空!"
		})
		return Promise.reject();
	}
	if(!contents){//表示没有这条数据
		res.render('admin/error',{
			userInfo:req.userInfo,
			errorMessage:"文章内容不能为空!"
		})
		return Promise.reject();
	}
	//保存文章内容到数据库
	var content = new Content({
		category:category,
		title:title,
        posted:posted,
		description:description,
		content:contents,
		startTime:Date.parse(new Date())
	});
	return content.save().then(function(contents){
		// res.render('admin/success',{
		// 	userInfo:req.userInfo,
		// 	successMessage:"文章添加成功!",
		// 	url:"/admin/content"
		// })
		responseData.code = 35;
		responseData.message = '文章保存成功';
		res.json(responseData);
		return;
	});
})
//获取当前预览文章的内容
router.get('/content/nowContentInfo',function(req,res,next){
	Content.find({
		_id:req.query.contentId
	}).then(function(hotContents){
		responseData.code = 36;
		responseData.message = "文章内容获取成功";
		responseData.data = hotContents;
		res.json(responseData);
        Content.findById({
            _id:req.query.contentId
        }).then(function(content){
            content.views++;
            content.save();
        })
		return;
	})
})
router.post('/content/nowContentInfo',function(req,res,next){
    Content.find({
        _id:req.body.contentId
    }).then(function(hotContents){
    	// console.log(hotContents)
        responseData.code = 36;
        responseData.message = "文章内容获取成功";
        responseData.data = hotContents;
        res.json(responseData);
        return;
    })
})
//文章编辑之后保存的路由
router.post('/content/edit',function(req,res,next){
	var id = req.body.id || "";//文章的id
	var categoryid = req.body.category || "";//文章的分类
	var posted = req.body.posted;
	var title = req.body.title || "";
	var description = req.body.description || "";
	var contentwords = req.body.contents || "";
	//查找出数据库里面的对应的内容与现在编辑之后的内容做比较
	//验证标题不能为空
	//简介不能为空
	//内容不能为空
	//三者不能同时全部相等
	Content.findById({
		_id:id
	}).then(function(contents){
		if(!title){
			res.render('admin/error',{
				userInfo:req.userInfo,
				errorMessage:"文章标题不能为空!"
			})
			return Promise.reject();
		}
		if(!description){
			res.render('admin/error',{
				userInfo:req.userInfo,
				errorMessage:"文章简介不能为空!"
			})
			return Promise.reject();
		}
		if(!contentwords){
			res.render('admin/error',{
				userInfo:req.userInfo,
				errorMessage:"文章内容不能为空!"
			})
			return Promise.reject();
		}
		if(title == contents.title && description == contents.description && contentwords == contents.content){
			res.render('admin/error',{
				userInfo:req.userInfo,
				errorMessage:"文章内容没有做修改!"
			})
			return Promise.reject();
		}
		//将修改后的数据保存替换掉当前数据中的数据;
		return Content.update({
			//修改的值
			_id:id
		},{
			//更新的值
			title:title,
            posted:posted,
			description:description,
			content:contentwords,
			startTime:Date.parse(new Date())
		}).then(function(newContents){
			//文章编辑保存成功之后
			responseData.code = 37;
			responseData.message = '文章编辑保存成功';
			res.json(responseData);
			return;
		})
	})
})
//首頁分頁的接口（小程序首頁的接口）
router.get('/contentList',function(req,res,next){
	console.log("进入了啊")
	console.log(req.query)
    var page = Number(req.query.page || 1);
    var limte = Number(req.query.limte || 10);
    var pages = 0;
//	res.send('shouye')
    //从数据库中获取网站的分类名称
    Category.find().then(function(categories){
        //查询数据库中的数据的条数
        Content.count().then(function(count) {
            pages = Math.ceil(count / limte);//客户端应该显示的总页数
            page = Math.min(page, pages);//page取值不能超过pages
            page = Math.max(page, 1);//page取值不能小于1
            var skip = (page - 1) * limte;
            //sort()排序  -1 降序 1 升序
            //populate('category')  填充关联内容的字段的具体内容(关联字段在指定另一张表中的具体内容)
            Content.find().sort({_id: -1}).limit(limte).skip(skip).populate('category').then(function (contents) {
                responseData.code = 37;
                responseData.message = "分页文章列表获取成功";
                responseData.count = count;
                responseData.data = contents;
                res.json(responseData);
                return;
            })
        })
    })
})
//获取banner的数据
router.post('/banner',function(req,res,next){
    //从数据库中获取网站的分类名称
    Banner.find().then(function(bannerList){
        responseData.code = 43;
        responseData.message = "分类banner数据成功";
        responseData.data = bannerList;
        responseData.userInfo = req.userInfo,
        res.json(responseData);
        return;
    })
})
/*
 * 文章分类名称(小程序)
 *
 */
router.post('/categories',function(req,res,next){
    //从数据库中获取网站的分类名称
    Category.find().then(function(categories){
        // console.log(categories)
        responseData.code = 40;
        responseData.message = "分类获取成功";
        responseData.data = categories;
        res.json(responseData);
        return;
    })
})
//导航列表点击进入对应的分类下面的文章列表（网站也用这个pc）
router.get('/categoryListContent',function(req,res,next){
    var id = req.query.id || "";//当前点击的分类的ID
    var page = Number(req.query.page || 1);//req.query.page 获取?后面的页数
    var limte = 10;
    var pages = 0;
//	res.send('shouye')
    //从数据库中获取网站的分类名称
    Category.find().then(function(categories){
        //查询数据库中的数据的条数
        Content.find(
            {category:id}//分类的ID
        ).count().then(function(count) {
            pages = Math.ceil(count / limte);//客户端应该显示的总页数
            page = Math.min(page, pages);//page取值不能超过pages
            page = Math.max(page, 1);//page取值不能小于1
            var skip = (page - 1) * limte;
            //sort()排序  -1 降序 1 升序
            //populate('category')  填充关联内容的字段的具体内容(关联字段在指定另一张表中的具体内容)
            Content.find(
                {category:id}//分类的ID
            ).sort({_id: -1}).limit(limte).skip(skip).populate('category').then(function (contents) {
                responseData.code = 41;
                responseData.message = "分类文章获取成功";
                responseData.count = count;
                responseData.data = contents;
                res.json(responseData);
                return;
            })
        })
    })
})

router.post('/videoList',function(req,res,next){
    //获取视频列表
    VideoList.find().then(function(videoList) {
        responseData.code = 42;
        responseData.message = "视频列表获取成功";
        responseData.data = videoList;
        res.json(responseData);
        return;
    })
})


router.post('/resources',function(req,res,next){
    Category.find().then(function(categories) {
        Source.find({},{ _id:0,__v:0}).then(function(sourceCategories){
            var newSourceCategories = [];
            sourceCategories.forEach(function(value,index){
                if(value.parentId == 0){
                    newSourceCategories.push(value);
                }
            })
            // newSourceCategories.forEach(function(val,index){
             //    val.childData = []
            // })
			// console.log(newSourceCategories)
            Source.find({
               parentId:{$gt:0}
            }).then(function(categoriesChild){
                responseData.code = 42;
                responseData.message = "视频列表获取成功";
                responseData.data = newSourceCategories;
            	responseData.jsonData = categoriesChild;
                res.json(responseData);
                return;
            })
        })
    })

})
//资源首页列表的分页
router.post('/soucesCount',function(req,res,next){
    Category.find().then(function(categories) {
        Plug.count().then(function (count) {
            comments = {
                "count" : count
            }
            responseData.code = 24;
            responseData.message = "数据获取成功!";
            responseData.data = comments;
            res.json(responseData);
            return;
        })
    })
})
//资源分类列表的分页
router.get('/soucesCountList',function(req,res,next){
	var id = req.query.id;
    Category.find().then(function(categories) {
        Plug.find({
            categoryChildId:id
		}).count().then(function (count) {
            comments = {
                "count" : count
            }
            responseData.code = 24;
            responseData.message = "数据获取成功!";
            responseData.data = comments;
            res.json(responseData);
            return;
        })
    })
})
// 小程序获取token
router.get('/user/WeChat/token',function(req,res,next){
    https.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxfd528d56a6f059ec&secret=53350954146a3e4255987c11746fd19d', function(wxRes) {
        wxRes.on('data', function(d) {

        	console.log("token00:",JSON.parse(d.toString()).access_token)
			console.log("333:","-------------")
			var options = {
			    hostname: 'api.weixin.qq.com',
			    path: '/datacube/getweanalysisappiddailysummarytrend?access_token='+JSON.parse(d.toString()).access_token,
			    method: 'POST'
			};
			var reqdata = {
			    "begin_date" : "20171220",
			    "end_date" : "20171221"
			}
			console.log("token11:", JSON.parse(d.toString()).access_token)
			var aa = https.request(options, function(wxRes2) {
			    wxRes2.on('data',function(d2){
			        console.log("555:-------------------")
			        responseData.code = 200;
			        responseData.message = "获取小程序分析接口成功!";
			        responseData.data = JSON.parse(d2.toString());
			        res.json(responseData);
			    });
			    console.log("4444:-------------------")
			    aa.write(JSON.stringify(reqdata))
			    aa.end();
			})
        });
    }).on('error', function(e) {
        console.error(e);
    });

})

module.exports = router;
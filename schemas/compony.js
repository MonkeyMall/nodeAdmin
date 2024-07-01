/*
 * 公司的数据库的结构
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//公司的表结构
module.exports = new mongoose.Schema ({
  // 公司名称
  name: { 
    type: String,
    default: ''
  }, 
  // logo
  logo: { 
    type: String,
    default: ''
  }, 
  // 公司行业
  industry: { 
    type: String,
    default: ''
  }, 
  // 公司规模
  scale: { 
    type: String,
    default: ''
  }, 
  // 公积金
  accumulation: { 
    type: String,
    default: ''
  }, 
  // 融资情况
  insurance: { 
    type: String,
    default: ''
  }, 
  // 公司福利
  welfare: { 
    type: String,
    default: ''
  }, 
  // 公司地址
  address: { 
    type: String,
    default: ''
  }, 
  // 融资
  financing: { 
    type: String,
    default: ''
  }, 
  // 工资
  wage: { 
    type: String,
    default: ''
  }, // 工资
  // 技术
  technical: { 
    type: String,
    default: ''
  },
  // 成立时间
  createdDate: { 
    type: String,
    default: ''
  },
  // 上班时间
  workTime: { 
    type: String,
    default: ''
  }, 
  // 加班时间
  overTime: { 
    type: String,
    default: ''
  }, 
  // 注册资本
  registeredCapital: {
    type: String,
    default: ''
  },
  // 注册地址
  addressZc: {
    type: String,
    default: ''
  },
  // 官网
  website: { 
    type: String,
    default: ''
  },
  views: { // 浏览量
    type: Number,
    default: 0
  },
  startTime: {
    type:Date,
    default:new Date()
  }
})

'use strict';
//如果在这个目录下没有package.json文件，node将试图从这个目录下加载index.js或index.node文件
const modules = {
	goods: require("./goods"),
	categories: require("./categories"),
	orders: require("./orders"),
	shops: require("./shops"),
	ads: require("./ads"),
	docs: require("./docs"),
};
const uniID = require('uni-id');
/**
 * 主入口，有利于提高访问时间，低频函数15分钟或半小时会被回收
 * @param {string}  event.model 子模块名称 
 * @param {string}  event.action 子模块方法名称 
 * @param {Object}  data 传入子模块数据 
 * @link https://uniapp.dcloud.io/uniCloud/faq?id=%e4%ba%91%e5%87%bd%e6%95%b0%e8%ae%bf%e9%97%ae%e6%97%b6%e5%bf%ab%e6%97%b6%e6%85%a2%e6%80%8e%e4%b9%88%e5%9b%9e%e4%ba%8b%ef%bc%9f
 */
exports.main = async (event, context) => {
	//统一用户权限验证，进入里面，所有必须登录，某些接口，需要特殊验证
	const {
		module, 
		operation, 
		data, 
		shopid,
		uniIdToken
	} = event;
	//token检查,全部都需要
	let payload = await uniID.checkToken(uniIdToken);
	if (payload.code && payload.code > 0) {
		return {
			code: 401,
			message:payload.msg,
			data:payload
		}
	}
	//data.uid = payload.uid;
	context.userInfo = payload.userInfo;
	//强制传递操作者，如果是更新数据，会写入数据库，这里的uid是ObjectId
	data.operator = payload.uid;
	//操作的店铺id,必填，否则无法判断权限
	//@todo shopid和customUserId将来读取此用户的权限信息，来判断是否有操作如下action的权限
	//在权限验证完成之后，强制设置操作店铺id,相当于转换为int类型
	data.shopid = shopid;
	//统一处理page和limit，不允许出现错误的值，必须是int类型
	if (data.page) {
		if (data.page < 1) {
			data.page = 1;
		} else {
			data.page = +data.page;
		}
	}
	if (data.limit) {
		if (data.limit < 1) {
			data.limit = 20;
		} else {
			data.limit = +data.limit;
		}
	}
	let result=false;
	try {
		result = await modules[module][action](data, context);
	} catch (e) {
		console.log("error",event,e);
		return {
			code: 500,
			message: e.errMsg || "系统错误"
		}
	}
	if (!result) {
		return {
			code: 404,
			message: data.message || "暂无数据"
		};

	}
	return {
		code: 200,
		data: result,
		message: "操作成功"
	};
};

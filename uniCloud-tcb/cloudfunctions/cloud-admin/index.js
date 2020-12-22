'use strict';
//如果在这个目录下没有package.json文件，node将试图从这个目录下加载index.js或index.node文件
const modules = {
	goods: require("./goods"),
	categories: require("./categories"),
	orders: require("./orders"),
	shops: require("./shops"),
	ads: require("./ads"),
	docs: require("./docs"),
	printer: require("./printer"),
	users: require("./users"),
	statistics: require("./statistics"),
	special: require("./special"),
	selfraising: require("./selfraising"),
	video: require("./video"),
	coupon: require("./coupon"),
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
		action,
		data,
		shopid,
		Type,
		uniIdToken
	} = event;
	if (Type == "Timer") {
		console.log(event);
		for (let model in modules) {
			//执行每个模块的定时器
			if (modules[model]["timer"]) {
				console.log(model);
				await modules[model]["timer"]();
			}
		}
		return event;
	}
	//token检查,全部都需要
	let payload = await uniID.checkToken(uniIdToken);
	let tokenData = {};
	if (payload.code && payload.code > 0) {
		return {
			code: 401,
			message: payload.msg,
			data: payload
		}
	}
	//简单判断用户权限
	if (!payload.userInfo.admin || payload.userInfo.admin.indexOf(shopid) == -1) {
		return {
			code: 403,
			message: "无权操作",
		}
	}
	//data.uid = payload.uid;
	context.userInfo = payload.userInfo;
	//强制传递操作者，如果是更新数据，会写入数据库，这里的uid是ObjectId
	data.operator = payload.uid;
	if (payload && payload.token) {
		tokenData = {
			token: payload.token,
			tokenExpired: payload.tokenExpired
		}
	}
	//操作的店铺id,必填，否则无法判断权限
	//@todo shopid和customUserId将来读取此用户的权限信息，来判断是否有操作如下action的权限
	//在权限验证完成之后，强制设置操作店铺id,相当于转换为int类型
	data.shopid = shopid;
	//统一处理page和limit，不允许出现错误的值，必须是int类型
	//预防有分页查询的接口，提前过滤page的有效性
	if (data.page) {
		data.page = data.page < 1 ? 1 : +data.page;
	}
	//预防有分页查询的接口，提前过滤limit的有效性
	if (data.limit) {
		data.limit = data.limit < 1 ? 20 : +data.limit;
	}
	let result = false;
	try {
		result = await modules[module][action](data, context);
	} catch (e) {
		console.log("error", event, e);
		return {
			code: 500,
			message: e.errMsg || "系统错误"
		}
	}
	if (!result) {
		return {
			code: 404,
			message: "暂无数据",
			...data
		};
	} else if (result.code > 0) {
		return {
			code: 404,
			message: result.msg || "暂无数据",
		}
	}
	return {
		code: 200,
		data: result,
		message: "操作成功",
		...tokenData
	};
};

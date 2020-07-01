'use strict';
//如果在这个目录下没有package.json文件，node将试图从这个目录下加载index.js或index.node文件
const modules = {
	goods: require("./goods"),
	categories: require("./categories"),
	orders: require("./orders"),
	shops: require("./shops"),
};
const auth = uniCloud.auth();
/**
 * 主入口，有利于提高访问时间，低频函数15分钟或半小时会被回收
 * @param {string}  event.model 子模块名称 
 * @param {string}  event.action 子模块方法名称 
 * @param {Object}  event.data 传入子模块数据 
 * @link https://uniapp.dcloud.io/uniCloud/faq?id=%e4%ba%91%e5%87%bd%e6%95%b0%e8%ae%bf%e9%97%ae%e6%97%b6%e5%bf%ab%e6%97%b6%e6%85%a2%e6%80%8e%e4%b9%88%e5%9b%9e%e4%ba%8b%ef%bc%9f
 */
exports.main = async (event, context) => {
	//统一用户权限验证，进入里面，所有必须登录，某些接口，需要特殊验证
	let {
		customUserId
	} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	//强制传递操作者
	event.data["operator"] = +customUserId;
	//操作的店铺id,必填，否则无法判断权限
	let shopid = +event.shopid;
	//@todo shopid和customUserId将来读取此用户的权限信息，来判断是否有操作如下action的权限
	//在权限验证完成之后，强制设置操作店铺id,相当于转换为int类型
	event.data["shopid"] = shopid;
	//统一处理page和limit，不允许出现错误的值，必须是int类型
	if (event.data.page) {
		if (event.data.page < 1) {
			event.data.page = 1;
		} else {
			event.data.page = +event.data.page;
		}
	}
	if (event.data.limit) {
		if (event.data.limit < 1) {
			event.data.limit = 20;
		} else {
			event.data.limit = +event.data.limit;
		}
	}
	let data;
	try {
		data = await modules[event.module][event.action](event.data, context);
	} catch (e) {
		console.log("error",e);
		//TODO handle the exception
		return {
			code: 500,
			message: e.errMsg || "系统错误"
		}
	}
	if (!data) {
		return {
			code: 404,
			message: event.data.message || "暂无数据"
		};

	}
	return {
		code: 200,
		data: data,
		message: "操作成功"
	};
};

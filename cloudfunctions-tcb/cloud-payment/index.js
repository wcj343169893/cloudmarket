'use strict';
/**
 * 用户中心统一插件，位于common目录
 * @url https://ext.dcloud.net.cn/plugin?id=2116
 */
const uniID = require('uni-id');
const actions = require('./actions');
/**
 * 全部方法都需要验证用户信息
 * @param {Object} event ,event.uniIdToken每一个请求都会自动带上
 */
exports.main = async (event, context) => {
	if (event.path) {
		//微信/支付宝支付成功回调，后续验证成功后，可以更新订单信息
		return await actions.notify(event, context);
	}
	const {
		module,
		action,
		data,
		uniIdToken
	} = event;
	//token检查，必须登录
	let payload = await uniID.checkToken(uniIdToken);
	if (payload.code && payload.code > 0) {
		return {
			code: 401,
			event,
			message: payload.msg
		}
	}
	//uid在后续保存操作中，会存入数据库，uid为ObjectId，例如：29ce6e168a89414daf110a96b4300c02
	data.uid = payload.uid;
	//userInfo为连带查询数据，后续接口可能会用到
	context.userInfo = payload.userInfo;
	let result = false;
	try {
		result = await actions[action](data, module, context);
	} catch (e) {
		console.log("error", event, e);
		return {
			code: 500,
			message: "系统错误",
			...e
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
		message: "操作成功"
	};
};

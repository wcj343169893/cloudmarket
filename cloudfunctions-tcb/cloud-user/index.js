'use strict';
const uniID = require('uni-id');
const modules = {
	login: require('./login'),
	info: require('./info')
}

const mustLoginActions = {
	info: [
		"*",
	],
}
/**
 * 获取用户信息，但是不校验
 */
const getUserInfoActions = {
}


/**
 * 全部方法都需要验证用户信息
 * @param {Object} event ,event.uniIdToken每一个请求都会自动带上
 */
exports.main = async (event, context) => {
	const {
		module,
		action,
		data,
		uniIdToken
	} = event;
	if (mustLoginActions[module] && (mustLoginActions[module].includes("*") || mustLoginActions[module].includes(action))) {
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
	} else if (getUserInfoActions[module] && (getUserInfoActions[module].includes("*") || getUserInfoActions[module].includes(
			action))) {
		//仅仅是获得的用户信息，有可能没有
		let payload = await uniID.checkToken(uniIdToken);
		data.uid = payload.uid;
		context.userInfo = payload.userInfo;
	}
	let result = false;
	//预防有分页查询的接口，提前过滤page的有效性
	if (data.page) {
		data.page = data.page < 1 ? 1 : +data.page;
	}
	//预防有分页查询的接口，提前过滤limit的有效性
	if (data.limit) {
		data.limit = data.limit < 1 ? 20 : +data.limit;
	}
	try {
		result = await modules[module][action](data, context);
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

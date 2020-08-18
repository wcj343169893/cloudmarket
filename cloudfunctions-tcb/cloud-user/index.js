'use strict';
const uniID = require('uni-id');
const modules = {
	login: require('./login'),
	info: require('./info')
}
const allowActions = {
	login: [
		"jiguang",
		"weixin",
		"mobile",
		"sendSms"
	]
}

/**
 * 全部方法都需要验证用户信息
 */
exports.main = async (event, context) => {
	const {
		module,
		action,
		data,
		uniIdToken
	} = event;
	if (allowActions[module] && allowActions[module].includes(action)) {
		//console.log("不需要登录即可访问！");
	} else {
		//token检查
		let payload = await uniID.checkToken(uniIdToken);
		if (payload.code && payload.code > 0) {
			return {
				code: 401,
				event,
				message: payload.msg,
				data: payload
			}
		}
		data.uid = payload.uid;

		context.userInfo = payload.userInfo;
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
			message: data.message || "暂无数据",
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

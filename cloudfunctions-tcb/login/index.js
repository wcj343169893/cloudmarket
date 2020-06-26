'use strict';
const db = uniCloud.database();
const {
	loginWithPhone
} = require('login');
exports.main = async (event, context) => {
	let mobile = event.mobile;
	let code = event.code;
	//正常情况需要验证一下，暂时全部通过
	let data = await loginWithPhone(mobile);
	//临时输出
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};
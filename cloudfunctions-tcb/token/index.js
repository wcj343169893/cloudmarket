'use strict';

const {createTicket} = require('token');
const db = uniCloud.database();
/**
 * 验证用户id和token是否成功，返回访问令牌
 * https://uniapp.dcloud.io/uniCloud/cf-authentication
 */
exports.main = async (event, context) => {
	console.log(event);
	let uid = event.uid;
	let token = event.token || "unknown";
	//检查uid和token是否有效
	let userExists = await db.collection("users").where({
		id: +uid,
		token: token
	}).count();
	console.log(userExists)
	if (userExists.total == 0) {
		//token失效
		return {
			code: 404,
			message: "token失效"
		};
	}
	console.log(uid);
	const ticket = createTicket(uid);
	return {
		code: 200,
		data: ticket,
		message: "获取令牌成功"
	};;
};

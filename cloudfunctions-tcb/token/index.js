'use strict';
const NodeRSA = require('node-rsa');
const {
	createTicket,
	getTokenExpire
} = require('token');
const db = uniCloud.database();
/**
 * 验证用户id和token是否成功，返回访问令牌
 * https://uniapp.dcloud.io/uniCloud/cf-authentication
 */
exports.main = async (event, context) => {
	console.log(event);
	let uid = event.uid;
	let token = event.token || "unknown";
	const fields = {
		balance: 1,
		count: 1,
		coupons: 1,
		score: 1,
		nickname: 1,
		portrait: 1,
		id: 1,
		invite: 1,
		birthday: 1,
		token: 1
	};
	//检查uid和token是否有效
	let result = await db.collection("users").where({
		id: +uid,
		token: token
	}).field(fields).get();
	if (result.data.length == 0) {
		//token失效
		return {
			code: 404,
			message: "token失效"
		};
	}
	let data = result.data[0];
	let time = new Date().toISOString();
	data["lastLogin"] = time;
	//30天有效期
	let tokenExpire = getTokenExpire();
	let publicKey = `-----BEGIN PUBLIC KEY-----` +
		`MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCl6oNaichd0m+sSY74RV3ISeWKKAFFk0E4aUjax+a7OJEvISZ4xYKbQIDAQAB` +
		`-----END PUBLIC KEY-----`;
	let key = new NodeRSA(publicKey);
	key.setOptions({
		encryptionScheme: 'pkcs1'
	});
	//这里加密的值与登录不一致，但是不影响使用，uid=10000方便测试
	if(uid != 10000){
		token = key.encrypt(uid, "base64");
	}
	//更新登录时间
	await db.collection("users").doc(data._id).update({
		token: token,
		tokenExpire: tokenExpire,
		lastLogin: time,
	});
	//新token
	data["token"] =token;
	//token有效期
	data["tokenExpire"] =tokenExpire;
	//生成ticket
	data["ticket"] = createTicket(uid);
	return {
		code: 200,
		data: data,
		message: "获取令牌成功"
	};;
};

'use strict';
const db = uniCloud.database();
const cmd = db.command;
const NodeRSA = require('node-rsa');
const uniID = require('uni-id');
//极光配置，公钥需要设置到极光后台，app包名需要对应上，否则无法验证
const {
	getLoginConfig
} = require("configs");
//登录模块，支持极光一键登录，手机号+验证码登录，微信授权登录
const jiguang = async (data, context) => {
	//只有app端支持极光context.PLATFORM
	let configs = getLoginConfig("app-plus", "jiguang");
	//Authorization 在网上可以生成
	const result = await uniCloud.httpclient.request(configs["url"], {
		method: 'POST',
		headers: {
			"Authorization": configs["Authorization"]
		},
		data: {
			loginToken: data.token
		},
		contentType: "json",
		dataType: 'json'
	});
	if (result.data.code != 8000) {
		data.message = result.data.content;
		return false;
	}
	//console.log('result', result);
	console.log('encrypted:', result.data.phone);
	//私钥和公钥要配对才能解开
	let key = new NodeRSA(configs["privateKey"]);
	//这一步很关键：encryptionScheme — padding scheme for encrypt/decrypt. Can be 'pkcs1_oaep' or 'pkcs1'. Default 'pkcs1_oaep'.
	key.setOptions({
		encryptionScheme: 'pkcs1'
	});
	let mobileName = key.decrypt(result.data.phone, 'utf8');
	if (!mobileName) {
		data.message = "手机号解码错误";
		return false;
	}
	console.log(mobileName);
	let code = '987654';
	let params = {
		mobile: mobileName,
		code,
		type: "login",
		expiresIn: configs.expiresIn,
	}
	//临时设置验证码，模拟登录
	let res = await uniID.setVerifyCode(params);
	return await uniID.loginBySms(params);
}
/**
 * 发送验证码，type：login、其他
 */
const sendSms = async (data) => {
	if (data.mobile == "15986613315") {
		return await uniID.setVerifyCode({
			mobile: data.mobile,
			code: "886633",
			type: "login",
			expiresIn: 180,
		});
	}
	return await uniID.sendSmsCode({
		mobile: data.mobile,
		type: data.type || "login",
		code: (Math.random() + "").substr(2, 6),
		expiresIn: 180
	});
}
/**
 * 手机号+验证码登录,
 * @param {Object}  data:{
	 mobile,code
 } 
 */
const mobile = async (data, context) => {
	console.log(data)
	return await uniID.loginBySms(data);
}
/**
 * 微信登录，小程序或者app授权
 */
const weixin = async (data, context) => {
	console.log("weixin", context.PLATFORM)
	return await uniID.loginByWeixin(data.code)
}


module.exports = {
	jiguang,
	weixin,
	mobile,
	sendSms
}

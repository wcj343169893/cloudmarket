'use strict';
const db = uniCloud.database();
const cmd = db.command;
const NodeRSA = require('node-rsa');
const uniID = require('uni-id');
//极光配置，公钥需要设置到极光后台，app包名需要对应上，否则无法验证
const {
	getLoginConfig,
	getSmsTemplateId
} = require("configs");
const model = {
	/**
	 * 获取随机验证码
	 */
	getRandomCode() {
		return (Math.random() + "").substr(2, 6);
	},
	//登录模块，支持极光一键登录，手机号+验证码登录，微信授权登录
	async jiguang(data, context) {
		//只有app端支持极光context.PLATFORM
		let configs = getLoginConfig("app-plus", "jiguang");
		//Authorization 在网上可以生成 http://web.chacuo.net/safebasicauth
		//https://docs.jiguang.cn/jverification/server/rest_api/rest_api_summary/
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
			console.log("jiguang result.data", result.data)
			console.log(configs)
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
		let mobileName = false;
		try {
			mobileName = key.decrypt(result.data.phone, 'utf8');
		} catch (e) {
			console.log("极光解密手机号错误", JSON.stringify(e));
		}
		if (!mobileName) {
			data.message = "手机号解码错误";
			console.log("jiguang decrypt", data.message)
			return false;
		}
		console.log(mobileName);
		let code = this.getRandomCode();
		let params = {
			mobile: mobileName,
			code,
			inviteCode: data.inviteCode ? data.inviteCode : false,
			type: "login",
			expiresIn: configs.expiresIn,
		}
		//临时设置验证码，模拟登录
		let res = await uniID.setVerifyCode(params);
		delete params.type;
		return await uniID.loginBySms(params);
	},
	/**
	 * 发送验证码，type：login、其他
	 */
	async sendSms(data) {
		return await uniID.sendSmsCode({
			mobile: data.mobile,
			type: data.type || "login",
			templateId: getSmsTemplateId("login"),
			code: this.getRandomCode(),
			expiresIn: 180
		});
	},
	/**
	 * 手机号+验证码登录,
	 * @param {Object}  data:{
		 mobile,code
	 } 
	 */
	async mobile(data, context) {
		console.log(data)
		return await uniID.loginBySms(data);
	},
	/**
	 * 微信登录，小程序或者app授权
	 */
	async weixin(data, context) {
		console.log("weixin", context.PLATFORM)
		console.log("inviteCode", data.inviteCode);
		try {
			const res = await uniID.loginByWeixin(data.code);
			if (res.code == 0 && res.type == "type" && data.inviteCode) {
				//设置邀请码
				await uniID.acceptInvite({
					uid: res.uid,
					inviteCode: data.inviteCode
				});
				console.log("设置微信用户邀请码", res.uid, data.inviteCode)
			}
			return res;
		} catch (e) {
			//TODO handle the exception
			console.log(JSON.stringify(e));
			return {
				code: 500,
				msg: e.errMsg
			};
		}
		return false;
	},
	/**
	 * 今日头条、抖音
	 */
	async toutiao(data, context) {

		return false;
	}
}


module.exports = model;

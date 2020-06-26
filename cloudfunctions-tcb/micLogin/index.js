'use strict';
/**
 * https://ext.dcloud.net.cn/plugin?id=1834
 */
const uniAccount = require('uni-account');
const db = uniCloud.database();
const {
	createTicket
} = require('token');
const {
	genIdentityId
} = require('base-common');
exports.main = async (event, context) => {
	let platform = context.PLATFORM;
	let uniAccountIns;
	if (platform == "mp-weixin") {
		//微信小程序
		uniAccountIns = uniAccount.initWeixin({
			appId: "",
			secret: "",
		});
	} else if (platform == "mp-alipay") {
		//支付宝小程序
	}
	if (!uniAccountIns) {
		return {
			code: 404,
			message: "自动登录错误"
		};
	}
	const {
		openid
	} = await uniAccountIns.code2Session(event.code);
	if (!openid) {
		return {
			code: 404,
			message: "自动登录错误2"
		}
	}
	const fields = {
		balance: 1,
		count: 1,
		coupons: 1,
		score: 1,
		nickname: 1,
		portrait: 1,
		id: 1,
		platform:1,
		openid:1,
		invite: 1,
		birthday: 1,
		token: 1
	};
	console.log("openid:", openid);
	const usersCollection = db.collection("users");
	//如果已经登录，则一并返回用户信息，否则只返回openid
	let user = await usersCollection.where({
		platform: platform,
		openid: openid
	}).field(fields).limit(1).get();
	let data;
	if (user.data.length == 0) {
		let time = new Date().toISOString();
		//直接自动创建用户
		data = {
			nickname: "小程序用户",
			portrait: "/static/missing-face.png",
			balance: 0,
			coupons: 0,
			score: 0,
			platform: platform,
			openid: openid,
			regist: time,
			lastLogin: time,
		};
		//生成用户id----开始-----
		data["id"] = await genIdentityId("users");
		//新增
		let result = await usersCollection.add(data);
		data["_id"] = result.id;
	} else {
		data = user.data[0];
	}
	//生成ticket
	data["ticket"] = createTicket(data.id);
	return {
		code: 200,
		message: "自动登录成功",
		data: data
	}
};

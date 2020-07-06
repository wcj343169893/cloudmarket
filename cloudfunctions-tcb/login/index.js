'use strict';
const modules = {
	jiguang: require('./jiguang'),
	mobile: require('./mobile'),
	token: require('./token'),
	weixin: require('./weixin'),
};
const NodeRSA = require('node-rsa');
const db = uniCloud.database();
const usersCollection = db.collection("users");
const config = require("./config.json");
const {
	createTicket,
	getTokenExpire
} = require('token');
const {
	genIdentityId,
} = require('base-common');
exports.main = async (event, context) => {
	let channel = event.channel ? event.channel : "mobile";
	//返回false，表示验证未通过
	let model = modules[channel];
	let conditions = await model.checkInfo(event, context);
	if (!conditions) {
		//验证失败
		return {
			"code": 404,
			"message": event.message || "登录失败"
		};
	}
	let data;
	//检测是否已经存在
	let user = await usersCollection.where(conditions).field(fields).limit(1).get();
	if (user.data.length == 0) {
		//token自动登录，不能注册
		if (model.ifNotExists == "quit") {
			return {
				"code": 404,
				"message": "登录失败!"
			};
		} else if (model.ifNotExists == "new") {
			//手机号自动注册
			data = await autoRegist(conditions, channel);
		} else {
			//其他情况暂不处理
			return {
				"code": 404,
				"message": "登录失败!"
			};
		}
	} else {
		data = user.data[0];
		let info = {
			token: genToken(conditions),
			loginChannel: channel,
			tokenExpire: getTokenExpire(),
			lastLogin: new Date().toISOString()
		}
		Object.assign(data, info);
		//更新token
		await usersCollection.doc(data._id).update(info);
	}
	//生成ticket，腾讯自定义登录
	data["ticket"] = createTicket(data.id);
	return {
		"code": 200,
		"message": "登录成功",
		"data": data
	};
};
/**
 * 手机号自动注册
 * @param {Object} mobile
 * @param {Object} channel
 */
const autoRegist = async function(conditions, channel) {
	let time = new Date().toISOString();
	let data = {
		...conditions,
		nickname: getNickName(),
		portrait: "/static/missing-face.png",
		balance: 0,
		coupons: 0,
		score: 0,
		token: genToken(conditions),
		tokenExpire: getTokenExpire(),
		loginChannel: channel,
		regist: time,
		lastLogin: time,
	};
	//生成用户id----开始-----
	data["id"] = await genIdentityId("users");
	//生成用户id----结束-----
	//新增
	let result = await usersCollection.add(data);
	data["_id"] = result.id;
	return data;
}

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
};
/**
 * 生成token
 * @param {Object} data
 */
const genToken = function(data) {
	//加密的时候，不要包含token相关信息
	if (data.token) {
		delete data.token;
	}
	if (data.tokenExpire) {
		delete data.tokenExpire;
	}
	let key = new NodeRSA(config["publicKey"]);
	key.setOptions({
		encryptionScheme: 'pkcs1'
	});
	return key.encrypt(JSON.stringify(data), "base64");
}

/**
 * 随机获取一个昵称
 */
const getNickName = function() {
	let names = require("./nicknames.json");
	let index = parseInt(Math.random() * names.length);
	return names[index];
}

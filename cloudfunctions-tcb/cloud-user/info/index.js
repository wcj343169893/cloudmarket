'use strict';
const db = uniCloud.database();
const cmd = db.command;
const uniID = require('uni-id');
const shopCollection = db.collection("cloud_shops");
const userCollection = db.collection("uni-id-users");
const models = {
	//我的信息
	async mine(data, context) {
		let res = await getUserInfo(data.uid, ["nickname", "gender", "status", "mobile", "email", "mobile_confirmed",
			"email_confirmed", "avatar", "comment", "birthday"
		]);
		if (res.code > 0) {
			return res;
		}
		return res.userInfo;
	},
	//信息统计
	async statistics(data) {
		let res = await getUserInfo(data.uid, ["order", "balance", "admin", "coupons", "score", "count"]);
		if (res.code > 0) {
			return res;
		}
		let info = res.userInfo;
		//处理余额为2位小数
		info.balance = info.balance ? info.balance.toFixed(2) : 0;
		if (info.admin) {
			//查询店铺的订单统计情况,以及店铺信息
			let shops = await shopCollection.where({
				id: cmd.in(info.admin)
			}).field({
				id: 1,
				name: 1,
				src: 1,
				monthSale: 1,
				address: 1,
				order: 1,
				banner: 1
			}).orderBy("id", "desc").limit(30).get();
			info.admin = shops.data;
		}
		//免费开通会员最后期限
		info.lastFreeVip = 1601530971745;
		//当前时间
		info.time = new Date().getTime();
		//88/年
		info.vipPrice = 88;
		return info;
	},
	//开通会员，后续完成
	async vip(data) {
		//限时开通途径，free
		let channel = data.channel;
		data.message = "开通失败";
		return false;
	},
	//修改用户信息
	async save(data) {
		let strinFields = ["avatar", "nickname", "birthday"];
		let intFields = ["gender"];
		let entity = {};
		for (let f in data) {
			if (strinFields.indexOf(f) != -1) {
				//可保存的字段
				entity[f] = data[f];
			} else if (intFields.indexOf(f) != -1) {
				entity[f] = parseInt(data[f]);
			}
		}
		console.log("保存用户基本信息", entity);
		//保存更改
		return await uniID.updateUser({
			uid: data.uid,
			...entity
		});
	}
}
/**
 * uniid插件还未发布的方法
 */
const getUserInfo = async (uid, field) => {
	const fieldObj = {}
	if (field && field.length) {
		for (let i = 0; i < field.length; i++) {
			fieldObj[field[i]] = true
		}
	}
	let res = await userCollection.doc(uid).field(fieldObj).get();
	if (res.data.length === 0) {
		return {
			code: 80401,
			msg: '未查询到用户信息'
		}
	}
	return {
		code: 0,
		msg: '获取用户信息成功',
		userInfo: res.data[0]
	}
}

module.exports = models;

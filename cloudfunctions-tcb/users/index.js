'use strict';
const db = uniCloud.database();
const cmd = db.command;
const auth = uniCloud.auth();
/**
 * 我的信息，需要验证权限
 */
exports.main = async (event, context) => {
	let {customUserId} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let uid = +customUserId;
	let info = {};
	//2020-10-01 13:42:51.745
	let lastFreeVip = 1601530971745;
	//let lastFreeVip = 1501530971745;
	//保存个人信息，头像，昵称，性别，生日
	if (event.type == "save") {
		let strinFields = ["portrait", "nickname", "birthday"];
		let intFields = ["sex"];
		let entity = {};
		console.log(event);
		for (let f in event) {
			if (strinFields.indexOf(f) != -1) {
				//可保存的字段
				entity[f] = event[f];
			} else if (intFields.indexOf(f) != -1) {
				entity[f] = parseInt(event[f]);
			}
		}
		console.log(entity);
		//保存更改
		let res = await db.collection("users").where({
			id: uid
		}).update(entity);
		console.log("保存用户基本信息", res);
		//@todo 如果修改了头像，批量修改邀请者头像
		return {
			code: 200,
			message: "操作成功",
			data: res
		}
	} else if (event.type == "vip") {
		//限时开通途径，free
		let channel = event.channel;
		return {
			code: 404,
			message: "开通失败"
		}
	} else if (event.type == "invite") {
		let isExist = await db.collection("users").where({
			id: uid,
			invite: cmd.exists(true)
		}).count();
		if (isExist.count > 0) {
			//已经存在邀请者
			return {
				code: 404,
				message: "已经存在邀请者"
			}
		}
		let fuid = +event.fuid;
		let finfo = await db.collection("users").where({
			id: fuid
		}).field({
			//vip: 1,
			nickname: 1,
			portrait: 1,
			inviters: 1
		}).get();
		if (finfo.data.length < 1) {
			return {
				code: 404,
				message: "邀请者不存在"
			}
		}
		finfo = finfo.data[0];
		let inviters = [];
		if (finfo.inviters) {
			inviters = finfo.inviters;
		}
		//所有上级用户
		inviters.unshift({
			id: fuid,
			nickname: finfo.nickname,
			portrait: finfo.portrait
		})
		let entity = {
			//vip: finfo.vip,
			invite: fuid,
			inviters: inviters
		};
		let res = await db.collection("users").where({
			id: uid
		}).update(entity);
		if (res.updated < 1) {
			return {
				code: 404,
				message: "加入失败"
			}
		}
		return {
			code: 200,
			message: "操作成功",
			data: res
		}
	} else {
		//查询用户信息
		let data = await db.collection("users").where({
			id: uid
		}).field({
			id: 1,
			vip: 1,
			balance: 1,
			birthday: 1,
			count: 1,
			coupons: 1,
			invite: 1,
			messageCount: 1,
			nickname: 1,
			portrait: 1,
			score: 1,
			token: 1,
			mobile: 1,
			sex: 1,
			order: 1,
			admin: 1,
			inviters: 1
		}).limit(1).get();
		if (data.data.length == 0) {
			return {
				code: 404,
				message: "信息不存在"
			}
		}
		info = data.data[0];
		//处理余额为2位小数
		info.balance = info.balance.toFixed(2);
		if (info.admin) {
			//查询店铺的订单统计情况,以及店铺信息
			let shops = await db.collection("shops").where({
				id: cmd.in(info.admin)
			}).field({
				id: 1,
				name: 1,
				src: 1,
				monthSale: 1,
				address: 1,
				order: 1,
				banner:1
			}).orderBy("id", "desc").limit(30).get();
			info.admin = shops.data;
		}
		//免费开通会员最后期限
		info.lastFreeVip=lastFreeVip;
		info.time = new Date().getTime();
		//88/年
		info.vipPrice = 88;
	}
	return {
		code: 200,
		message: "操作成功",
		data: info
	}
};

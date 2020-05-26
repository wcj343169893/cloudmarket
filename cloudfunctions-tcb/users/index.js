'use strict';
const db = uniCloud.database();
/**
 * 我的信息，需要验证权限
 */
exports.main = async (event, context) => {
	let uid = +event.uid;
	let data = await db.collection("users").where({
		id: uid
	}).field({
		id: 1,
		vip:1,
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
		order: 1
	}).limit(1).get();
	if (data.data.length == 0) {
		return {
			code: 404,
			message: "信息不存在"
		}
	}
	let info = data.data[0];
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
		let res = await db.collection("users").doc(info._id).update(entity);
		console.log("保存用户基本信息", res);
		//@todo 如果修改了头像，批量修改邀请者头像
		return {
			code: 200,
			message: "操作成功",
			data: res
		}
	} else if (event.type == "invite") {
		if (info.invite > 0) {
			//已经存在邀请者
			return {
				code: 404,
				message: "已经存在邀请者"
			}
		}
		let fuid = +event.fuid;
		//检查用户是否是会员
		let finfo = await db.collection("users").where({
			id: fuid
		}).field({
			vip:1,
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
			vip:finfo.vip,
			invite: fuid,
			inviters: inviters
		};
		let res = await db.collection("users").doc(info._id).update(entity);
		if (res.updated < 1) {
			return {
				code: 404,
				message: "开通失败"
			}
		}
		//合并信息
		Object.assign(info,entity);
	}
	//处理余额为2位小数
	info.balance = info.balance.toFixed(2);
	return {
		code: 200,
		message: "操作成功",
		data: info
	}
};

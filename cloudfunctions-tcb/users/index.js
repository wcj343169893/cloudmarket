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
		for (let f in event) {
			if (strinFields.indexOf(f)) {
				//可保存的字段
				entity[f] = event[f];
			} else if (intFields.indexOf(f)) {
				entity[f] = parseInt(event[f]);
			}
		}
		//保存更改
		let res = await db.collection("users").doc(info._id).update(entity);
		console.log("保存用户基本信息", res);
		return {
			code: 200,
			message: "操作成功",
			data: res
		}
	}
	//处理余额为2位小数
	info.balance = info.balance.toFixed(2);
	return {
		code: 200,
		message: "操作成功",
		data: info
	}
};

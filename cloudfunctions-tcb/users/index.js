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
		id:1,
		balance: 1,
		birthday: 1,
		count: 1,
		coupons: 1,
		invite: 1,
		messageCount: 1,
		nickname: 1,
		portrait: 1,
		score: 1,
		order: 1
	}).limit(1).get();
	if (data.data.length == 0) {
		return {
			code: 404,
			message: "信息不存在"
		}
	}
	let info = data.data[0];
	//处理余额为2位小数
	info.balance = info.balance.toFixed(2);
	return {
		code: 200,
		message: "操作成功",
		data: info
	}
};

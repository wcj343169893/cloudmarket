'use strict';
const db = uniCloud.database();
const {
	updateUserOrderCount
} = require('base-common');
exports.main = async (event, context) => {
	let time = new Date().toISOString();
	let data = await db.collection("orders").where({
		_id: event.outTradeNo,
		state: 0
	}).update({
		state: 1,
		payInfo: {
			time: time,
			...event
		},
		modified: time
	});
	//首次修改状态
	if (data.updated == 1) {
		let order = await db.collection("orders").doc(event.outTradeNo).field({
			uid: 1
		}).get();
		//更新用户订单统计，用户待付款订单数
		let res = await updateUserOrderCount(order.data[0].uid, "payup", 1, "unpaid");
		console.log("updateUserOrderCount", res);
	}
	return data;
};

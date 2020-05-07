'use strict';
/**
 * 自动取消24小时未付款的订单，定时器每小时执行一次
 */
exports.main = async (event, context) => {
	const db = uniCloud.database();
	const cmd = db.command;
	const orderCollection = db.collection("orders");
	let time = new Date().getTime();
	const day = new Date().toISOString();
	//直接执行批量更新
	let orders = await orderCollection.where({
		lastPayTime: cmd.lt(time),
		state: 0
	}).update({
		state: -1,
		cancelStyle:"auto",
		modified: day
	});
	return orders;
};

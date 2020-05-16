'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	updateGoodsMiaoshaStock,
	updateGoodsStock
} = require('base-common');
/**
 * 自动取消24小时未付款的订单，定时器每小时执行一次
 */
exports.main = async (event, context) => {
	const orderCollection = db.collection("orders");
	let time = new Date().getTime();
	const day = new Date().toISOString();
	let orders = await orderCollection.where({
		lastPayTime: cmd.lt(time),
		state: 0
	}).field({
		goods: 1
	}).get();
	if (orders.affectedDocs == 0) {
		return;
	}
	let ids = orders.data.map(m => {
		return m._id;
	});
	//直接执行批量更新
	let result = await orderCollection.where({
		_id: cmd.in(ids)
	}).update({
		state: -1,
		cancelStyle: "auto",
		modified: day
	});
	for (let order of orders.data) {
		for (let ele of order.goods) {
			if (ele.miaosha) {
				let res = await updateGoodsMiaoshaStock(ele, -1);
				console.log("updateGoodsMiaoshaStock", res);
			}
			let resStock = await updateGoodsStock(ele, -1);
			console.log("updateGoodsStock", resStock);
		}
	}
	return result;
};

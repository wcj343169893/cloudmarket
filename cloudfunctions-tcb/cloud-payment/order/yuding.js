'use strict';
const db = uniCloud.database();
const cmd = db.command;
const orderCollection = db.collection("cloud_orders");
const goodsCollection = db.collection("cloud_goods");
const mall = require('./mall.js');
const model = {
	...mall,
	async updatePaymentInfo(event) {
		let time = new Date().toISOString();
		let outTradeNo = event.outTradeNo;
		let data = await orderCollection.where({
			state: 0,
			outTradeNo
		}).update({
			"yuding.state": 1,
			"yuding.outTradeNo": outTradeNo,
			"yuding.payInfo": {
				time: time,
				...event
			},
			modified: time
		});
		if (data.updated == 1) {
			let order = await this.getOrderByConditions({
				outTradeNo
			}, {
				yuding: 1,
				goods: 1,
				cartCount: 1
			});
			//更新支付倒计时lastPayTime=yuding.finalPaymentEndTime
			let res = await orderCollection.doc(order._id).update({
				lastPayTime: order.yuding.finalPaymentEndTime
			});
			console.log("更新预定订单尾款最后支付时间", res);
			//更新商品预定数量
			res = await goodsCollection.doc(order.goods[0]._id).update({
				"yuding.sales": cmd.inc(order.cartCount)
			});
			console.log("更新预定商品销售数量，只增加不减少", res);
		}
		return data;
	}
};
module.exports = model;

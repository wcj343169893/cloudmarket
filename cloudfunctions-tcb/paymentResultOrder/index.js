'use strict';
const db = uniCloud.database();
const cmd = db.command;
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
		let orderData = await db.collection("orders").doc(event.outTradeNo).field({
			uid: 1,
			goods: 1,
			shopid: 1,
			cartCount: 1
		}).get();
		let order = orderData.data[0];
		//更新用户订单统计，用户待付款订单数
		let res = await updateUserOrderCount(order.uid, "payup", 1, "unpaid",order.shopid);
		console.log("updateUserOrderCount", res);

		//商品销量日志
		let up = {
			goods: {}
		};
		let shopSales = {
			shops: {}
		};
		order.goods.map((g) => {
			//每件商品销量
			up.goods[g._id] = cmd.inc(g.amount * 1);
		});
		//店铺销量
		shopSales.shops[order.shopid] = cmd.inc(order.cartCount * 1)
		let dayTime = getDateString();

		//商品销量
		let saleRes = await db.collection("goods_day_sales").where({
			day: dayTime
		}).update(up);
		console.log("saleRes", saleRes);
		//店铺每日销量
		saleRes = await db.collection("goods_shop_day_sales").where({
			day: dayTime
		}).update(shopSales);
		console.log("saleRes", saleRes);
	}
	return data;
};

/**
 * 获取日期字符串，例如：20200521
 */
const getDateString = function() {
	let day = new Date();
	let dayTime = day.getFullYear() + "";
	let month = day.getMonth() + 1;
	let dayNumber = day.getDate();

	if (month < 10) {
		dayTime += "0" + month;
	} else {
		dayTime += month;
	}
	if (dayNumber < 10) {
		dayTime += "0" + dayNumber;
	} else {
		dayTime += dayNumber;
	}
	return dayTime;
}

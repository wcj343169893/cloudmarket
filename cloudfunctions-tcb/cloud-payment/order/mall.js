'use strict';
const db = uniCloud.database();
const cmd = db.command;
const orderCollection = db.collection("cloud_orders");
const goodsDaySalesCollection = db.collection("cloud_goods_day_sales");
const goodsShopDaySalesCollection = db.collection("cloud_goods_shop_day_sales");
const {
	updateUserOrderCount,
	getDateString
} = require('base-common');
const {
	print
} = require('printers');
/**
 * 检查订单状态
 */
const checkOrder = async (data) => {
	let time = new Date().getTime();
	const order = await getOrderByConditions({
		_id: data.id
	}, {
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		freight: 1,
		state: 1,
		body: 1, //商品描述，100字以内
		yuding: 1,
		lastPayTime: 1
	});
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	order.payid = order.id;
	if (order.state !== 0) {
		data.message = "订单" + (order.state = 1 ? "已支付" : "已取消");
		return false;
	} else if (order.lastPayTime < time) {
		data.message = "订单已超时"
		return false;
	} else if (order.yuding) {
		//1.未支付，2已支付定金
		if (order.yuding.endTime > time) {
			if (order.yuding.state == 1) {
				data.message = "已支付定金"
				return false;
			}
			//支付预定订单
			order.totalMoney = order.yuding.price;
			order.payid = order.yuding.id;
			order.body = "定金：" + order.body;
			console.log("定金", order.yuding);
		} else {
			//支付尾款
			order.totalMoney = order.yuding.finishPaymentPrice + order.freight;
			order.body = "尾款：" + order.body;
			console.log("尾款", order.yuding);
		}
	} else {
		order.totalMoney += order.freight;
	}
	return order;
}

/**
 * 支付完成后，更新订单信息
 * @param {Object} event
 */
const updatePaymentInfo = async function(event) {
	//console.log(event);
	let time = new Date().toISOString();
	//reserve_
	let outTradeNo = event.outTradeNo;
	let conditions1 = {
		id: outTradeNo
	};
	let conditions = {
		id: outTradeNo,
		state: 0
	};
	let updateData = {
		state: 1,
		payInfo: {
			time: time,
			...event
		},
		modified: time
	};
	let type = "mall";
	//支付定金
	if (outTradeNo.indexOf("YD_") === 0) {
		conditions1 = {
			"yuding.id": outTradeNo,
		};
		conditions = {
			"yuding.id": outTradeNo,
			state: 0
		};
		type = "yuding";
		updateData = {
			"yuding.state": 1,
			"yuding.payInfo": {
				time: time,
				...event
			},
			modified: time
		}
	}
	//console.log(conditions);
	//console.log(updateData);
	let data = await orderCollection.where(conditions).update(updateData);
	//首次修改状态
	if (data.updated == 1) {
		let orderData = await orderCollection.where(conditions1).field({
			uid: 1,
			id: 1,
			goods: 1,
			shopid: 1,
			yuding: 1,
			shop: 1,
			juli: 1,
			address: 1,
			deliveryType: 1,
			deliveryHour: 1,
			created: 1,
			remark: 1,
			totalMoney: 1,
			totalDiscount: 1,
			deduction: 1,
			freight: 1,
			cartCount: 1
		}).limit(1).get();
		let order = orderData.data[0];
		if (type == "yuding") {
			//更新支付倒计时lastPayTime=yuding.finalPaymentEndTime
			let res = await orderCollection.doc(order._id).update({
				lastPayTime: order.yuding.finalPaymentEndTime
			});
			console.log("更新预定订单尾款最后支付时间", res);
		} else {
			//更新用户订单统计，用户待付款订单数
			let res = await updateUserOrderCount(order.uid, "payup", 1, "unpaid", order.shopid);
			console.log("updateUserOrderCount", res);
			// 打印订单
			res = await print(order, order.shopid);
			console.log("print", res);
		}

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
		let saleRes = await goodsDaySalesCollection.where({
			day: dayTime
		}).update(up);
		console.log("saleRes", saleRes);
		//店铺每日销量
		saleRes = await goodsShopDaySalesCollection.where({
			day: dayTime
		}).update(shopSales);
		console.log("saleRes", saleRes);
	}
	return data;
}

/**
 * 根据条件查询订单信息
 * @param {Object} conditions
 * @param {Object} fields
 */
const getOrderByConditions = async (conditions, fields) => {
	let data = await orderCollection.where(conditions).limit(1).field(fields).get();
	if (data.data.length == 0) {
		return false;
	}
	return data.data[0];
}
const refund = async (data) => {

}


module.exports = {
	checkOrder,
	updatePaymentInfo,
	refund
}

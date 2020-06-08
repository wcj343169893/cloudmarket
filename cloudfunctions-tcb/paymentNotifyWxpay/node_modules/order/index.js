const db = uniCloud.database();
const cmd = db.command;
const {
	updateUserOrderCount,
	getDateString
} = require('base-common');
/**
 * 订单支付完成之后
 */
const updateOrderPaymentInfo = async function(event) {
	console.log(event);
	let time = new Date().toISOString();
	//reserve_
	let outTradeNo = event.outTradeNo;
	let conditions1 = {
		_id: outTradeNo
	};
	let conditions = {
		_id: outTradeNo,
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
	let data = await db.collection("orders").where(conditions).update(updateData);
	//首次修改状态
	if (data.updated == 1) {
		let orderData = await db.collection("orders").where(conditions1).field({
			uid: 1,
			goods: 1,
			shopid: 1,
			yuding: 1,
			cartCount: 1
		}).limit(1).get();
		let order = orderData.data[0];
		if (type == "yuding") {
			//更新支付倒计时lastPayTime=yuding.finalPaymentEndTime
			let res = await db.collection("orders").doc(order._id).update({
				lastPayTime: order.yuding.finalPaymentEndTime
			});
			console.log("更新预定订单尾款最后支付时间", res);
		} else {
			//更新用户订单统计，用户待付款订单数
			let res = await updateUserOrderCount(order.uid, "payup", 1, "unpaid", order.shopid);
			console.log("updateUserOrderCount", res);
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
}
module.exports = {
	updateOrderPaymentInfo
}

'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	updateUserOrderCount
} = require('base-common');
const orderCollection = db.collection("orders");
const list = async (data, context) => {
	let page = +data.page;
	let limit = +data.limit;
	//0全部，1待付款，2已付款，待收货，3待评价
	//实际状态值：-2删除，-1取消，0未付款，1已付款，2已发货，3已收货待评价
	let state = data.state;
	let conditions = {
		shopid: data.shopid
	};
	let time = new Date().getTime();
	//'payup':"未发货", 'delivered':'已发货', 'received':'已收货', 'estimated':'已评价', 'refunded':'退款/售后'
	switch (state) {
		case "unpaid":
			//1待付款
			conditions["state"] = 0;
			conditions["lastPayTime"] = cmd.gt(time);
			break;
		case "payup":
			//2已付款,待发货
			conditions["state"] = 1;
			break;
		case "delivered":
			//已发货，待收货
			conditions["state"] = 2;
			break;
		case "received":
			//已发货，待收货
			conditions["state"] = 3;
			break;
		case "estimated":
			//已评价
			conditions["state"] = 4;
			break;
		case "refunded":
			//售后----待定
			conditions["state"] = 4;
			break;
		default:
			conditions["state"] = cmd.gt(-1);
			conditions["isDelete"] = 0;
			break;
	}
	let res = await orderCollection.where(conditions).orderBy("id", "desc").skip((page - 1) * limit).limit(limit).field({
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		state: 1,
		created: 1,
		goods: 1,
		cartCount: 1,
		address: 1,
		cancelStyle: 1,
		remark: 1,
		shopid: 1,
		"payInfo.time": 1,
		"payInfo.name": 1,
		yuding: 1,
		lastPayTime: 1
	}).get();
	if (res.data.length == 0) {
		//表示没有数据，默认提示语，可以省略
		//data.message = "暂无数据";
		return false;
	}
	return res.data;
}
/**
 * 订单发货
 */
const addDelivery = async (data) => {
	let order = await getOrderById(data);
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	if (order.state != 1) {
		data.message = "订单状态异常" + order.state;
		return false;
	}
	//@todo 如果是单个商品发货，需要对单个商品更新state状态，否则只更新全部
	let res = await orderCollection.doc(order._id).update({
		state: 2
	});
	//更新用户已发货和已收货
	let resUser = await updateUserOrderCount(order.uid, "delivered", 1, "payup", order.shopid);
	return res;
}
/**
 * 查詢单个訂單信息
 */
const detail = async (data) => {
	//所有字段
	return await getOrderById(data, {});
}
const getOrderById = async (data, field) => {
	let conditions = {
		_id: data._id,
		shopid: shopid
	};
	if (!field) {
		field = {
			state: 1,
			shopid: 1,
			uid: 1
		};
	}
	data = await orderCollection.where(conditions).field(field).get();
	if (data.data.length == 0) {
		return false;
	}
	return data.data[0];
}

module.exports = {
	list: list,
	detail: detail,
	addDelivery: addDelivery
}

'use strict';
const db = uniCloud.database();
/**
 * 订单支付
 */
exports.main = async (event, context) => {
	//id为5e9d61c31ee4a2004c55801e
	let id = event.id || event._id;
	let uid = +event.uid;
	let data = {};
	let order = await db.collection("orders").where({
		_id: id
	}).field({
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		state: 1
	}).limit(1).get();
	if (order.affectedDocs < 1) {
		return {
			"code": 404,
			"message": "订单不存在"
		};
	}
	data["order"] = order.data[0];
	if (data["order"].state !== 0) {
		return {
			"code": 404,
			"message": "订单" + (data["order"].state = 1 ? "已支付" : "已取消")
		};
	}
	//支付方式https://uniapp.dcloud.io/api/plugins/provider
	data["payment"] = [{
			id: 1,
			value: "wxpay",
			icon: "icon-weixinzhifu",
			name: "微信支付",
			usable: true,
			desc: "推荐使用微信支付"
		},
		{
			id: 2,
			value: "alipay",
			icon: "icon-alipay",
			name: "支付宝支付",
			usable: true,
			desc: ""
		}
	];
	//账户余额
	let userInfo = await db.collection("users").where({
		id: uid
	}).field({
		balance: 1
	}).get();
	let balance = 0;
	if (userInfo.affectedDocs > 0 && userInfo.data[0].balance > 0) {
		balance = userInfo.data[0].balance;
	}
	data.payment.push({
		id: 3,
		value: "balance",
		icon: "icon-erjiye-yucunkuan",
		name: "收入支付",
		usable: balance >= data.order.totalMoney,
		desc: "可用余额￥" + balance
	});

	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

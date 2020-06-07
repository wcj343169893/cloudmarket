'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
/**
 * 订单支付,余额支付,扣款成功后，统一回调订单处理
 */
exports.main = async (event, context) => {
	//id为5e9d61c31ee4a2004c55801e
	let {
		customUserId
	} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let id = event.id || event._id;
	let uid = +customUserId;
	let ispay = event.ispay;
	let data = {};
	if (!id) {
		return {
			"code": 404,
			"message": "订单ID不存在"
		};
	}
	let order = await db.collection("orders").where({
		_id: id
	}).field({
		id: 1,
		lastPayTime: 1,
		totalMoney: 1,
		totalDiscount: 1,
		body: 1,
		yuding: 1,
		state: 1
	}).limit(1).get();
	if (order.data.length < 1) {
		return {
			"code": 404,
			"message": "订单不存在"
		};
	}
	order = order.data[0];
	let time = new Date().getTime();
	if (order.state !== 0) {
		return {
			"code": 404,
			"message": "订单" + (order.state = 1 ? "已支付" : "已取消")
		};
	} else if (order.lastPayTime < time) {
		return {
			code: 404,
			message: "订单已超时"
		}
	} else if (order.yuding) {
		//1.未支付，2已支付定金
		if (order.yuding.endTime > time) {
			if (order.yuding.state == 1) {
				return {
					code: 404,
					message: "已支付定金"
				}
			}
			//支付预定订单
			id = order.yuding.id;
			order.totalMoney = order.yuding.price;
			order.body = "定金：" + order.body;
			order.yuding.payType="dingjin";
		} else {
			//支付尾款
			order.totalMoney = order.yuding.finishPaymentPrice;
			order.body = "尾款：" + order.body;
			order.yuding.payType="weikuan";
		}
	}
	data["order"] = order;
	//如果是预定订单，需要在有效期内支付
	//账户余额
	let userInfo = await db.collection("users").where({
		id: uid
	}).field({
		balance: 1
	}).get();
	let balance = 0;
	if (userInfo.data.length > 0 && userInfo.data[0].balance > 0) {
		//处理余额为2位小数
		balance = userInfo.data[0].balance.toFixed(2);
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
		},
		{
			id: 3,
			value: "balance",
			icon: "icon-erjiye-yucunkuan",
			name: "余额支付",
			usable: balance >= data.order.totalMoney,
			usableText: "余额不足,请选择其他支付方式",
			desc: "可用余额￥" + balance
		}
	];

	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

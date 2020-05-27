'use strict';
const db = uniCloud.database();

const {
	addUserBalanceLog
} = require('base-common');
const {
	getUserInfo
} = require('token');
/**
 * 订单支付,余额支付,扣款成功后，统一回调订单处理
 */
exports.main = async (event, context) => {
	//id为5e9d61c31ee4a2004c55801e
	let {
		customUserId
	} = await getUserInfo(event);
	if(customUserId < 1){
		return {
			"code": 404,
			"message": "用户信息不存在",
		};
	}
	let id = event.id || event._id;
	//let uid = +event.uid;
	let uid = customUserId;
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
		state: 1
	}).limit(1).get();
	if (order.data.length < 1) {
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
	//支付订单,最好支持事物
	if (ispay) {
		const cmd = db.command;
		let res = await db.collection("users").where({
			id: uid,
			balance: cmd.gte(data.order.totalMoney)
		}).update({
			balance: cmd.inc(data.order.totalMoney * -1)
		});
		console.log("余额付款", res);
		if (res.updated < 1) {
			//付失败
			return {
				"code": 404,
				"message": "余额不足,付款失败"
			};
		} else {
			let yue = balance - data.order.totalMoney;
			//记录余额变动历史user_balance_logs
			let log =await addUserBalanceLog({
				uid: uid,
				type: 0, //0支出，1收入
				balance: yue,
				orderId: id,
				money: data.order.totalMoney,
				description: "购买:" + data.order.body,
			});
			let resultData = await uniCloud.callFunction({
				name: "paymentResultOrder",
				data: {
					outTradeNo: id,
					transactionId:log.id,
					uid: uid,
					type: "balance",
					name: "余额支付",
					balance: yue,
				}
			})
			console.log(resultData);
			
			data = resultData;
		}
	} else {
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
				usableText:"余额不足,请选择其他支付方式",
				desc: "可用余额￥" + balance
			}
		];
	}

	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

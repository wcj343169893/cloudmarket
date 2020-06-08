'use strict';
/**
 * 插件市场导入
 * https://github.com/dcloudio/uniCloud-server-plugin/tree/master/src/entry/uni-pay
 */
const uniPay = require('unipay');
const db = uniCloud.database();
const {
	getAlipayConfig,
	getWxPayConfig
} = require('configs');

const {
	addUserBalanceLog
} = require('base-common');
const {
	updateOrderPaymentInfo
} = require('order');
const auth = uniCloud.auth();
/**
 * 支付宝/微信
 */
exports.main = async (event, context) => {
	let {
		customUserId
	} = await auth.getUserInfo();
	console.log("customUserId", customUserId);
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let uid = +customUserId;
	let uniPayIns;
	let id = event.id; //订单号,需要获取订单金额
	let order = await db.collection("orders").doc(id).field({
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		state: 1,
		body: 1, //商品描述，100字以内
		yuding: 1,
		lastPayTime: 1
	}).get();
	let time = new Date().getTime();
	if (order.data.length < 1) {
		return {
			code: 404,
			message: "订单不存在"
		}
	}
	order = order.data[0];
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
			order.totalMoney = order.yuding.price;
			id = order.yuding.id;
			order.body = "定金：" + order.body;
			console.log("定金", id, order.yuding);
		} else {
			//支付尾款
			order.totalMoney = order.yuding.finishPaymentPrice;
			order.body = "尾款：" + order.body;
			console.log("尾款", order.yuding);
		}
	}
	//预定结构
	/* {
		id:xxxx,yuding_开头
		price:123,
		state:1,
		beginTime:159777777,
		endTime:159888888,
		finnalPaymentBeginTime:160000000,
		finnalPaymentEndTime:16100000,
		sku_ids:[111,222,333],
		deduction:100
	} */
	console.log(event);
	// 支付结果通知地址,经过测试，http地址也能作为通知地址
	// let domain = "https://cloud-market-000.service.tcloudbase.com/";
	let domain = "http://api.baidu.org/";
	let notifyUrl = "";
	if (event.provider == "wxpay") {
		notifyUrl = domain + "notify/wxpay"
		uniPayIns = uniPay.initWeixin(getWxPayConfig());
	} else if (event.provider == "alipay") {
		notifyUrl = domain + "notify/alipay"
		uniPayIns = uniPay.initAlipay(getAlipayConfig())
	} else if (event.provider == "balance") {
		//直接扣费
		return await balancePay(uid, order, id);
	} else {
		return {
			code: 404,
			message: "支付方式错误"
		}
	}

	let orderInfo = await uniPayIns.getOrderInfo({
		openid: event.openid ? event.openid : "", //支付宝小程序、微信小程序必填
		subject: order.body, // 微信支付时不可填写此项
		body: order.body,
		outTradeNo: id, //订单号
		totalFee: parseInt(order.totalMoney * 100), // 金额，单位分
		notifyUrl: notifyUrl // 支付结果通知地址
	})
	return {
		code: 200,
		message: "获得成功",
		data: orderInfo
	};
};

/**
 * 余额支付
 * @param {Object} uid 当前用户id
 * @param {Object} order 订单信息
 * @param {Object} id 支付单号
 */
const balancePay = async function(uid, order, id) {
	console.log("余额支付", uid, order, id);
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
	if (balance < order.totalMoney) {
		//付失败
		return {
			"code": 404,
			"message": "余额不足,付款失败"
		};
	}
	//需要扣费
	if (order.totalMoney > 0) {
		const cmd = db.command;
		let res = await db.collection("users").where({
			id: uid,
			balance: cmd.gte(order.totalMoney)
		}).update({
			balance: cmd.inc(order.totalMoney * -1)
		});
		console.log("余额付款", res);
		if (res.updated < 1) {
			//付失败
			return {
				"code": 404,
				"message": "余额不足,付款失败"
			};
		}
	}
	let yue = balance - order.totalMoney;
	//记录余额变动历史user_balance_logs
	let log = await addUserBalanceLog({
		uid: uid,
		type: 0, //0支出，1收入
		balance: yue,
		orderId: id,
		money: order.totalMoney,
		description: "购买:" + order.body,
	});
	//调用订单处理方法
	let resultData = await updateOrderPaymentInfo({
		outTradeNo: id,
		transactionId: log.id,
		uid: uid,
		tradeStatus: "TRADE_SUCCESS",
		totalFee: parseInt(order.totalMoney * 100),
		type: "balance",
		name: "余额支付",
		balance: yue,
	});
	console.log(resultData);
	return {
		"code": 200,
		"message": "支付成功",
		data: resultData
	};
}

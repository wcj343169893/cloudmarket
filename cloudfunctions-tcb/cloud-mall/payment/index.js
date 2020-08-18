'use strict';
/**
 * 插件市场导入
 * https://github.com/dcloudio/uniCloud-server-plugin/tree/master/src/entry/uni-pay
 */
const uniPay = require('unipay');
const db = uniCloud.database();
const {
	getPaymentNotifyUrl,
	getPaymentConfig
} = require('configs');
const {
	addUserBalanceLog
} = require('base-common');
const {
	updateOrderPaymentInfo
} = require('order');
const orderCollection = db.collection("cloud_orders");
const userCollection = db.collection("uni-id-users");
/**
 * 微信、支付宝支付
 */
const unipayment = async (data, context) => {
	const order = await checkOrder(data);
	if (!order) {
		return false;
	}
	let config = getPaymentConfig(context.PLATFORM, data.provider);
	if (!config) {
		//其他支付
		return {
			code: 404,
			message: "支付方式错误"
		}
	}
	console.log(config);
	let uniPayIns = uniPay[config["uniPay"]](config);
	// 支付结果通知地址,经过测试，http地址也能作为通知地址
	let notifyUrl = getPaymentNotifyUrl(context.PLATFORM, data.provider);
	let orderInfo = await uniPayIns.getOrderInfo({
		openid: data.openid ? data.openid : "", //支付宝小程序、微信小程序必填
		subject: order.body, // 微信支付时不可填写此项
		body: order.body,
		outTradeNo: order.payid, //订单号
		totalFee: parseInt(order.totalMoney * 100), // 金额，单位分
		notifyUrl: notifyUrl // 支付结果通知地址
	});
	return orderInfo;
}
/**
 * 余额支付
 */
const balance = async (data, context) => {
	const order = await checkOrder(data);
	if (!order) {
		return false;
	}
	return await balancePay(order, data.uid, context.userInfo);
}
/**
 * 订单支付信息
 * @param {Object} data
 * @param {Object} context
 */
const info = async (data, context) => {
	const order = await checkOrder(data);
	if (!order) {
		return false;
	}
	//账户余额
	let balance = 0;
	if (context.userInfo.balance) {
		//处理余额为2位小数
		balance = context.userInfo.balance.toFixed(2);
	}
	let platform = context.PLATFORM;
	//支付方式https://uniapp.dcloud.io/api/plugins/provider
	data["order"] = order;
	data["payment"] = [];

	//获取支付配置
	let config = getPaymentConfig(context.PLATFORM);
	let index = 1;
	for (let payname in config) {
		data["payment"].push({
			id: index,
			value: payname,
			icon: "icon-" + payname,
			name: config[payname].name + "支付",
			usable: payname == 'balance' ? balance >= data.order.totalMoney : true,
			usableText: payname == 'balance' ? "余额不足,请选择其他支付方式" : "",
			desc: payname == 'balance' ? "可用余额￥" + balance : ""
		});
		index++;
	}
	return data;
}
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
/**
 * 余额支付
 * @param {Object} uid 当前用户id
 * @param {Object} order 订单信息
 * @param {Object} id 支付单号
 */
const balancePay = async (order, uid, userInfo) => {
	console.log("余额支付");
	let balance = 0;
	if (userInfo.balance && userInfo.balance > 0) {
		//处理余额为2位小数
		balance = userInfo.balance.toFixed(2);
	}
	if (balance < order.totalMoney) {
		//付失败
		data.message = "余额不足,付款失败";
		return false;
	}
	//需要扣费
	if (order.totalMoney > 0) {
		const cmd = db.command;
		let res = await userCollection.where({
			_id: uid,
			balance: cmd.gte(order.totalMoney)
		}).update({
			balance: cmd.inc(order.totalMoney * -1)
		});
		console.log("余额付款", res);
		if (res.updated < 1) {
			//付失败
			data.message = "余额不足,付款失败";
			return false;
		}
	}
	let yue = balance - order.totalMoney;
	//记录余额变动历史user_balance_logs
	let log = await addUserBalanceLog({
		uid: uid,
		type: 0, //0支出，1收入
		balance: yue,
		orderId: order.payid,
		money: order.totalMoney,
		description: "购买:" + order.body,
	});
	console.log("addUserBalanceLog", log)
	//调用订单处理方法
	let resultData = await updateOrderPaymentInfo({
		outTradeNo: order.payid,
		transactionId: log.id,
		uid: uid,
		tradeStatus: "TRADE_SUCCESS",
		totalFee: parseInt(order.totalMoney * 100),
		type: "balance",
		name: "余额支付",
		balance: yue,
	});
	console.log("updateOrderPaymentInfo", resultData);
	return resultData;
}



module.exports = {
	wxpay: unipayment,
	alipay: unipayment,
	balance,
	info
}

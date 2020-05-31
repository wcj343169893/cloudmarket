'use strict';
/**
 * 插件市场导入
 * https://github.com/dcloudio/uniCloud-server-plugin/tree/master/src/entry/uni-pay
 */
const uniPay = require('uni-pay');
const db = uniCloud.database();
const {
	getAlipayConfig,
	getWxPayConfig
} = require('configs');
/**
 * 支付宝/微信
 */
exports.main = async (event, context) => {
	let uniPayIns;
	let id = event.id; //订单号,需要获取订单金额
	let order = await db.collection("orders").doc(id).field({
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		state: 1,
		body: 1, //商品描述，100字以内
		yuding:1,
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
	if (order.state == 1) {
		return {
			code: 200,
			message: "订单已支付"
		}
	} else if (order.state == 0 && order.lastPayTime < time) {
		return {
			code: 404,
			message: "订单已超时"
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
	// let domain = "https://cloud-market-3c5868.service.tcloudbase.com/";
	let domain = "http://api.cjblog.org/";
	let notifyUrl = "";
	if (event.provider == "wxpay") {
		notifyUrl = domain + "notify/wxpay"
		uniPayIns = uniPay.initWeixin(getWxPayConfig());
	} else if (event.provider == "alipay") {
		notifyUrl = domain + "notify/alipay"
		uniPayIns = uniPay.initAlipay(getAlipayConfig())
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

'use strict';
const uniPay = require('unipay');
const {
	getAlipayConfig
} = require('configs');
const {
	updateOrderPaymentInfo
} = require('order');
exports.main = async (event, context) => {
	const uniPayIns = uniPay.initAlipay(getAlipayConfig())
	let res = await uniPayIns.verifyPaymentNotify(event);
	console.log("alipay res", res);
	//验证成功
	if (res.resultCode == "SUCCESS") {
		res["type"] = "alipay";
		res["name"] = "支付宝支付";
		//调用订单处理
		let data = await updateOrderPaymentInfo(res);
		console.log(data);
	}
	return "success";
};

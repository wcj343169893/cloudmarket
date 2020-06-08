'use strict';
const uniPay = require('unipay');
const {
	getWxPayConfig
} = require('configs');
const {
	updateOrderPaymentInfo
} = require('order');
exports.main = async (event, context) => {
	const uniPayIns = uniPay.initWeixin(getWxPayConfig())
	let res = await uniPayIns.verifyPaymentNotify(event);
	console.log("wxpay res", res);
	//验证成功
	if (res.resultCode == "SUCCESS") {
		res["type"] = "wxpay";
		res["name"] = "微信支付";
		let data = await updateOrderPaymentInfo(res);
		console.log(data);
	}
	return "success";
};

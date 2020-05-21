'use strict';
const uniPay = require('uni-pay');
const {
	getWxPayConfig
} = require('configs');
exports.main = async (event, context) => {
	const uniPayIns = uniPay.initWeixin(getWxPayConfig())
	let res = await uniPayIns.verifyPaymentNotify(event);
	console.log("wxpay res", res);
	//验证成功
	if (res.resultCode == "SUCCESS") {
		res["type"] = "wxpay";
		res["name"] = "微信支付";
		//调用订单处理
		let data = await uniCloud.callFunction({
			name: "paymentResultOrder",
			data: res
		})
		console.log(data);
	}
	return "success";
};

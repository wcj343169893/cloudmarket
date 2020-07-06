'use strict';
const uniPay = require('unipay');
const {
	getPaymentNotifyUrl,
	getPaymentConfig
} = require('configs');
const {
	updateOrderPaymentInfo
} = require('order');
exports.main = async (event, context) => {
	let paths = event.path.split("/");
	if (paths.length < 3) {
		return "地址不符合要求";
	}
	let platform = paths[1];
	let provider = paths[2];
	let config = getPaymentConfig(platform, provider);
	if (!config) {
		//其他支付
		return "支付方式不存在";
	}
	let uniPayIns = uniPay[config["uniPay"]](config);
	let res = await uniPayIns.verifyPaymentNotify(event);
	console.log(provider + " res", res);
	//验证成功
	if (res.resultCode == "SUCCESS") {
		res["type"] = provider;
		res["name"] = config["name"] + "支付";
		//调用订单处理
		let data = await updateOrderPaymentInfo(res);
		console.log(data);
	}
	return "success";
};

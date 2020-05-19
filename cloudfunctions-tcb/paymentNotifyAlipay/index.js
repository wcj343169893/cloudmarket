'use strict';
const uniPay = require('uni-pay');
const {
	getAlipayConfig
} = require('configs');
exports.main = async (event, context) => {
	const uniPayIns = uniPay.initAlipay(getAlipayConfig())
	let res = await uniPayIns.verifyPaymentNotify(event)
	return event
};

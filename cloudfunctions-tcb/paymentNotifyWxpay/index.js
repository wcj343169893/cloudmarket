'use strict';
const uniPay = require('uni-pay');
const {
	getWxPayConfig
} = require('configs');
exports.main = async (event, context) => {
	const uniPayIns = uniPay.initWeixin(getWxPayConfig())
	let res = await uniPayIns.verifyPaymentNotify(event);
	return event
};

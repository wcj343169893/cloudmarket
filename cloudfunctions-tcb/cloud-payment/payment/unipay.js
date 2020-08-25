'use strict';
/**
 * 插件市场导入
 * https://github.com/dcloudio/uniCloud-server-plugin/tree/master/src/entry/uni-pay
 */
const uniPay = require('unipay');
const {
	getPaymentConfig,
	getPaymentNotifyUrl
} = require('configs');
const models = {
	/**
	 * app支付配置
	 * @param {Object} order
	 * @param {Object} data
	 * @param {Object} context
	 */
	async app(order, data, context) {
		let config = getPaymentConfig(context.PLATFORM, data.provider);
		if (!config) {
			//其他支付
			data.message = "支付方式错误";
			return false;
		}
		let uniPayIns = uniPay[config["uniPay"]](config);
		// 支付结果通知地址,经过测试，http地址也能作为通知地址
		let notifyUrl = getPaymentNotifyUrl(context.PLATFORM, data.provider, data.model);
		return await uniPayIns.getOrderInfo({
			openid: data.openid ? data.openid : "", //支付宝小程序、微信小程序必填
			subject: order.body, // 微信支付时不可填写此项
			body: order.body,
			outTradeNo: order.payid, //订单号
			totalFee: parseInt(order.totalMoney * 100), // 金额，单位分
			notifyUrl: notifyUrl // 支付结果通知地址
		});
	},
	/**
	 * 验证请求的数据是否合法
	 * @param {Object} data
	 * @param {Object} platform
	 * @param {Object} provider
	 */
	async verify(data, platform, provider) {
		let config = getPaymentConfig(platform, provider);
		if (!config) {
			//其他支付
			data.message = "支付方式不存在";
			return false;
		}
		let uniPayIns = uniPay[config["uniPay"]](config);
		return await uniPayIns.verifyPaymentNotify(data);
	}
}
module.exports = models;

'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	getPaymentConfig
} = require('configs');
const models = {
	type: "delivery",
	/**
	 * app支付配置
	 * @param {Object} order
	 * @param {Object} data
	 * @param {Object} context
	 */
	async app(order, data, context) {
		let uid = data.uid;
		console.log("货到付款");
		let platform = context.PLATFORM;
		let config = getPaymentConfig(platform)[this.type];
		return {
			callback: "paySuccess",
			outTradeNo: order.payid,
			uid: uid,
			platform: platform,
			module: data.module,
			tradeStatus: "TRADE_SUCCESS",
			totalFee: 0,
			typeName: "",
			type: this.type,
			name: config.name
		};
	},
	/**
	 * 验证请求的数据是否合法
	 * @param {Object} data
	 * @param {Object} platform
	 * @param {Object} provider
	 */
	async verify(data, platform, provider) {},
	/**
	 * 资金退款
	 * @param {Object} order
	 */
	async refund(order) {
		order.message = "";
		return true;
	}
}
module.exports = models;

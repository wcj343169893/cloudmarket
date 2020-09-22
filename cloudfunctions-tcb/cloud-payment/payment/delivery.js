'use strict';
const db = uniCloud.database();
const cmd = db.command;
const models = {
	/**
	 * app支付配置
	 * @param {Object} order
	 * @param {Object} data
	 * @param {Object} context
	 */
	async app(order, data, context) {
		let uid = data.uid;
		console.log("货到付款");
		return {
			callback: "paySuccess",
			outTradeNo: order.payid,
			uid: uid,
			tradeStatus: "TRADE_SUCCESS",
			totalFee: 0,
			type: "delivery",
			name: this.getName()
		};
	},
	/**
	 * 验证请求的数据是否合法
	 * @param {Object} data
	 * @param {Object} platform
	 * @param {Object} provider
	 */
	async verify(data, platform, provider) {},
	getName(provider) {
		return "货到付款"
	}
}
module.exports = models;

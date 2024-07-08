'use strict';
const commonPay = require('./unipay');
const {
	getPaymentConfig,
	getPaymentNotifyUrl,
	getStringFormat
} = require('configs');
const models = {
	...commonPay,
	getUniPayInsV3(data) {
		let config = getPaymentConfig(data.platform, data.type, true);
		this.paymentConfig = config;
		const uniPayIns = this.uniPay.initWeixinV3(config)
		console.log("config", config)
		return uniPayIns;
	},
	/**
	 * 微信企业转账到微信零钱，开通此功能需要特殊的要求
	 * @param {Object} data
	 * @param {string} platform 平台
	 * @param {string} type 支付方式
	 * https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_2
	 *@link  https://pay.weixin.qq.com/docs/merchant/apis/batch-transfer-to-balance/transfer-batch/initiate-batch-transfer.html
	 */
	async transfers(data, platform, type) {
		console.log("transfers", data)
		let uniPayIns = this.getUniPayInsV3({
			platform,
			type
		});
		let transfer_detail_list = [{
			out_detail_no: data.partner_trade_no,
			transfer_amount: data.amount, //单位分
			transfer_remark: desc,
			openid: data.openid,
		}];

		let total_amount = data.amount
		let total_num = 1
		const requestOptions = {
			appid: this.paymentConfig.appId,
			out_batch_no: data.partner_trade_no,
			batch_name: desc,
			batch_remark: desc,
			total_amount,
			total_num,
			transfer_detail_list,
		}
		try {
			const result = await uniPayIns.transfers(requestOptions);
			return result;
		} catch (e) {
			console.log("转账失败")
			console.log(e)
			//TODO handle the exception
		}
		return false;
	},
}
module.exports = models;
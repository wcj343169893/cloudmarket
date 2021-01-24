'use strict';
const commonPay = require('./unipay');
const models = {
	...commonPay,
	/**
	 * 微信企业转账到微信零钱，开通此功能需要特殊的要求
	 * @param {Object} data
	 * @param {string} platform 平台
	 * @param {string} type 支付方式
	 * https://pay.weixin.qq.com/wiki/doc/api/tools/mch_pay.php?chapter=14_2
	 */
	async transfers(data, platform, type) {
		console.log("transfers", data)
		let uniPayIns = this.getUniPayIns({
			platform,
			type
		});
		uniPayIns.paths["mmpaymkttransfers"] = "/mmpaymkttransfers/promotion/transfers"
		//https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers
		const requestOptions = {
			...data,
			check_name: "NO_CHECK",
			...uniPayIns._getPublicParams()
		}
		console.log("requestOptions", requestOptions)
		try {
			//必须验证证书
			const result = await uniPayIns._requestWxpay(requestOptions, 'mmpaymkttransfers', true);
			console.log(result)
			return result
		} catch (e) {
			console.log(e)
		}
		return false;
	},
}
module.exports = models;

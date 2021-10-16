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
		let publicParams = uniPayIns._getPublicParams();
		const requestOptions = {
			...data,
			check_name: "NO_CHECK",
			mch_appid: publicParams.appid, //商户账号appid字段名不同
			mchid: publicParams.mchId, //微信支付分配的商户号
			nonce_str:publicParams.nonceStr
		}
		console.log("requestOptions", requestOptions)
		try {
			//简易版XML转Object，只可在微信支付时使用，不支持嵌套
			uniPayIns.parseXML = function(xml) {
				const xmlReg = /<(?:xml|root).*?>([\s|\S]*)<\/(?:xml|root)>/
				const str = xmlReg.exec(xml)[1]
				const obj = {}
				const nodeReg = /<(.*?)>(?:<!\[CDATA\[){0,1}(.*?)(?:\]\]>){0,1}<\/.*?>/g
				let matches = null
				// eslint-disable-next-line no-cond-assign
				while ((matches = nodeReg.exec(str))) {
					obj[matches[1]] = matches[2]
				}
				return obj
			}
			//格式化
			uniPayIns._parse = function(xml, apiName, signType) {
				const json = this.parseXML(xml)
				console.log("json", json)
				if (json.return_code === 'FAIL') throw new Error(`${json.return_msg}`)
				if (apiName !== 'getSandboxKey') {
					if (json.mch_appid !== this.options.appId) throw new Error('appId不匹配')
					if (json.mchid !== this.options.mchId) throw new Error('mchId不匹配')
					// 特殊处理appId
					json.app_id = json.mch_appid
					delete json.mch_appid
				}
			
				if (json.result_code === 'FAIL') {
					throw new Error(`${json.err_code} ${json.err_code_des}`)
				}
				return this._normalizeResult(json, apiName)
			}
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

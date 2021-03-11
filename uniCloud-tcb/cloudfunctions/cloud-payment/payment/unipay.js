'use strict';
/**
 * 插件市场导入
 * https://github.com/dcloudio/uniCloud-server-plugin/tree/master/src/entry/uni-pay
 */
const uniPay = require('unipay');
const {
	getPaymentConfig,
	getPaymentNotifyUrl,
	getStringFormat
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
			data.message = getStringFormat("payment.error");
			return false;
		}
		let openid = "";
		if (context.userInfo.wx_openid) {
			openid = context.userInfo.wx_openid[context.PLATFORM];
		}
		let uniPayIns = uniPay[config["uniPay"]](config);
		// 支付结果通知地址,经过测试，http地址也能作为通知地址
		let notifyUrl = getPaymentNotifyUrl(context.PLATFORM, data.provider, data.module);
		let totalFee = parseInt(order.totalMoney * 100);
		if (order.shop && order.shop.currency != "cny" && order.shop.exchangeRate && order.shop.exchangeRate !=
			1) {
			totalFee = parseInt(order.totalMoney * order.shop.exchangeRate * 100);
		}
		let requestOptions = {
			//openid: openid, //支付宝小程序、微信小程序必填
			subject: order.body.substr(0, 20), // 微信支付时不可填写此项
			body: order.body.substr(0, 30),
			outTradeNo: order.outTradeNo, //订单号
			totalFee, // 金额，单位分
			notifyUrl: notifyUrl // 支付结果通知地址
		}
		//微信服务商模式https://pay.weixin.qq.com/wiki/doc/api/jsapi_sl.php?chapter=9_1
		if (config.sub_mch_id) {
			let params = Object.assign(requestOptions, {
				sub_mch_id: config.sub_mch_id,
			});
			if (config.sub_appid) {
				params.sub_openid = openid;
				params.sub_appid = config.sub_appid;
			} else {
				params.openid = openid;
			}
			console.log("params", params);
			const orderResult = await uniPayIns.unifiedOrder(params)
			if (!orderResult.prepayId) {
				throw new Error(orderResult.errMsg || '获取prepayId失败')
			}
			console.log("orderResult", orderResult);
			//以子商户appid发起支付
			if (config.sub_appid) {
				uniPayIns.options.appId = config.sub_appid;
			}
			const payParams = uniPayIns._getPayParamsByPrepayId(
				orderResult.prepayId,
				params.signType || uniPayIns.options.signType
			)
			console.log("params", params);
			return Object.assign(orderResult, payParams)
		} else {
			//普通模式//支付宝小程序、微信小程序必填
			requestOptions.openid = openid;
			return await uniPayIns.getOrderInfo(requestOptions);
		}
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
			data.message = getStringFormat("payment.notExist");
			return false;
		}
		let uniPayIns = uniPay[config["uniPay"]](config);
		return await uniPayIns.verifyPaymentNotify(data);
	},
	/**
	 * 资金退款
	 * @param {Object} order
	 */
	async refund(order) {
		let payInfo = order.payInfo;
		console.log(order)
		delete order.payInfo;
		delete order.uid;
		let config = getPaymentConfig(payInfo.platform, payInfo.type, true);
		let uniPayIns = uniPay[config["uniPay"]](config);
		let payName = payInfo.typeName || payInfo.name;
		//微信服务商模式
		if (config.sub_mch_id) {
			order.sub_mch_id = config.sub_mch_id;
			if (config.sub_appid) {
				order.sub_appid = config.sub_appid;
			}
		}
		try {
			let res = await uniPayIns.refund(order);
			console.log("unipay refund", JSON.stringify(res));
			//return `退款将退回至您的${payname}账户，请注意查收`;
			return getStringFormat("payment.refundSuccessContent", {
				payName
			});
		} catch (e) {
			console.log("unipay refund 退款失败");
			console.log(JSON.stringify(e))
		}
		return getStringFormat("payment.refundFailed", {
			payName
		});
	},
	/**
	 * 获取支付信息
	 * @param {Object} config
	 */
	getPaymentInfo(config) {
		return {
			name: config.payName,
			usable: true,
			usableText: "",
			desc: ""
		}
	},
	getPaymentConfig,
	uniPay,
	getUniPayIns(data) {
		let config = getPaymentConfig(data.platform, data.type, true);
		let uniPayIns = uniPay[config["uniPay"]](config);
		console.log("config", config)
		return uniPayIns;
	}
}
module.exports = models;

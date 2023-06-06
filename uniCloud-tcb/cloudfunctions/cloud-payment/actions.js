'use strict';
const db = uniCloud.database();
const cmd = db.command;
const crypto = require('crypto');
const {
	getPaymentConfig
} = require('configs');
/**
 * 引入子模块（必须），默认会找到对于目录下的index.js
 */
const orders = {
	mall: require('./order/mall'),
	yuding: require('./order/yuding'),
}
/**
 * 支付方式
 */
const payments = {
	wxpay: require('./payment/wxpay'),
	alipay: require('./payment/unipay'),
	balance: require('./payment/balance'),
	delivery: require('./payment/delivery'),
}
const actions = {
	/**
	 * 获得支付订单信息
	 * @param {Object} data
	 * @param {Object} module
	 * @param {Object} context
	 */
	async info(data, module, context) {
		//获得支付订单信息
		let order = await orders[module].checkOrder(data);
		if (!order) {
			return false;
		}
		//账户余额
		let balance = 0;
		if (context.userInfo.balance) {
			//处理余额为2位小数
			balance = context.userInfo.balance.toFixed(2);
		}
		let platform = context.PLATFORM;
		//支付方式https://uniapp.dcloud.io/api/plugins/provider
		data["order"] = order;
		data["payment"] = [];

		//获取支付配置
		let config = getPaymentConfig(context.PLATFORM);
		let index = 1;
		for (let payname in config) {
			//排除订单不可用的支付方式
			if (!order.excludePayment || order.excludePayment.indexOf(payname) == -1) {
				let payInfo = payments[payname].getPaymentInfo(config[payname], order, balance);
				data["payment"].push({
					id: index,
					value: payname,
					icon: "icon-" + payname,
					...payInfo
				});
				index++;
			}
		}
		return data;
	},
	/**
	 * 支付参数，余额支付直接扣费，并回调支付完成方法
	 * @param {Object} data
	 * @param {Object} module
	 * @param {Object} context
	 */
	async pay(data, module, context) {
		let provider = data.provider;
		//获得支付订单信息
		let order = await orders[module].checkOrder(data);
		if (!order) {
			return false;
		}
		//如果订单强制切换通知module，则这里优先，正常情况下不需要切换
		data.module = order.module || module;
		//生成支付id，每个outTradeNo不同，固定长度30位，精确到毫秒
		order.outTradeNo = [(new Date()).getTime(), crypto.createHash("md5").update(data.uid).digest("hex")
				.substring(0, 17)
			]
			.join("");
		//更新支付id
		let res = await orders[data.module].updateOutTradeNo(order);
		console.log("更新订单outTradeNo", res)
		//支付方式构造支付参数
		res = await payments[provider].app(order, data, context);
		if (!res) {
			return false;
		} else if (res.callback) {
			return this[res.callback](res, data.module);
		}
		return res;
	},
	/**
	 * 第三方支付统一回调
	 */
	async notify(data, context) {
		console.log("notify path", data.path);
		let paths = data.path.split("/");
		if (paths.length < 3) {
			return "地址不符合要求";
		}
		//平台app-plus
		let platform = paths[1];
		//支付类型，wxpay，alipay
		let provider = paths[2];
		//新增第三个参数，支付模块
		let module = paths[3];
		let res = await payments[provider].verify(data, platform, provider);
		//获取支付配置
		let config = getPaymentConfig(platform)[provider];
		console.log(paths, res);
		if (!res) {
			return data.message;
		}
		//验证成功
		if (res.resultCode == "SUCCESS") {
			let payInfo = payments[provider].getPaymentInfo(config);
			res["platform"] = platform;
			res["module"] = module;
			res["couponCount"] = res.couponList ? res.couponList.length : 0;
			//获取支付工具的名字，wxpay，alipay
			res["type"] = provider;
			res["typeName"] = config.name;
			res["name"] = payInfo.name;
			res = await this.paySuccess(res, module);
			console.log("paysuccess result", res)
		}
		return "success";
	},
	/**
	 * 支付成功
	 * @param {Object} data
	 * @param {Object} module
	 */
	async paySuccess(data, module) {
		console.log("开始处理分订单", module);
		//调用订单处理
		let result = await orders[module]["updatePaymentInfo"](data);
		console.log(result);
		return result;
	},
	/**
	 * 退款定时器
	 */
	async refund(event, context) {
		//所有模块都有可能退款
		for (let model in orders) {
			let orderList = await orders[model].getRefundOrders();
			if (orderList && orderList.length > 0) {
				for (let order of orderList) {
					let res = await payments[order.payInfo.type].refund({
						payInfo: order.payInfo,
						uid: order.uid,
						outTradeNo: order.payInfo.outTradeNo,
						outRefundNo: order.id,
						totalFee: order.payInfo.totalFee, //支付总金额
						refundFee: order.fee, //退款金额
						refundDesc: order.description, //退款原因
					}, event, context);
					console.log("支付端口退款成功", order._id, res);
					//退款处理成功
					if (res && res.code == 0) {
						let res2 = await orders[model].refundSuccess(order, res);
						console.log("订单端口处理结果", res2);
					} else {
						await orders[model].refundFailed(order, res);
					}
				}
			} else {
				console.log("refund无需处理", model)
			}
		}
		await this.transfers();
	},
	/**
	 * 账户提现，只查询审核通过的订单
	 */
	async transfers() {
		const userCashoutCollection = db.collection("cloud_user_cashouts");
		const userBalanceLogCollection = db.collection("cloud_user_balance_logs");
		let {
			data
		} = await userCashoutCollection.where({
			state: 1
		}).orderBy("created", "asc").limit(10).get();
		if (data.length > 0) {
			for (let cash of data) {
				let type = "",
					platform = "app-plus",
					openid = "";
				//优先微信
				if (cash.user.wx_openid) {
					type = "wxpay";
					if (cash.user.wx_openid["app-plus"]) {
						//app平台微信openid
						openid = cash.user.wx_openid["app-plus"];
					} else if (cash.user.wx_openid["mp-weixin"]) {
						//微信小程序平台openid
						openid = cash.user.wx_openid["mp-weixin"];
						platform = "mp-weixin";
					}
				} else if (cash.user.ali_openid) {
					type = "alipay";
					openid = cash.user.ali_openid;
				}
				if (type) {
					let res = await payments[type].transfers({
						partner_trade_no: cash._id,
						openid,
						amount: parseInt(cash.money * 100),
						desc: "账户提现"
					}, platform, type);
					console.log("支付端口转账", res);
					let result = {};
					if (res !== false) {
						result = {
							state: 2,
							result: res
						};
						console.log("更新账户日志--成功");
					} else {
						//转账失败
						result = {
							state: -1,
							result: res
						};
						console.log("更新账户日志--失败", res);
					}
					res = await userCashoutCollection.doc(cash._id).update(result)
					console.log("userCashoutCollection", res);
					res = await userBalanceLogCollection.where({
						cashout: {
							_id: cash._id
						}
					}).update({
						cashout: result
					})
					console.log("userBalanceLogCollection", res);
				}
			}
		}
	}
}

module.exports = actions;
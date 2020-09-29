'use strict';
const {
	getPaymentConfig
} = require('configs');
/**
 * 引入子模块（必须），默认会找到对于目录下的index.js
 */
const orders = {
	mall: require('./order/mall'),
}
/**
 * 支付方式
 */
const payments = {
	wxpay: require('./payment/unipay'),
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
			data["payment"].push({
				id: index,
				value: payname,
				icon: "icon-" + payname,
				name: config[payname].name + "支付",
				usable: payname == 'balance' ? balance >= data.order.totalMoney : true,
				usableText: payname == 'balance' ? "余额不足,请选择其他支付方式" : "",
				desc: payname == 'balance' ? "可用余额￥" + balance : ""
			});
			index++;
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
		data.module = module;
		//支付方式构造支付参数
		let res = await payments[provider].app(order, data, context);
		if (!res) {
			return false;
		} else if (res.callback) {
			return this[res.callback](res, module);
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
		//支付类型，wxpay，alipay，balance
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
			//let typeName = payments[provider].getName(provider);
			let typeName = config.name;
			res["type"] = provider;
			res["platform"] = platform;
			res["module"] = module;
			res["couponCount"] = res.couponList ? res.couponList.length : 0;
			//获取支付工具的名字
			res["typeName"] = typeName;
			res["name"] = typeName + "支付";
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
					console.log("支付端口退款成功", order._id);
					//退款处理成功
					if (res) {
						res = await orders[model].refundSuccess(order);
						console.log("订单端口处理结果", res);
					}
				}
			}else{
				console.log("refund无需处理",model)
			}
		}
	}
}

module.exports = actions;

'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	addUserBalanceLog
} = require('base-common');
const userCollection = db.collection("uni-id-users");
const models = {
	/**
	 * app支付配置
	 * @param {Object} order
	 * @param {Object} data
	 * @param {Object} context
	 */
	async app(order, data, context) {
		let uid = data.uid;
		console.log("余额支付");
		let balance = 0;
		if (context.userInfo.balance && context.userInfo.balance > 0) {
			//处理余额为2位小数
			balance = context.userInfo.balance.toFixed(2);
		}
		if (balance < order.totalMoney) {
			//付失败
			data.message = "余额不足,付款失败";
			return false;
		}
		//需要扣费
		if (order.totalMoney > 0) {
			let res = await userCollection.where({
				_id: uid,
				balance: cmd.gte(order.totalMoney)
			}).update({
				balance: cmd.inc(order.totalMoney * -1)
			});
			console.log("余额付款", res);
			if (res.updated < 1) {
				//付失败
				data.message = "余额不足,付款失败";
				return false;
			}
		}
		let yue = balance - order.totalMoney;
		//记录余额变动历史user_balance_logs
		let log = await addUserBalanceLog({
			uid: uid,
			type: 0, //0支出，1收入
			balance: yue,
			orderId: order.payid,
			money: order.totalMoney,
			description: "购买:" + order.body,
		});
		console.log("addUserBalanceLog", log);
		return {
			callback:"paySuccess",
			outTradeNo: order.payid,
			transactionId: log.id,
			uid: uid,
			tradeStatus: "TRADE_SUCCESS",
			totalFee: parseInt(order.totalMoney * 100),
			type: "balance",
			name: "余额支付",
			balance: yue,
		};
	},
	/**
	 * 验证请求的数据是否合法
	 * @param {Object} data
	 * @param {Object} platform
	 * @param {Object} provider
	 */
	async verify(data, platform, provider) {}
}
module.exports = models;

'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	addUserBalanceLog
} = require('base-common');
const {
	getPaymentConfig
} = require('configs');
const userCollection = db.collection("uni-id-users");
const models = {
	type: "balance",
	/**
	 * app支付配置
	 * @param {Object} order
	 * @param {Object} data
	 * @param {Object} context
	 */
	async app(order, data, context) {
		let uid = data.uid;
		console.log("余额支付");
		let platform = context.PLATFORM;
		let config = getPaymentConfig(platform)[this.type];
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
			callback: "paySuccess",
			outTradeNo: order.payid,
			transactionId: log.id,
			uid: uid,
			platform: platform,
			module: data.module,
			tradeStatus: "TRADE_SUCCESS",
			totalFee: parseInt(order.totalMoney * 100),
			type: this.type,
			typeName: config.name,
			name: config.name + "支付",
			balance: yue,
		};
	},
	/**
	 * 验证请求的数据是否合法
	 * @param {Object} data
	 * @param {Object} platform
	 * @param {Object} provider
	 */
	async verify(data, platform, provider) {},
	async getBalance(uid) {
		//账户余额
		let userInfo = await userCollection.where({
			_id: uid
		}).field({
			balance: 1
		}).get();
		let balance = 0;
		if (userInfo.data.length > 0 && userInfo.data[0].balance > 0) {
			//处理余额为2位小数
			balance = parseFloat(userInfo.data[0].balance.toFixed(2));
		}
		console.log("查询用户余额：", uid, balance);
		return balance;
	},
	/**
	 * 资金退款到用户账号
	 * @param {Object} order
	 */
	async refund(order) {
		let money = order.refundFee / 100;
		let uid = order.uid;
		console.log("用户收到退款金额", uid, money);
		let res = await userCollection.where({
			_id: uid
		}).update({
			balance: cmd.inc(money)
		});
		let balance = await this.getBalance(uid);
		console.log("保存账户资金", balance, res);
		//记录余额变动历史user_balance_logs
		let log = await addUserBalanceLog({
			uid: uid,
			type: 1, //0支出，1收入
			balance: balance,
			orderId: order.outTradeNo,
			money: money,
			description: order.refundDesc,
		});
		let payname = order.payInfo.typeName || order.payInfo.name;
		order.message = `退款将退回至您的${payname}账户，请注意查收`;
		console.log("保存账户收入日志", log);
		return true;
	}
}
module.exports = models;

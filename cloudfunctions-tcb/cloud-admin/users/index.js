'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	addUserBalanceLog
} = require('base-common');
const usersCollection = db.collection("uni-id-users");
const modules = {
	async list(data) {
		const {
			page,
			limit,
			key,
			sort
		} = data;
		let condition = {
			_id: cmd.exists(true)
		};
		if (key && key.trim().length > 0) {
			condition = cmd.or({
				nickname: new RegExp(key)
			}, {
				mobile: new RegExp(key)
			});
		}
		let direct = "desc",
			field = "register_date";
		switch (sort) {
			case 1:
				break;
			case 2:
				field = "balance";
				break;
			case 3:
				field = "last_login_date";
				break;
			case 4:
				field = "register_date";
				direct = "asc";
				break;
			case 5:
				field = "register_date";
				direct = "desc";
				break;
			default:
				break;
		}
		const result = await usersCollection.where(condition).skip((page - 1) * limit).limit(limit).orderBy(field, direct).get();
		if (result.data.length == 0) {
			return false;
		}
		return result.data;
	},
	/**
	 * 账户充值
	 * @param {Object} data
	 */
	async recharge(data) {
		const {
			rechargeUid,
			money
		} = data;
		let res = await usersCollection.where({
			_id: rechargeUid
		}).update({
			balance: cmd.inc(money)
		});
		console.log("手动账户充值", res);
		//查询余额
		res = await usersCollection.where({
			_id: rechargeUid
		}).field({
			balance: 1
		}).get();
		console.log(res);
		//充值记录
		let log = await addUserBalanceLog({
			uid: rechargeUid,
			type: 1, //0支出，1收入
			balance: res.data[0].balance,
			money: money,
			description: "手动账户充值",
		});
		console.log("手动账户充值", log);
		return res.data[0].balance;
	}
}

module.exports = modules

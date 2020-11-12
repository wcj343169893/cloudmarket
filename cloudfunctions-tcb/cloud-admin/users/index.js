'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	addUserBalanceLog,
	getDate
} = require('base-common');
const usersCollection = db.collection("uni-id-users");
const modules = {
	async list(data) {
		const {
			page,
			limit,
			key,
			state,
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
		let statistics = this.getStateCondition();
		if (state && statistics[state]) {
			condition = statistics[state];
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
	},
	async exports(data) {
		const {
			state
		} = data;
		let condition = {
			_id: cmd.exists(true)
		};
		let statistics = this.getStateCondition();
		if (state && statistics[state]) {
			condition = statistics[state];
		}
		const result = await usersCollection.where(condition).limit(500).get();
		if (result.data.length == 0) {
			return false;
		}
		//导出为Excel
		
	},
	getStateCondition() {
		const {
			todayTime,
			yestertodayTime
		} = this.getDayTime();
		let statistics = {
			yestertoday: {
				register_date: cmd.gte(yestertodayTime).lt(todayTime)
			},
			today: {
				register_date: cmd.gte(todayTime)
			},
			yestertodayMember: {
				member: cmd.exists(true),
				register_date: cmd.gte(yestertodayTime).lt(todayTime)
			},
			todayMember: {
				member: cmd.exists(true),
				register_date: cmd.gte(todayTime)
			},
		};
		return statistics;
	},
	getDayTime() {
		let date = getDate();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		let todayTime = date.getTime();
		date.setDate(date.getDate() - 1);
		let yestertodayTime = date.getTime();
		return {
			todayTime,
			yestertodayTime
		};
	}
}

module.exports = modules

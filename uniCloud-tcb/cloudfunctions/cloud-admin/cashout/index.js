'use strict';
const db = uniCloud.database();
const cmd = db.command;
const userCashoutCollection = db.collection("cloud_user_cashouts");
const userBalanceLogCollection = db.collection("cloud_user_balance_logs");
const userCollection = db.collection("uni-id-users");
const {
	updateUserIncome,
} = require('base-common');
const model = {
	async list(data) {
		const {
			page,
			limit,
			uid,
			state
		} = data;
		let condition = {
			_id: cmd.exists(true)
		};
		let stats = {
			applying: {
				state: 0
			},
			passed: {
				state: 1
			},
			success: {
				state: 2
			},
			failed: {
				state: -1
			},
			refuse: {
				state: -2
			}
		}
		if (stats[state]) {
			condition = stats[state];
		}
		const res = await userCashoutCollection.where(condition).orderBy("created", "desc").skip((page - 1) * limit).limit(
			limit).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	},
	/**
	 * 审核提现申请
	 * @param {Object} data
	 */
	async save(data) {
		const {
			id,
			uid,
			state
		} = data;
		//必须是可操作状态
		let info = await userCashoutCollection.where({
			_id: id,
			state: cmd.gt(-2)
		}).get();
		if (info.data.length == 0) {
			return false;
		}
		info = info.data[0];

		let res = await userCashoutCollection.doc(id).update({
			state: state == "pass" ? 1 : -2
		});
		console.log(res)
		//拒绝，返还金额
		if (state !== "pass" && res.updated == 1) {
			//更新用户余额
			let transaction = await db.startTransaction();
			res = await userBalanceLogCollection.where({
				cashout: {
					_id: info._id
				}
			}).update({
				cashout: {
					state: -2,
				}
			})
			console.log(res)
			res = await updateUserIncome(info.uid, info.money, "提现退回")
			console.log(res)
			transaction.commit();
		}
		return res;
	},
	/**
	 * 分页查询零钱明细
	 * @param {Object} data
	 */
	async balancelog(data) {
		const {
			page,
			limit,
			fuid
		} = data;
		const res = await userBalanceLogCollection.where({
			uid: fuid
		}).orderBy("created", "desc").skip((page - 1) * limit).limit(limit).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	},
}
module.exports = model;

const {
	Service
} = require('uni-cloud-router')
module.exports = class ScoreService extends Service {
	constructor(ctx) {
		super(ctx)
		this.collection = this.db.collection('uni-id-score-transfer')
		this.userCollection = this.db.collection('uni-id-users')
		this.balanceCollection = this.db.collection('uni-id-scores')
		this.scoreCashoutsCollection = this.db.collection('uni-id-score-cashout')
	}
	async recharge(uid, amount, comment) {
		const cmd = this.db.command;
		const {
			updated: getUpdated
		} = await this.userCollection.doc(uid).update({
			score: cmd.inc(amount)
		});
		//收入
		return await this.setBalanceLog(uid, amount, comment);
	}

	async transfer(uid, amount, mobile) {
		console.log("开始转账", uid, amount, mobile)
		if (amount < 1) {
			return {
				code: -1,
				message: "数量太小"
			}
		}
		try {
			const cmd = this.db.command;
			let shouxu = 0;
			let balance = 0;
			const {
				data: myData
			} = await this.userCollection.where({
				_id: uid
			}).field({
				mobile: 1,
				score: 1,
				score_charge_rate: 1
			}).get();
			if (myData.length == 0) {
				return {
					code: -1,
					message: "余额不足"
				}
			}
			console.log("info", myData)
			let info = myData[0];
			//默认转账比例
			if (!info.score_charge_rate) {
				info.score_charge_rate = this.ctx.getConfigs.config("user.score_charge_rate");
			}
			if (info.mobile == mobile) {
				return {
					code: -5,
					message: "不能转账给自己"
				}
			}
			shouxu = info.score_charge_rate * amount;
			if ((shouxu + amount) > info.score) {
				return {
					code: -2,
					message: "手续费不足"
				}
			}
			//账户接收
			let {
				data: getData
			} = await this.userCollection.where({
				mobile: `${mobile}`
			}).field({
				score: 1,
				nickname: 1,
			}).limit(1).get();
			if (getData.length == 0) {
				return {
					code: -3,
					message: "接收者用户不存在"
				}
			}
			let getUserInfo = getData[0];
			let total = (shouxu + amount);
			balance = info.score - total;
			const {
				updated
			} = await this.userCollection.where({
				_id: uid,
				score: cmd.gte(total)
			}).update({
				score: cmd.inc(total * -1)
			});
			if (updated < 1) {
				return {
					code: -4,
					message: "转账余额不足"
				}
			}
			const {
				updated: getUpdated
			} = await this.userCollection.doc(getUserInfo._id).update({
				score: cmd.inc(amount)
			});
			if (getUpdated != 1) {
				//必须一个人接收
				await transaction.rollback();
				return {
					code: -5,
					message: "接收者不存在"
				}
			}
			//转账成功，写入日志
			await this.collection.add({
				user_id: uid,
				amount,
				balance,
				mobile,
				service: shouxu,
				create_date: Date.now()
			})
			//支出
			await this.setBalanceLog(uid, total * -1, "账户转出，收取" + (shouxu ? shouxu + "手续费" : ""));
			//收入
			await this.setBalanceLog(getUserInfo._id, amount, "账户转入");
			return {
				code: 0,
				balance,
				message: "转账成功"
			};
		} catch (e) {
			console.log("transfer exception", e)
		}
		return {
			code: -10,
			message: "转账失败"
		};
	}
	/**
	 * 设置日志
	 * @param {Object} uid 用户编号或者手机号码
	 * @param {Object} amount
	 * @param {Object} comment
	 */
	async setBalanceLog(uid, amount, comment) {
		//查询出最后的余额
		let {
			data
		} = await this.userCollection.doc(uid).field({
			score: 1,
			avatar: 1,
			mobile: 1,
			nickname: 1,
		}).get();
		let info = data[0];
		let balance = info.score;
		let {
			id
		} = await this.balanceCollection.add({
			user_id: info._id,
			user: info,
			score: amount,
			type: amount > 0 ? 1 : 2,
			balance,
			comment,
			create_date: Date.now()
		})
		return {
			id,
			balance
		};
	}
	/**
	 * 写入积分兑换现金日志
	 */
	async setCashoutLog(uid, {
		money,
		day,
		balance,
		amount
	}) {
		return await this.scoreCashoutsCollection.add({
			user_id: uid,
			money,
			day,
			balance,
			service: 0,
			amount,
			create_date: Date.now()
		})
	}
}

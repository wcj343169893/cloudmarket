const {
	Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
	/**
	 *  积分兑换现金
	 */
	async score2money() {
		let {
			uid,
			amount,
			day,
			unit
		} = this.ctx.data;
		//减少积分，
		let {
			score,
			balance
		} = await this.service.user.user.editScore(uid, amount * -1, "积分兑换现金", 99)
		console.log("扣除积分完成", score, balance)
		if (score && score != 0) {
			//单位是分
			let money = parseInt(amount * unit * 100);
			console.log("开始增加现金")
			//增加余额，
			let res2 = await this.service.user.user.editBalance(uid, money, "积分兑换现金", 99)
			console.log("修改用户兑换总计")
			//写入兑换总计
			await this.service.user.user.editScoreCashout(uid, {
				money,
				day,
				amount
			});
			console.log("新增兑换日志")
			//写入兑换日志
			await this.service.user.score.setCashoutLog(uid, {
				money,
				day,
				balance,
				amount
			});
			return true;
		}
		return {
			code: -1,
			message: "积分不足"
		}
	}
	/**
	 * 修复邀请关系
	 */
	async repair() {
		let {
			mode,
			id,
			action
		} = this.ctx.data;
		return await this.service[mode]["repair"][action](id);
	}
	/**
	 * 余额充值
	 */
	async recharge() {
		let {
			id,
			amount
		} = this.ctx.data;
		const {
			uid,
		} = this.ctx.auth;
		amount = Math.floor(amount);
		//增加余额，
		return await this.service.user.user.editBalance(id, amount, "系统充值", 99, {
			operator: uid
		})
	}
}

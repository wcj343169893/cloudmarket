const {
	Controller
} = require('uni-cloud-router')
module.exports = class UniIdScoreController extends Controller {
	constructor(ctx) {
		super(ctx)
	}
	/**
	 *  积分补登
	 */
	async reget() {
		let {
			id
		} = this.ctx.data;
		//检查是否已经录入过
		let log = await this.service.user.task.getTaskLogById(id);
		if (!log) {
			return {
				code: -1,
				message: "日志不存在"
			};
		}
		//积分日志中，不能出现此条日志的信息
		let scoreLog = await this.service.user.user.getScoreLogByTaskLogId(id);
		if (scoreLog) {
			return {
				code: -1,
				message: "积分已奖励"
			};
		}
		let {score} = await this.service.user.user.editScore(log.user_id, log.bounty, `积分补登`, 0, {
			task: log
		});
		//系统每日积分总计
		await this.service.system.app.setScoreDayStatistics(score);
		return {
			code: 0,
			message: "录入成功"
		};
	}
}

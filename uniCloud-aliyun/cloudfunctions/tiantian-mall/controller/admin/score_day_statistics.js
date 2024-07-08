const {
	Controller
} = require('uni-cloud-router')
module.exports = class ScoreDayStatisticsController extends Controller {
	/**
	 *  修复积分总计，比较耗费资源
	 */
	async repair() {
		let {
			id,
			day
		} = this.ctx.data;
		return await this.service.system.app.repair(id, day);
	}
}

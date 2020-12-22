'use strict';
const db = uniCloud.database();
const cmd = db.command;
const $ = db.command.aggregate;
const shopCollection = db.collection("cloud_shops");
const shopStatisticsCollection = db.collection("cloud_shop_statistics");
const {
	getDateString
} = require("base-common");
const modules = {
	/**
	 * 今日实时数据
	 * @param {Object} data
	 */
	async realtime(data) {
		const {
			shopid
		} = data;
		//今日日期年月日
		let dayTime = getDateString();
		let res = await shopStatisticsCollection.aggregate()
			.match({
				shopid,
				day: dayTime
			})
			.project({
				paidOrder: '$order.paid',
				turnover: 1,
				totalVisitor: $.size('$visitor'),
				totalOrdered: $.size('$order.users'),
			})
			.end();

		let statistics = {
			paidOrder: 0,
			turnover: 0,
			totalVisitor: 0,
			totalOrdered: 0,
		};
		if (res.data.length > 0) {
			statistics = res.data[0];
		}
		let zhuanhua = "0%";
		if (statistics.totalVisitor > 0 && statistics.totalOrdered > 0) {
			zhuanhua = (statistics.totalOrdered / statistics.totalVisitor * 100).toFixed(2) + "%";
		}
		return [{
			name: "营业额",
			count: statistics.turnover
		}, {
			name: "有效订单",
			count: statistics.paidOrder
		}, {
			name: "曝光人数",
			count: statistics.totalVisitor
		}, {
			name: "下单转化",
			count: zhuanhua
		}];
	},
	/**
	 * 定时器，自动创建店铺的每日统计数据
	 */
	async timer(data) {

	}
}
module.exports = modules

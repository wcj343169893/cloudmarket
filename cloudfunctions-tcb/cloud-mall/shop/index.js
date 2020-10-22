'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const shopStatisticsCollection = db.collection("cloud_shop_statistics");
const {
	getDateString
} = require("base-common");
const models = {
	/**
	 * 根据经纬度，查询最近的一个店铺
	 * @param {Object} data
	 */
	async getNearest(data) {
		const {
			longitude,
			latitude
		} = data;
		let res = await shopCollection.where({
			lnglat: cmd.geoNear({
				geometry: new db.Geo.Point(longitude, latitude),
				// minDistance: 0,
				// maxDistance: 10000,
			})
		}).field({
			id: 1,
			address: 1,
			name: 1,
			delivery: 1,
			notice: 1,
			phone: 1,
			dayStatisticsLog: 1,
			serviceTime: 1,
			searchGoodsKeywords: 1,
			src: 1,
			pages: 1
		}).limit(1).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data[0];
	},
	/**
	 * 用户访问店铺记录
	 * @param {Object} uid
	 * @param {Object} shopid
	 */
	async saveTodayVisitorLog(uid, shopInfo) {
		if (!uid) {
			return false;
		}
		let shopid = shopInfo.id;
		//今日日期年月日
		let dayTime = getDateString();
		//仅在这里判断是否新增数据
		if (shopInfo.dayStatisticsLog != dayTime) {
			//新增这条数据，并设置到店铺属性里面，避免重复测试增加
			await shopCollection.where({
				id: shopid
			}).update({
				dayStatisticsLog: dayTime
			})
			return await shopStatisticsCollection.add({
				shopid,
				day: dayTime,
				order: {
					paid: 0,
				},
				turnover: 0,
				visitor: [
					uid
				]
			});
		}
		//累加访问用户id
		return await shopStatisticsCollection.where({
			shopid,
			day: dayTime
		}).update({
			visitor: cmd.addToSet(uid)
		});
	}
}
module.exports = models;

'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const shopStatisticsCollection = db.collection("cloud_shop_statistics");
const {
	getDateString,
	updateShopDayStatistics
} = require("base-common");
const models = {
	async getById(id) {
		let res = await shopCollection.where({
			id
		}).field(this.getFields()).limit(1).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data[0];
	},
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
		}).field(this.getFields()).limit(1).get();
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
		if (!uid || !shopInfo.id) {
			return false;
		}
		//增加用户今日访问记录
		return await updateShopDayStatistics(shopInfo.id, {
			visitor: cmd.addToSet(uid)
		}, false, uid);
	},
	getFields() {
		return {
			id: 1,
			address: 1,
			name: 1,
			delivery: 1,
			notice: 1,
			phone: 1,
			currency: 1,
			deliveryTypes: 1,
			selfRaisingPoint: 1,
			dayStatisticsLog: 1,
			serviceTime: 1,
			searchGoodsKeywords: 1,
			src: 1,
			pages: 1
		};
	}
}
module.exports = models;

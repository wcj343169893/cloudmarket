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
		//必须保证有经纬度
		if (!longitude || !latitude) {
			return false;
		}
		let res = await shopCollection.where({
			state: true,
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
	 * 附近店铺，并返回距离
	 * @param {Object} data
	 */
	async getNearList(data) {
		const {
			longitude,
			latitude
		} = data;
		//必须保证有经纬度
		if (!longitude || !latitude) {
			return false;
		}

		let {
			data: result
		} = await shopCollection.aggregate()
			.geoNear({
				distanceField: 'distance', // 输出的每个记录中 distance 即是与给定点的距离
				spherical: true,
				near: new db.Geo.Point(longitude, latitude),
				query: {
					state: true
				},
			})
			.limit(20)
			.project({
				id: 1,
				name: 1,
				notice: 1,
				phone: 1,
				address: 1,
				serviceTime: 1,
				src: 1,
				distance: 1
			})
			.end()
		if (result.length == 0) {
			return result
		}
		result.forEach(e => {
			if (e.distance > 1000) {
				e.distanceText = (e.distance / 1000).toFixed(1) + "km"
			} else {
				e.distanceText = e.distance.toFixed() + "m"
			}
		})
		return result
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
			visiteTotal: cmd.inc(1), //总访问
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
			services: 1,
			currency: 1,
			deliveryTypes: 1,
			selfRaising: 1,
			dayStatisticsLog: 1,
			serviceTime: 1,
			searchGoodsKeywords: 1,
			src: 1,
			video: 1,
			coupons: 1,
			pages: 1
		};
	}
}
module.exports = models;

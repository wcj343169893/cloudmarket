'use strict';
const db = uniCloud.database();
const cmd = db.command;
const selfraisingCollection = db.collection("cloud_self_raising_points");
const models = {
	/**
	 * 根据经纬度，查询最近自提点
	 * @param {Object} data
	 */
	async nearest(data) {
		const {
			page,
			limit,
			longitude,
			latitude
		} = data;
		let res = await selfraisingCollection.where({
			location: cmd.geoNear({
				geometry: new db.Geo.Point(longitude, latitude),
			})
		}).field({
			latitude: 1,
			longitude: 1,
			src: 1,
			mobile: 1,
			address: 1,
			name: 1
		}).skip((page - 1) * limit).limit(limit).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	}
}
module.exports = models;

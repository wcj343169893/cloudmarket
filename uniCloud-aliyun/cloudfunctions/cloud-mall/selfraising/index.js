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
			latitude,
		} = data;
		//默认5公里，直线距离
		let distance = 5000;
		if (data.distance) {
			distance = +data.distance;
		}
		//经纬度必传
		if (!longitude || !latitude) {
			return false;
		}
		let res = await selfraisingCollection.aggregate()
			.geoNear({
				distanceField: 'juli', // 输出的每个记录中 distance 即是与给定点的距离
				spherical: true,
				near: new db.Geo.Point(longitude, latitude),
				minDistance: 0,
				maxDistance: distance,
				query: {
					state: 1,
				},
			}).project({
				juli: 1,
				latitude: 1,
				longitude: 1,
				src: 1,
				mobile: 1,
				address: 1,
				name: 1
			}).skip((page - 1) * limit).limit(limit)
			.end()
		if (res.data.length == 0) {
			return false;
		}
		res.data.forEach(se => {
			//保留整数部分
			se.juli = se.juli.toFixed()
		})
		return res.data;
	},
	async applys(data) {
		const {
			_id,
			longitude,
			latitude,
			uid
		} = data;
		data.location = new db.Geo.Point(longitude, latitude);
		data.state = 0;
		if (_id) {
			//修改
			delete data._id;
			data.modified = Date.now();
			return await selfraisingCollection.where({
				_id,
				uid
			}).update(data);
		} else {
			//分成百分比,默认2%
			data.rate = 2;
			//佣金
			data.commission = 0;
			data.modified = Date.now();
			data.created = Date.now();
			return await selfraisingCollection.add(data);
		}
	}
}
module.exports = models;

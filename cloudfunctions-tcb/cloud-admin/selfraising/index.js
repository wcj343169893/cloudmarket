'use strict';
const db = uniCloud.database();
const cmd = db.command;
const $ = db.command.aggregate;
const selfraisingCollection = db.collection("cloud_self_raising_points");
const orderCollection = db.collection("cloud_orders");
const models = {
	/**
	 * 根据经纬度，查询最近自提点
	 * @param {Object} data
	 */
	async nearest(data) {
		const {
			page,
			shopid,
			limit,
			longitude,
			latitude
		} = data;
		if (!longitude || !latitude) {
			return false;
		}
		let res = await selfraisingCollection.where({
			location: cmd.geoNear({
				geometry: new db.Geo.Point(longitude, latitude)
			})
		}).field({
			latitude: 1,
			longitude: 1,
			src: 1,
			mobile: 1,
			address: 1,
			rate: 1,
			state: 1,
			rateShop: 1,
			name: 1
		}).skip((page - 1) * limit).limit(limit).get();
		if (res.data.length == 0) {
			return false;
		}
		let ids = [];
		res.data.forEach(se => {
			if (se.rateShop && se.rateShop[shopid]) {
				se.rate = se.rateShop[shopid];
				delete se.rateShop;
			}
			ids.push(se._id);
		})
		//已付款
		let orderPayup = await this.getOrderAggreByRaisingPoint(ids, shopid, 1);
		//已发货
		let orderDelivered = await this.getOrderAggreByRaisingPoint(ids, shopid, 2);
		res.data.forEach(se => {
			se.payup = orderPayup[se._id] ? orderPayup[se._id] : 0
			se.delivered = orderDelivered[se._id] ? orderDelivered[se._id] : 0
		})
		return res.data;
	},
	/**
	 * 查询提货点的订单信息
	 * @param {Object} ids
	 * @param {Object} shopid
	 * @param {Object} state
	 */
	async getOrderAggreByRaisingPoint(ids, shopid, state) {
		let res = await orderCollection.aggregate().match({
				shopid,
				state: state,
				"raisingPoint._id": cmd.in(ids),
			}).group({
				_id: '$raisingPoint._id',
				num: $.sum(1)
			})
			.end();
		if (res.data.length > 0) {
			let mp = {};
			res.data.map(ord => {
				mp[ord._id] = ord.num;
			})
			return mp;
		}
		return {};
	},
	/**
	 * 审核通过(所有店铺都有这个权限)
	 * @param {Object} data
	 */
	async approved(data) {
		const {
			id,
			operator,
			shopid,
			rate
		} = data;
		return await selfraisingCollection.doc(id).update({
			state: 1,
			rateShop: {
				[shopid]: rate
			},
			approved: {
				[shopid]: {
					time: Date.now(),
					operator
				}
			},
		});
	}
}
module.exports = models;

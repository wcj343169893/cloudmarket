'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const modules = {
	/**
	 * 获取店铺信息
	 * @param {Object} data
	 * @param {Object} context
	 */
	async info(data, context) {
		let res = await shopCollection.where({
			id: data.shopid
		}).limit(1).get();
		if (res.data.length == 0) {
			//表示没有数据，默认提示语，可以省略
			//data.message = "暂无数据";
			return false;
		}
		return res.data[0];
	},
	/**
	 * 保存店铺信息
	 * @param {Object} data
	 */
	async save(data) {
		let shopid = data.shopid;
		delete data.shopid;
		//地址位置，用于定位筛选数据
		if (data.latitude && data.longitude) {
			data.lnglat = new db.Geo.Point(data.longitude, data.latitude);
		}
		return await shopCollection.where({
			id: shopid
		}).update(data);
	}
}
module.exports = modules

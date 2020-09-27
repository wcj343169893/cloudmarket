'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const goodsCollection = db.collection("cloud_goods");
const goodsDeleteCollection = db.collection("cloud_goods_deletes");
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
		let shop = res.data[0];
		//实时统计商品数量
		await this.getGoodsCount(shop);
		return shop;
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
	},
	/**
	 * 获取商品统计
	 * @param {Object} shop
	 */
	async getGoodsCount(shop) {
		let time = new Date().getTime();
		//在售，秒杀，预售，团购，下架，已删除
		let statistics = {
			online: {
				isSold: 1
			},
			offline: {
				isSold: 0
			},
			miaosha: {
				miaosha: cmd.exists(true),
				"miaosha.endTime": cmd.gt(time)
			},
			yuding: {
				yuding: cmd.exists(true)
			},
			tuangou: {
				tuangou: cmd.exists(true),
				"tuangou.pickup": cmd.gt(time)
			},
			shouqin: {
				isSold: 1,
				stock: cmd.gt(10)
			},
			baokuan: {
				isSold: 1,
				monthlySale: cmd.gt(100)
			},
		}
		for (let key in statistics) {
			shop["goods"][key] = await this.getGoodsStatisticsByCondition(shop.id, statistics[key]);
		}
		//已删除商品
		shop["goods"]["delete"] = await this.getGoodsDeleteStatisticsByCondition(shop.id);
	},
	/**
	 * 查询已删除商品数量
	 * @param {Object} shopid
	 */
	async getGoodsDeleteStatisticsByCondition(shopid) {
		let res = await goodsDeleteCollection.where({
			shopid
		}).count();
		return res.total;
	},
	/**
	 * 查询商品统计
	 * @param {Object} shopid
	 * @param {Object} condition
	 */
	async getGoodsStatisticsByCondition(shopid, condition) {
		let res = await goodsCollection.where({
			shopid,
			...condition
		}).count();
		return res.total;
	}
}
module.exports = modules

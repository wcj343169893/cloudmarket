'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const goodsCollection = db.collection("cloud_goods");
const goodsDeleteCollection = db.collection("cloud_goods_deletes");
const ordersCollection = db.collection("cloud_orders");
const orderRefundsCollection = db.collection("cloud_order_refunds");
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
		//实时统计订单数量
		await this.getOrderStatistics(shop);
		//实时统计商品数量
		await this.getGoodsStatistics(shop);
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
		console.log(data);
		return await shopCollection.where({
			id: shopid
		}).update(data);
	},
	/**
	 * 查询店铺订单统计
	 * @param {Object} shop
	 */
	async getOrderStatistics(shop) {
		let time = new Date().getTime();
		//-2:deleted已删除，-1:canceled已取消，0:unpaid未付款，1:payup已付款，
		//2:delivered已发货，3:received已收货，4:estimated已评价，refunded退款
		let statistics = {
			all: {
				state: cmd.gt(-1)
			},
			unpaid: {
				state: 0
			},
			payup: {
				state: 1
			},
			estimated: {
				state: 4
			}
		}
		for (let key in statistics) {
			shop["order"][key] = await this.getOrderStatisticsByCondition(shop.id, statistics[key]);
		}
		//退款中的数量
		shop["order"]["refunded"] = await this.getOrderRefundStatisticsByCondition(shop.id, {
			state: "verifying"
		});
	},
	/**
	 * 获取商品统计
	 * @param {Object} shop
	 */
	async getGoodsStatistics(shop) {
		let time = new Date().getTime();
		let shopid = shop.id;
		//在售，秒杀，预售，团购，下架，已删除
		let statistics = {
			online: {
				shopid,
				isSold: 1,
				isCategoryShow: 1
			},
			recommend: {
				shopid,
				isRecommend: true
			},
			offline: cmd.or({
				shopid,
				isSold: 0
			}, {
				shopid,
				isCategoryShow: 0
			}),
			miaosha: {
				shopid,
				miaosha: cmd.exists(true),
				"miaosha.endTime": cmd.gt(time)
			},
			yuding: {
				shopid,
				yuding: cmd.exists(true)
			},
			tuangou: {
				shopid,
				tuangou: cmd.exists(true),
				"tuangou.pickup": cmd.gt(time)
			},
			shouqin: {
				shopid,
				isSold: 1,
				stock: cmd.lt(10)
			},
			baokuan: {
				shopid,
				isSold: 1,
				monthlySale: cmd.gt(100)
			},
		}
		for (let key in statistics) {
			shop["goods"][key] = await this.getGoodsStatisticsByCondition(statistics[key]);
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
	async getGoodsStatisticsByCondition(condition) {
		let res = await goodsCollection.where(condition).count();
		return res.total;
	},
	async getOrderStatisticsByCondition(shopid, condition) {
		let res = await ordersCollection.where({
			shopid,
			...condition
		}).count();
		return res.total;
	},
	async getOrderRefundStatisticsByCondition(shopid, condition) {
		let res = await orderRefundsCollection.where({
			shopid,
			...condition
		}).count();
		return res.total;
	}
}
module.exports = modules

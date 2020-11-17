'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const goodsCollection = db.collection("cloud_goods");
const goodsDeleteCollection = db.collection("cloud_goods_deletes");
const ordersCollection = db.collection("cloud_orders");
const usersCollection = db.collection("uni-id-users");
const orderRefundsCollection = db.collection("cloud_order_refunds");
const {
	getDate
} = require('base-common');
const {
	getConfig
} = require("configs");
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
		shop.domain = getConfig().domain;
		//实时统计订单数量
		await this.getOrderStatistics(shop);
		//实时统计商品数量
		await this.getGoodsStatistics(shop);
		//用户简单统计，总用户，昨日新增，今日新增
		await this.getUsersStatistics(shop);
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
				name: "全部",
				condition: {
					state: cmd.gt(-1)
				}
			},
			unpaid: {
				name: "待付款",
				condition: {
					state: 0,
					lastPayTime: cmd.gt(time)
				}
			},
			payup: {
				name: "待发货",
				condition: {
					state: 1,
					isRefundAll: cmd.exists(false)
				}
			},
			delivered: {
				name: "待提货",
				condition: {
					state: 2,
					isRefundAll: cmd.exists(false)
				}
			},
			estimated: {
				name: "已评价",
				condition: {
					state: 4,
					isRefundAll: cmd.exists(false)
				}
			}
		}
		shop["orderTypes"] = [];
		for (let key in statistics) {
			let number = await this.getOrderStatisticsByCondition(shop.id, statistics[key].condition);
			shop["orderTypes"].push({
				name: statistics[key].name,
				state: key,
				number: number
			});
		}
		//退款中的数量
		let number = await this.getOrderRefundStatisticsByCondition(shop.id, {
			state: "verifying"
		});
		shop["orderTypes"].push({
			name: "退款/售后",
			state: "refunded",
			number: number
		});
	},
	/**
	 * 用户简单统计，总用户，昨日新增，今日新增
	 * @param {Object} shop
	 */
	async getUsersStatistics(shop) {
		//获取今日和昨日的时间戳
		const {
			todayTime,
			yestertodayTime
		} = this.getDayTime();
		let statistics = {
			all: {
				name: "全部",
				condition: {
					_id: cmd.exists(true)
				}
			},
			yestertoday: {
				name: "昨日新增",
				condition: {
					register_date: cmd.gte(yestertodayTime).lt(todayTime)
				}
			},
			today: {
				name: "今日新增",
				condition: {
					register_date: cmd.gte(todayTime)
				}
			},
			yestertodayMember: {
				name: "昨日会员",
				condition: {
					member: cmd.exists(true),
					"member.time": cmd.gte(yestertodayTime).lt(todayTime)
				}
			},
			todayMember: {
				name: "今日会员",
				condition: {
					member: cmd.exists(true),
					"member.time": cmd.gte(todayTime)
				}
			},
		};
		shop["userTypes"] = [];
		for (let key in statistics) {
			let number = await this.getUsersStatisticsByCondition(statistics[key].condition);
			shop["userTypes"].push({
				name: statistics[key].name,
				state: key,
				number: number
			});
		}
	},
	async getUsersStatisticsByCondition(condition) {
		let res = await usersCollection.where(condition).count();
		return res.total;
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
				name: "全部",
				condition: {
					shopid,
					isSold: 1,
					isCategoryShow: 1
				}
			},
			recommend: {
				name: "推荐",
				condition: {
					shopid,
					isSold: 1,
					isCategoryShow: 1,
					isRecommend: true
				}
			},
			offline: {
				name: "已下架",
				condition: cmd.or({
					shopid,
					isSold: 0
				}, {
					shopid,
					isCategoryShow: 0
				})
			},
			miaosha: {
				name: "秒杀",
				condition: {
					shopid,
					miaosha: cmd.exists(true),
					"miaosha.endTime": cmd.gt(time)
				}
			},
			yuding: {
				name: "预售",
				condition: {
					shopid,
					yuding: cmd.exists(true)
				}
			},
			tuangou: {
				name: "团购",
				condition: {
					shopid,
					tuangou: cmd.exists(true),
					"tuangou.pickup": cmd.gt(time)
				}
			},
			shouqin: {
				name: "即将售罄",
				condition: {
					shopid,
					isSold: 1,
					stock: cmd.lt(10)
				}
			},
			baokuan: {
				name: "爆款",
				condition: {
					shopid,
					isSold: 1,
					monthlySale: cmd.gt(100)
				}
			},
		}
		shop["goodsTypes"] = [];
		for (let key in statistics) {
			let number = await this.getGoodsStatisticsByCondition(statistics[key].condition);
			shop["goodsTypes"].push({
				name: statistics[key].name,
				state: key,
				number: number
			});
		}
		//已删除商品
		let number = await this.getGoodsDeleteStatisticsByCondition(shop.id);
		shop["goodsTypes"].push({
			name: "已删除",
			state: "delete",
			number: number
		});
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
	},
	getDayTime() {
		let date = getDate();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		let todayTime = date.getTime();
		date.setDate(date.getDate() - 1);
		let yestertodayTime = date.getTime();
		return {
			todayTime,
			yestertodayTime
		};
	}
}
module.exports = modules

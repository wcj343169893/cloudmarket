'use strict';
const uniID = require('uni-id');
const db = uniCloud.database();
const cmd = db.command;
const cartCollection = db.collection('cloud_carts');
const goodsCollection = db.collection('cloud_goods');
const goodsCategoryCollection = db.collection('cloud_goods_categories');
const adCollection = db.collection('cloud_ads');

//文档公开方法，直接可以调用
const documents = require("../document");
const shop = require("../shop");
const models = {
	//首页
	async index(data) {
		let {
			uid,
			shopid
		} = data;
		let longitude = data.longitude ? +data.longitude : 113.92246555717469;
		let latitude = data.latitude ? +data.latitude : 22.489059185437284;
		let limits = {
			miaosha: 5,
			tuangou: 5,
			yuding: 5,
			newest: 30,
			ads: 5,
			adBanners: 5,
			category: 10,
			recommend: 5
		};
		let dataOut = {
			uid,
			cart: 0,
			shopId: 0,
			categories: [],
			miaosha: [],
			newest: [],
			titles: {
				miaosha: "限时抢购",
				tuangou: "限时团购",
				yuding: "限时预定",
				recommend: "精品推荐",
				newest: "实时鲜货",
			}
		};
		let shopInfo;
		if (shopid) {
			shopInfo = await shop.getById(+shopid);
		} else {
			//根据用户收货地址查询最近的一家店铺
			shopInfo = await shop.getNearest({
				longitude,
				latitude
			});
		}
		if (shopInfo) {
			shopid = shopInfo.id;
			if (shopInfo.pages && shopInfo.pages.home) {
				Object.assign(dataOut.titles, {
					...shopInfo.pages.home.titles
				})
				Object.assign(limits, {
					...shopInfo.pages.home.limits
				})
			}
			dataOut["shop"] = shopInfo;
		}
		dataOut["shopId"] = shopid;
		//查询广告,优先店铺，再是全站shopid: cmd.in([0, shopid])
		await this.getAdByCondition(shopid, dataOut, limits);
		if (limits.category > 0) {
			//店铺推荐分类
			let categories = await goodsCategoryCollection.where({
				shopid: shopid,
				isShow: 1,
				isRecommend: 1
			}).field({
				"_id": 0,
				"id": 1,
				"name": 1,
				"src": 1,
			}).orderBy("posid", "asc").limit(limits.category).get();
			dataOut["categories"] = categories.data;
		}
		//按条件查询商品列表
		await this.getGoodsByCondition(shopid, dataOut, limits);
		//查询首页的分享语
		dataOut["share"] = await documents.share({
			shopid,
			url: "/pages/index/fruit"
		});
		//用户访问店铺日志
		await shop.saveTodayVisitorLog(uid, shopInfo);
		return dataOut;
	},
	/**
	 * 获取首页广告
	 * @param {Object} shopid
	 * @param {Object} dataOut
	 * @param {Object} limits
	 */
	async getAdByCondition(shopid, dataOut, limits) {
		let field = {
			"_id": 0,
			"background": 1,
			"link": 1,
			size: 1,
			"posid": 1,
			"src": 1
		}
		let conditions = {
			ads: cmd.or({
				type: cmd.exists(false)
			}, {
				type: "home_swiper"
			}).and({
				shopid: cmd.in([0, shopid])
			}),
			adBanners: {
				type: "home_banner_after_category",
				shopid: cmd.in([0, shopid])
			}
		}

		for (let key in conditions) {
			if (limits[key] > 0) {
				const {
					data
				} = await adCollection.where(conditions[key]).field(field).limit(limits[key]).orderBy("shopid", "desc").get();
				if(data.length > 0){
					dataOut[key] = data;
				}
			}
		};
	},
	/**
	 * 按条件查询商品列表
	 * @param {Object} dataOut
	 * @param {Object} limits
	 */
	async getGoodsByCondition(shopid, dataOut, limits) {
		let time = new Date().getTime();
		let goodsFields = {
			_id: 0,
			id: 1,
			src: 1,
			banner: 1,
			title: 1,
			subTitle: 1,
			miaosha: 1,
			manjian: 1,
			price: 1,
			skus: 1,
			skuname: 1,
			yuding: 1,
			monthlySale: 1,
			tuangou: 1,
			stock: 1
		};
		//用于过滤实时鲜货，避免重复
		let gids = [];
		let conditions = {
			/**
			 * 秒杀
			 */
			miaosha: {
				condition: {
					shopid: shopid,
					isCategoryShow: 1,
					isSold: 1,
					miaosha: cmd.exists(true),
					"miaosha.stock": cmd.gt(0),
					"miaosha.beginTime": cmd.lt(time + 24 * 3600 * 1000),
					"miaosha.endTime": cmd.gt(time),
				},
				sort: ["miaosha.beginTime", "asc"]
			},
			/**
			 * 团购
			 */
			tuangou: {
				condition: {
					shopid: shopid,
					isCategoryShow: 1,
					isSold: 1,
					tuangou: cmd.exists(true),
					"tuangou.beginTime": cmd.lt(time + 24 * 3600 * 1000),
					"tuangou.endTime": cmd.gt(time),
				},
				sort: ["tuangou.beginTime", "asc"],
			},
			/**
			 * 预定、预售
			 */
			yuding: {
				condition: {
					shopid: shopid,
					isCategoryShow: 1,
					isSold: 1,
					yuding: cmd.exists(true),
					"yuding.beginTime": cmd.lt(time + 24 * 3600 * 1000),
					"yuding.endTime": cmd.gt(time),
				},
				sort: ["yuding.beginTime", "asc"],
			},
			/**
			 * 精品推荐
			 */
			recommend: {
				condition: {
					shopid: shopid,
					isRecommend: true,
					isCategoryShow: 1,
					isSold: 1,
				},
				sort: ["monthlySale", "desc"],
			},
			/**
			 * 最新上架/最近更新
			 */
			newest: {
				condition: {
					shopid: shopid,
					isCategoryShow: 1,
					isSold: 1,
				},
				sort: ["onlineTime", "desc"],
			}
		}
		for (let key in conditions) {
			if (limits[key] > 0) {
				let condi = conditions[key].condition;
				if (gids.length > 0) {
					condi["id"] = cmd.nin(gids);
				}
				let res = await goodsCollection.where(condi).field(goodsFields).limit(limits[key]).orderBy(
					...conditions[key].sort).get();
				dataOut[key] = res.data;
				if (res.data.length > 0) {
					res.data.map(goods => {
						gids.push(goods.id);
					});
				}
			} else {
				dataOut[key] = [];
			}
		}
	}
}
module.exports = models;

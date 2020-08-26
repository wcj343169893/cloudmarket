'use strict';
const uniID = require('uni-id');
const db = uniCloud.database();
const cmd = db.command;
const cartCollection = db.collection('cloud_carts');
const goodsCollection = db.collection('cloud_goods');
const goodsCategoryCollection = db.collection('cloud_goods_categories');
const adCollection = db.collection('cloud_ads');
const shopCollection = db.collection("cloud_shops");

//文档公开方法，直接可以调用
const documents = require("../document");
const models = {
	//首页
	async index(data) {
		let uid = data.uid;
		let longitude = data.longitude ? +data.longitude : 113.92246555717469;
		let latitude = data.latitude ? +data.latitude : 22.489059185437284;
		let dataOut = {
			uid,
			cart: 0,
			shopId: 0,
			categories: [],
			miaosha: [],
			newest: [],
		};
		//根据用户收货地址查询最近的一家店铺
		let shopid = 123457;
		//10公里以内
		let nearestShops = await shopCollection.where({
			lnglat: cmd.geoNear({
				geometry: new db.Geo.Point(longitude, latitude),
				// minDistance: 0,
				// maxDistance: 10000,
			})
		}).field({
			id: 1,
			address: 1,
			name: 1,
			delivery: 1,
			notice: 1,
			searchGoodsKeywords: 1,
			src: 1
		}).limit(1).get();
		if (nearestShops.data.length > 0) {
			shopid = nearestShops.data[0].id;
			dataOut["shop"] = nearestShops.data[0];
		}
		dataOut["shopId"] = shopid;
		//查询广告,优先店铺，再是全站
		const ads = await adCollection.where({
			shopid: cmd.in([0, shopid])
		}).field({
			"_id": 0,
			"background": 1,
			"link": 1,
			"posid": 1,
			"src": 1
		}).limit(5).orderBy("shopid", "desc").get();
		dataOut["ads"] = ads.data;
		//店铺推荐分类
		let categories = await goodsCategoryCollection.where({
			shopid: shopid,
			isRecommend: 1
		}).field({
			"_id": 0,
			"id": 1,
			"name": 1,
			"src": 1,
		}).orderBy("posid", "asc").limit(10).get();
		dataOut["categories"] = categories.data;
		let time = new Date().getTime();
		let goodsFields = {
			_id: 0,
			id: 1,
			src: 1,
			title: 1,
			subTitle: 1,
			miaosha: 1,
			manjian: 1,
			price: 1,
			skus: 1,
			skuname: 1,
			yuding: 1,
			stock: 1
		};
		//正在秒杀商品5条,必须是有库存的秒杀
		let miaoshaGoods = await goodsCollection.where({
			shopid: shopid,
			isSold: 1,
			miaosha: cmd.exists(true),
			"miaosha.stock": cmd.gt(0),
			"miaosha.beginTime": cmd.lt(time + 24 * 3600 * 1000),
			"miaosha.endTime": cmd.gt(time),
		}).field(goodsFields).limit(5).orderBy("miaosha.beginTime", "asc").get();
		dataOut["miaosha"] = miaoshaGoods.data;
		//最新上架/最近更新,20条
		let newGoods = await goodsCollection.where({
			shopid: shopid,
			isSold: 1
		}).field(goodsFields).orderBy("onlineTime", "desc").limit(20).get();
		dataOut["newest"] = newGoods.data;
		//购物车总数
		if (uid) {
			const $ = db.command.aggregate
			let res2 = await cartCollection.aggregate()
				.match({
					uid: uid
				}).group({
					_id: null,
					totalAmount: $.sum('$amount')
				})
				.end();
			if (res2.data.length > 0) {
				dataOut["cart"] = res2.data[0].totalAmount;
			}
		}
		//查询首页的分享语
		dataOut["share"] = await documents.share({
			shopid,
			url: "/pages/index/fruit"
		});
		return dataOut;
	}
}
module.exports = models;

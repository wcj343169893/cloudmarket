'use strict';
/* 店铺首页，查询店铺信息，分类 */
const db = uniCloud.database();
const getCollectionNames = require('collection_names');
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let {customUserId} = await auth.getUserInfo();
	let shopid = parseInt(event.id);
	let uid = +customUserId;
	let withSubCategory = parseInt(event.withSubCategory)==1;
	let withGoods = parseInt(event.withGoods)==1;
	let collectionNames = getCollectionNames(event);
	//这里需要过滤字段
	let data = await db.collection(collectionNames["shops"]).where({
		id: shopid
	}).field({
		"_id":0,
		id: 1,
		name: 1,
		src: 1,
		score: 1,
		monthSale: 1,
		latitude: 1,
		longitude: 1,
		address: 1,
		banner: 1,
		notice:1,
		deliveryTime: 1,
		deliveryMin: 1,
		deliveryMoney: 1,
		deliveryMoneyBefore:1,
		perCapita: 1,
		hasManjian: 1,
		manjians: 1
	}).limit(1).get();
	if (data.data.length == 0) {
		return {
			"code": 404,
			"message": "店铺不存在",
		};
	}
	let shopInfo={
		"info":data.data[0]
	};
	//查询分类
	let categories = await db.collection(collectionNames['goods_categories']).where({
		shopid: shopid
	}).field({
		"_id":0,
		"id": 1,
		"name": 1,
		"goodsCount": 1,
		"children": withSubCategory
	}).orderBy("posid", "asc").get();
	//店铺默认分类
	shopInfo["goods_categories"] = [];
	shopInfo["goods"] = [];
	shopInfo["carts"] = [];
	shopInfo["uid"] = uid;
	if (categories.data.length > 0) {
		shopInfo["goods_categories"] = categories.data;
	}
	//查询所有商品
	if(withGoods){
		let goods = await db.collection(collectionNames['goods']).where({
			shopid: shopid
		}).field({
			"_id":0,
			"id": 1,
			"title": 1,
			"stock": 1,
			"src": 1,
			"score": 1,
			"price": 1,
			"skuname":1,
			"skus":1,
			"originPrice": 1,
			"monthlySale": 1,
			"categories": 1,
			"miaosha": 1,
			"yuding": 1,
			"manjian": 1,
		}).orderBy("posid","asc").get();
		if (goods.data.length > 0) {
			shopInfo["goods"] = goods.data;
		}
		//如果存在用户id，需要查询购物车数量
		if(uid > 0){
			let carts = await db.collection(collectionNames['carts']).where({
				shopid: shopid,
				uid:uid
			}).field({
				"_id":0,
				"price": 1,//加入购物车时候的价格，如果降价了，可以提示
				"goods_id": 1,
				"sku_id": 1,
				"amount": 1,
			}).orderBy("_id","desc").get();
			if (carts.data.length > 0) {
				shopInfo["carts"] = carts.data;
			}
		}
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": shopInfo
	};
};

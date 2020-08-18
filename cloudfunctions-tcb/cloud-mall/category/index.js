'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const goodsCategoryCollection = db.collection("cloud_goods_categories");
const cartCollection = db.collection("cloud_carts");
const shopCollection = db.collection("cloud_shops");
const main = async (event) => {
	let shopid = parseInt(event.id);
	const {
		uid
	} = event;
	let withSubCategory = parseInt(event.withSubCategory) == 1;
	let withGoods = parseInt(event.withGoods) == 1;
	//这里需要过滤字段
	let data = await shopCollection.where({
		id: shopid
	}).field({
		"_id": 0,
		id: 1,
		name: 1,
		src: 1,
		score: 1,
		monthSale: 1,
		latitude: 1,
		longitude: 1,
		address: 1,
		banner: 1,
		notice: 1,
		delivery: 1,
		perCapita: 1,
		hasManjian: 1,
		manjians: 1
	}).limit(1).get();
	if (data.data.length == 0) {
		event.message = "店铺不存在";
		return false;
	}
	let shopInfo = {
		"info": data.data[0]
	};
	//查询分类
	let categories = await goodsCategoryCollection.where({
		shopid: shopid
	}).field({
		"_id": 0,
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
	if (withGoods) {
		let goods = await goodsCollection.where({
			shopid: shopid,
			isSold: 1
		}).field({
			"_id": 0,
			"id": 1,
			"title": 1,
			subTitle: 1,
			"stock": 1,
			"src": 1,
			"isSold": 1,
			"score": 1,
			"price": 1,
			"default_checked_sku_id": 1, //多规格默认选中
			"skuname": 1,
			"skus": 1,
			"originPrice": 1,
			"monthlySale": 1,
			"categories": 1,
			"miaosha": 1,
			"yuding": 1,
			"manjian": 1,
		}).orderBy("posid", "asc").get();
		if (goods.data.length > 0) {
			shopInfo["goods"] = goods.data;
		}
		//如果存在用户id，需要查询购物车数量
		if (uid) {
			let carts = await cartCollection.where({
				shopid: shopid,
				uid: uid
			}).field({
				"_id": 0,
				"price": 1, //加入购物车时候的价格，如果降价了，可以提示
				"goods_id": 1,
				"sku_id": 1,
				"amount": 1,
			}).orderBy("_id", "desc").get();
			if (carts.data.length > 0) {
				shopInfo["carts"] = carts.data;
			}
		}
	}
	return shopInfo;
}

module.exports = {
	main
};

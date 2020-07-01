'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	const cmd = db.command;
	let {customUserId} = await auth.getUserInfo();
	//console.log(event)
	let longitude = event.longitude ? +event.longitude : 113.92246555717469;
	let latitude = event.latitude ? +event.latitude : 22.489059185437284;
	let dataOut = {
		uid:+customUserId,
		cart: 0,
		shopId: 0,
		categories: [],
		miaosha: [],
		newest: []
	};
	//根据用户收货地址查询最近的一家店铺
	let shopid = 123457;
	//10公里以内
	let nearestShops = await db.collection("shops").where({
		lnglat: cmd.geoNear({
			geometry: new db.Geo.Point(longitude, latitude),
			minDistance: 0,
			maxDistance: 10000,
		})
	}).field({
		id: 1,
		address: 1,
		name: 1,
		notice: 1,
		searchGoodsKeywords: 1,
		src: 1
	}).limit(5).get();
	if (nearestShops.data.length > 0) {
		shopid = nearestShops.data[0].id;
		dataOut["shop"] = nearestShops.data[0];
	}
	let uid = 0;
	if (customUserId>0) {
		uid = +customUserId;
	}
	dataOut["shopId"] = shopid;
	//查询广告,优先店铺，再是全站
	const ads = await db.collection('ads').where({
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
	let categories = await db.collection('goods_categories').where({
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
	let goodsFields={
		_id: 0,
		id: 1,
		src: 1,
		title: 1,
		miaosha: 1,
		manjian: 1,
		price: 1,
		//skus:1,
		yuding:1,
		stock: 1
	};
	//正在秒杀商品5条,必须是有库存的秒杀
	let miaoshaGoods = await db.collection('goods').where({
		shopid: shopid,
		isSold:1,
		miaosha: cmd.exists(true),
		"miaosha.stock": cmd.gt(0),
		"miaosha.beginTime": cmd.lt(time+24*3600*1000),
		"miaosha.endTime": cmd.gt(time),
	}).field(goodsFields).limit(5).orderBy("miaosha.beginTime","asc").get();
	dataOut["miaosha"] = miaoshaGoods.data;
	//最新上架/最近更新,20条
	let newGoods = await db.collection('goods').where({
		shopid: shopid,
		isSold:1
	}).field(goodsFields).orderBy("onlineTime", "desc").limit(20).get();
	dataOut["newest"] = newGoods.data;
	//购物车总数
	if (uid > 0) {
		const $ = db.command.aggregate
		let res2 = await db.collection('carts').aggregate()
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
	return {
		"code": 200,
		"message": "操作成功",
		"data": dataOut
	};
};

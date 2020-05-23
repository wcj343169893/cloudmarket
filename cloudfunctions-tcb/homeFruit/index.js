'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	const cmd = db.command;
	console.log(event)
	let longitude = event.longitude ? +event.longitude : 113.92246555717469;
	let latitude = event.latitude ? +event.latitude : 22.489059185437284;
	let dataOut = {
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
		src: 1
	}).limit(5).get();
	if (nearestShops.data.length > 0) {
		shopid = nearestShops.data[0].id;
	}
	dataOut["shops"] = nearestShops.data;
	let uid = 0;
	if (event.uid) {
		uid = +event.uid;
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
	//正在秒杀商品5条,必须是有库存的秒杀
	let miaoshaGoods = await db.collection('goods').where({
		shopid: shopid,
		"miaosha.stock": cmd.gt(0),
		"miaosha.beginTime": cmd.lt(time),
		"miaosha.endTime": cmd.gt(time),
	}).field({
		_id: 0,
		id: 1,
		src: 1,
		title: 1,
		miaosha: 1,
		price: 1,
		stock: 1
	}).limit(5).get();
	dataOut["miaosha"] = miaoshaGoods.data;
	//最新上架,20条
	let newGoods = await db.collection('goods').where({
		shopid: shopid
	}).field({
		_id: 0,
		id: 1,
		src: 1,
		title: 1,
		miaosha: 1,
		price: 1,
		stock: 1
	}).orderBy("onlineTime", "desc").limit(20).get();
	dataOut["newest"] = newGoods.data;
	//购物车总数
	if (uid > 0) {
		/* let res = await db.collection('carts').where({
			uid: uid
		}).count();
		if (res) {
			dataOut["cart"] = res.total;
		}*/
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

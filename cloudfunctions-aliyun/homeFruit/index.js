'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	let dataOut = {
		cart: 0,
		shopId:0,
	};
	//根据用户收货地址查询最近的一家店铺
	let shopid = 123457;
	let uid = 10000;
	if (event.uid) {
		uid = +event.uid;
	}
	dataOut["shopId"] = shopid;
	const dbCmd = db.command;
	//查询广告,优先店铺，再是全站
	const ads = await db.collection('ads').where({
		shopid: dbCmd.in([0, shopid])
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
	if (categories.affectedDocs > 0) {
		dataOut["categories"] = categories.data;
	}
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
		if (res2.affectedDocs > 0) {
			dataOut["cart"] = res2.data[0].totalAmount;
		}
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": dataOut
	};
};

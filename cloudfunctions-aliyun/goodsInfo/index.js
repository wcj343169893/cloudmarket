'use strict';
const db = uniCloud.database();
/**
 * 商品详情页面
 */
exports.main = async (event, context) => {
	let id = +event.id;
	let uid = +event.uid;
	const collection = db.collection('goods');
	const cmd = db.command;
	let goods = await collection.where({
		id: id
	}).field({
		"id": 1,
		"title": 1,
		"stock": 1,
		"visite": 1,
		"src": 1,
		"shopid": 1,
		"imgs": 1, //轮播图
		"score": 1,
		"price": 1,
		"skuname": 1,
		"skus": 1,
		"originPrice": 1,
		"monthlySale": 1,
		"categories": 1,
		"miaosha": 1,
		"manjian": 1,
		"description": 1
	}).get();
	if (goods.affectedDocs == 0) {
		return {
			"code": 404,
			"message": "商品不存在"
		};
	}
	//延时处理
	goods.data.map(async (item) => {
		//增加浏览记录,必须存在uid
		//增加浏览量
		return await collection.doc(item._id).update({
			visite: cmd.inc(1)
		});
	})
	let data = goods.data[0];
	//承诺服务
	data["service"] = [
		"7天无理由退换货",
		"假一赔十",
	];
	if (uid > 0) {
		//favorite  是否收藏
		//查询已加入购物车信息amount
		let carts = await db.collection('carts').where({
			shopid: data.shopid,
			goods_id: data.id,
			uid: uid
		}).field({
			"_id": 0,
			"sku_id": 1,
			"amount": 1
		}).get();
		if (carts.affectedDocs > 0) {
			data["cart"] = {};
			//处理成规格对于数量
			carts.data.map(c=>{
				data["cart"][c.sku_id]=c.amount;
			});
		} else {
			data["cart"] = {};
		}

	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

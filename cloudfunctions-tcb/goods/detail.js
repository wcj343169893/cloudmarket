'use strict';
const db = uniCloud.database();
const goodsCollection = db.collection('goods');
const goodsVisiteCollection = db.collection('goods_visites');
/**
 * 商品详情页面
 */
exports.main = async (event, context, uid) => {
	let id = +event.id;
	const cmd = db.command;
	let fields = {
		"id": 1,
		"title": 1,
		"subTitle":1,
		"stock": 1,
		"visite": 1,
		"src": 1,
		"shopid": 1,
		"imgs": 1, //轮播图
		"score": 1,
		"price": 1,
		"skuname": 1,
		"skus": 1,
		"default_checked_sku_id": 1,
		"originPrice": 1,
		"monthlySale": 1,
		"categories": 1,
		"miaosha": 1,
		"manjian": 1,
		"description": 1,
		"yuding": 1
	};
	let goods = await goodsCollection.where({
		id: id
	}).field(fields).limit(1).get();
	if (goods.data.length == 0) {
		return {
			"code": 404,
			"message": "商品不存在"
		};
	}
	let data = goods.data[0];
	//承诺服务
	data["service"] = [
		"7天无理由退换货",
		"假一赔十",
	];
	if (uid > 0) {
		let time = new Date().getTime();
		//延时处理---同步更新浏览记录
		for (let item of goods.data) {
			//商品浏览记录，每人每件商品只存在一条
			console.log("item.id", item.id);
			//增加浏览记录,必须存在uid
			let visite = await goodsVisiteCollection.where({
				uid: uid,
				goods_id: item.id
			}).field({
				goods_id: 1,
				time: 1
			}).limit(1).get();
			console.log("visite.data.length", visite.data.length);
			if (visite.data.length < 1) {
				//新增浏览记录
				let visave = await goodsVisiteCollection.add({
					uid: uid,
					goods_id: item.id,
					title: item.title,
					shopid: item.shopid,
					price: item.price,
					src: item.src,
					time: time
				});
				console.log("visave", visave);

				//增加浏览量
				let incResult = await goodsCollection.doc(item._id).update({
					visite: cmd.inc(1)
				});
				console.log("incResult", incResult);
			} else {
				//console.log(visite.data[0]);
				//更新浏览时间
				let updateVisite = await goodsVisiteCollection.doc(visite.data[0]._id).update({
					src: item.src,
					title: item.title,
					price: item.price,
					time: time
				});
				console.log("updateVisite", updateVisite);
			}
		};
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
		if (carts.data.length > 0) {
			data["cart"] = {};
			//处理成规格对于数量
			carts.data.map(c => {
				data["cart"][c.sku_id] = c.amount;
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

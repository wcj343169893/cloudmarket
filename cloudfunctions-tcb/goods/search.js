'use strict';
const db = uniCloud.database();
const goodsCollection = db.collection('goods');
/**
 * 搜索商品,需要记录搜索日志
 */
exports.main = async (event, context, uid) => {
	let key = event.key.trim();
	if (key == "") {
		return {
			"code": 404,
			"message": "搜索词不能为空"
		};
	}
	let shopid = +event.shopid;
	let page = +event.page;
	let limit = +event.limit;
	let data = await goodsCollection.where({
		shopid: shopid,
		title: new RegExp(key)
	}).field({
		_id: 0,
		id: 1,
		src: 1,
		title: 1,
		miaosha: 1,
		yuding: 1,
		price: 1,
		stock: 1
	}).skip((page - 1) * limit).limit(limit).orderBy("id", "desc").get();
	return {
		"code": 200,
		"message": "操作成功",
		"data": data.data
	};
};

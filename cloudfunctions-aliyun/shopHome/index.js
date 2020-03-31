'use strict';
/* 店铺首页，查询店铺信息，分类 */
const db = uniCloud.database();
const getCollectionNames = require('collection_names');
exports.main = async (event, context) => {
	let shopid = parseInt(event.id);
	let collectionNames = getCollectionNames(event);
	let data = await db.collection(collectionNames["shops"]).where({
		id: shopid
	}).limit(1).get();
	if (data.affectedDocs == 0) {
		return {
			"code": 404,
			"message": "店铺不存在",
		};
	}
	let shopInfo = data.data[0];
	//查询分类
	let categories = await db.collection(collectionNames['goods_categories']).where({
		shopid: shopid
	}).field({
		"id": 1,
		"name": 1,
		"goodsCount": 1,
		"children": 1
	}).orderBy("posid", "asc").get();
	//店铺默认分类
	shopInfo["goods_categories"] = [];
	if (categories.affectedDocs > 0) {
		shopInfo["goods_categories"] = categories.data;
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": shopInfo
	};
};

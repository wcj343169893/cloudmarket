'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	//店铺id
	let shopid = event.id;
	if (!shopid) {
		return [];
	}
	shopid= parseInt(shopid);
	//获取所有集合名称，可能返回分站表名
	let getCollectionNamesFunc = await uniCloud.callFunction({
		name: "getCollectionNames",
		data: event
	});
	let collectionNames = getCollectionNamesFunc.result;
	const cmd = db.command;
	const collection = db.collection(collectionNames['goods_categories']);
	let data = await collection.where({shopid: shopid}).field({
		"id": 1,
		"name": 1,
		"goodsCount":1,
		"children": 1
	}).orderBy("posid", "asc").get();
	return data;
};

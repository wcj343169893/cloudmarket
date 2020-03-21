'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	//店铺id
	let shopid = event.id;
	let cid = event.cid;
	let limit = event.limit || 10;
	let page = event.page || 1;
	if (!shopid || !cid) {
		return [];
	}
	shopid = parseInt(shopid);
	cid = parseInt(cid);
	//获取所有集合名称，可能返回分站表名
	let getCollectionNamesFunc = await uniCloud.callFunction({
		name: "getCollectionNames",
		data: event
	});
	let collectionNames = getCollectionNamesFunc.result;
	const cmd = db.command;
	const collection = db.collection(collectionNames['goods']);
	let data = await collection.where({
		shopid: shopid,
		'categories.id': cid
	}).orderBy("stock", "desc").orderBy("id", "asc").limit(limit).skip((page - 1) * limit).get();
	return data;
};

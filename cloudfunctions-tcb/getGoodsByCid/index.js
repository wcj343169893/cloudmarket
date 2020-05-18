'use strict';
const db = uniCloud.database();
const getCollectionNames = require('collection_names');
exports.main = async (event, context) => {
	//店铺id
	let shopid = event.id;
	let cid = event.cid;
	if (!shopid || !cid) {
		return [];
	}
	shopid = parseInt(shopid);
	cid = parseInt(cid);
	//获取所有集合名称，可能返回分站表名
	let collectionNames = getCollectionNames(event);
	const cmd = db.command;
	const collection = db.collection(collectionNames['goods']);
	//一次性取完整个分类下的数据
	let data = await collection.where({
		shopid: shopid,
		'categories.id': cid
	}).get();
	if(data.data.length ==0){
		return {
			"code":404,
			"message":"无数据",
		};
	}
	return {
		"code":200,
		"message":"操作成功",
		"data":data.data
	};
};

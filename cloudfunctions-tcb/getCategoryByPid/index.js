'use strict';
const db = uniCloud.database()
const getCollectionNames = require('collection_names');
exports.main = async (event, context) => {
	let pid = event.id;
	if (!pid) {
		return [];
	}
	pid = pid * 1;
	//获取所有集合名称，可能返回分站表名
	let collectionNames = getCollectionNames(event);
	const cmd = db.command;
	const collection = db.collection(collectionNames['shop_categories']);
	let data = await collection.where(cmd.or([{
		pid: pid
	}, {
		id: pid
	}])).field({
		"id": 1,
		"name": 1,
		"src": 1
	}).limit(10).orderBy("pid", "asc").orderBy("posid", "asc").get();
	if(data.data.length ==0){
		return {
			"code":404,
			"message":"无数据",
		};
	}
	data.data.map(da=>{
		if(da.id == pid){
			da.name="全部";
		}
		return da;
	});
	return {
		"code":200,
		"message":"操作成功",
		"data":data.data
	};
};

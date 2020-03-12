'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	// 获取 `user` 集合的引用
	const collection = db.collection('ads');
	const data = await collection.limit(5).get();
	return data;
};

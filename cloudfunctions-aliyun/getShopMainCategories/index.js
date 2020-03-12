'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const collection = db.collection('shop_categories');
	const data = await collection.field({
		"id": 1,
		"name": 1,
		"src": 1
	}).limit(10).orderBy("posid", "asc").get();
	return data;
};

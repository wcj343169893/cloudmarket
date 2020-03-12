'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	const collection = db.collection('ads');
	const data = await collection.limit(5).get();
	return data;
};

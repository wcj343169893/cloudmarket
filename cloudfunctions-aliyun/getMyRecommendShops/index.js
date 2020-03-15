'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	if (!event.shop_recommend_uid) {
		event.shop_recommend_uid = 10000;
	}
	let date = new Date();
	let hours = date.getHours() + 8;
	console.log(hours);
	/* const dbCmd = db.command;
	const recommendShopCollection = db.collection('user_recommend_shops');
	const recommendShops = await recommendShopCollection.where({
		"uid": event.shop_recommend_uid,
		"goods": dbCmd.elemMatch({
			"hour": dbCmd.lt(hours)
		})
	}).limit(4).get(); */

	const $ = db.command.aggregate
	let res = await db.collection('user_recommend_shops').aggregate()
		.match({
			"uid": event.shop_recommend_uid
		})
		.project({
			goods: $.arrayElemAt([$.filter({
				input: '$goods',
				as: 'item',
				cond: $.lte(['$$item.hour', hours])
			}),0]),
			shop_id:1,
			shop_name: 1,
			shop_src:1
		})
		.end()
	return res;
};

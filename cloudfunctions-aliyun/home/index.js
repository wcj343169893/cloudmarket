'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	let dataOut = {};
	//获取所有集合名称，可能返回分站表名
	let getCollectionNamesFunc = await uniCloud.callFunction({
		name: "getCollectionNames",
		data: event
	});
	let collectionNames = getCollectionNamesFunc.result;

	//查询广告
	const adCollection = db.collection(collectionNames['ads']);
	const ads = await adCollection.field({
		"background": 1,
		"link": 1,
		"src": 1
	}).limit(5).get();
	dataOut["ads"] = ads.data;
	//常购买店铺,必须有用户信息，才能显示
	if (event.id > 0) {
		const uobsCollection = db.collection(collectionNames['user_often_buy_shops']);
		const oftenShops = await uobsCollection.where({
			"uid": event.id
		}).orderBy("_id", "desc").get();
		dataOut["oftenShops"] = oftenShops.data;
	}
	//店铺主分类
	const categoryCollection = db.collection(collectionNames['shop_categories']);
	const categories = await categoryCollection.where({
		"pid": 0
	}).field({
		"id": 1,
		"name": 1,
		"src": 1
	}).limit(8).orderBy("posid", "asc").get();
	dataOut["categories"] = categories.data;
	//我上级推荐或者我推荐的店铺
	if (!event.shop_recommend_uid) {
		event.shop_recommend_uid = 10000;
	}
	let date = new Date();
	//默认得到的是0时区的小时数
	let hours = date.getHours() + 8;
	const $ = db.command.aggregate
	let recommendShops = await db.collection(collectionNames['user_recommend_shops']).aggregate()
		.match({
			"uid": event.shop_recommend_uid
		})
		.project({
			goods: $.arrayElemAt([$.filter({
				input: '$goods',
				as: 'item',
				cond: $.lte(['$$item.hour', hours])
			}), 0]),
			id: 1,
			name: 1,
			src: 1
		})
		.end()
	dataOut["recommendShops"] = recommendShops.data;
	return dataOut
};

'use strict';
const db = uniCloud.database();
const getCollectionNames = require('collection_names');
exports.main = async (event, context) => {
	let dataOut = {};
	//获取所有集合名称，可能返回分站表名
	/* let getCollectionNamesFunc = await uniCloud.callFunction({
		name: "getCollectionNames",
		data: event
	}); */
	let collectionNames = getCollectionNames(event);

	//查询广告
	const adCollection = db.collection(collectionNames['ads']);
	const ads = await adCollection.field({
		"_id":0,
		"background": 1,
		"link": 1,
		"src": 1
	}).limit(5).get();
	dataOut["ads"] = ads.data;
	//常购买店铺,必须有用户信息，才能显示
	if (event.uid > 0) {
		const uobsCollection = db.collection(collectionNames['user_often_buy_shops']);
		const oftenShops = await uobsCollection.where({
			"uid": event.uid
		}).orderBy("_id", "desc").get();
		dataOut["oftenShops"] = oftenShops.data;
	}
	//店铺主分类
	const categoryCollection = db.collection(collectionNames['shop_categories']);
	const categories = await categoryCollection.where({
		"pid": 0
	}).field({
		"_id":0,
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
			"_id": 0,
			id: 1,
			name: 1,
			src: 1
		})
		.end();
	//查询推荐人姓名
	let recommendUser = await db.collection(collectionNames["users"]).where({id:event.shop_recommend_uid}).field({
		"_id":0,
		"nickname":1,
		"portrait":1
	}).limit(1).get();
	
	dataOut["recommendShops"] = recommendShops.data;
	dataOut["recommendUser"] = recommendUser.data[0];
	return {
		"code":200,
		"message":"操作成功",
		"data":dataOut
	};
};

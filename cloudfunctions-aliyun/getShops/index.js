'use strict';
const db = uniCloud.database();
/**
 * 按条件查询店铺，理论上说，查询附近的店铺，可惜mongodb限制问题，无法查询地理位置，
 */
exports.main = async (event, context) => {
	let limit = event.limit || 10;
	let page = event.page || 1;
	let index = event.index;
	if (page < 1) {
		page = 1;
	}
	//所以这里按店铺销量+评分排序，分页获取
	let getCollectionNamesFunc = await uniCloud.callFunction({
		name: "getCollectionNames",
		data: event
	});
	let collectionNames = getCollectionNamesFunc.result;
	let query = db.collection(collectionNames["shops"]);
	switch (index) {
		case 1:
			query = query.where({
				hasManjian: 1
			})
			break;
		case 2:
			query = query.where({
				deliveryTime: db.command.lte(30)
			})
			break;
		case 3:
			query = query.where({
				deliveryMoneyBefore: db.command.gt(1)
			})
			break;
		default:
			break;
	}
	let data = query.limit(limit).skip((page - 1) * limit).get();
	return data;
};

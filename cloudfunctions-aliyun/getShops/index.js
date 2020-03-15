'use strict';
const db = uniCloud.database();
/**
 * 按条件查询店铺，理论上说，查询附近的店铺，可惜mongodb限制问题，无法查询地理位置，
 */
exports.main = async (event, context) => {
	let limit = event.limit || 10;
	let page = event.page || 1;
	let index = event.index;
	let cid = event.cid;
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
	let where = {};
	switch (index) {
		case 1:
			where["hasManjian"] = 1;
			break;
		case 2:
			where["deliveryTime"] = db.command.lte(30);
			break;
		case 3:
			where["deliveryMoneyBefore"] = db.command.gt(1);
			break;
		case 4:
			where["score"] = db.command.gt(4.0);
			break;
		default:
			break;
	}
	if(cid > 0){
		where["categories.id"]=cid*1;
	}
	//根据前端需要，筛选field
	let data = query.where(where).field({
		id: 1,
		name: 1,
		src: 1,
		score: 1,
		monthSale: 1,
		deliveryMin: 1,
		deliveryMoney: 1,
		deliveryMoneyBefore:1,
		perCapita: 1,
		hasManjian: 1,
		"manjians.name": 1
	}).limit(limit).skip((page - 1) * limit).get();
	return data;
};

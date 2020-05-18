'use strict';
const db = uniCloud.database();
const getCollectionNames = require('collection_names');
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
	//获取所有集合名称，可能返回分站表名
	let collectionNames = getCollectionNames(event);
	let query = db.collection(collectionNames["shops"]);
	let where = {};
	//有满减
	if(index & 1 ==1){
		where["hasManjian"] = 1;
	}
	//30分钟送达
	if((index & 2) == 2){
		where["deliveryTime"] = db.command.lte(30);
	}
	//减配送费===>改为免配送费
	if((index & 4) == 4){
		where["deliveryMoney"] = 0;
	}
	//评分
	if((index & 8) == 8){
		where["score"] = db.command.gt(4.0);
	}
	if(cid > 0){
		where["categories.id"]=cid*1;
	}
	//根据前端需要，筛选field
	let data =await query.where(where).field({
		"_id":0,
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
	}).limit(limit).skip((page - 1) * limit).orderBy("id","desc").get();
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

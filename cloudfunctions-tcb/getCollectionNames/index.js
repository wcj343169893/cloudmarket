'use strict';
exports.main = async (event, context) => {
	//基础
	var bases = ["users", "orders", "carts", "user_often_buy_shops", "user_recommend_shops"];
	//多地区
	var regions = ["ads", "shops", "shop_categories", "shop_comments", "goods", "goods_activities", "goods_categories"];
	var stationId = event.stationId;
	var collections={};
	//必须在正常范围内的地区
	if(stationId){
		for (let coll of regions) {
			collections[coll]="region_"+stationId+"_"+coll;
		}
	}else{
		bases = bases.concat(regions);
	}
	for (let coll of bases) {
		collections[coll] = coll;
	}
	return collections;
};

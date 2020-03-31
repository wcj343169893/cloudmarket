/**
 * 数据库集合分表处理公共函数
 * @param {Object} event.stationId 站点名称
 */
module.exports = function(event) {
	// 公用模块用法请参考 https://uniapp.dcloud.io/uniCloud/quickstart?id=common
	//基础
	var bases = ["users", "orders", "carts", "user_often_buy_shops", "user_recommend_shops"];
	//多地区
	var regions = ["ads", "shops", "shop_categories", "shop_comments", "goods", "goods_activities", "goods_categories"];
	var collections = {};
	//必须在正常范围内的地区
	if (event.stationId) {
		for (let coll of regions) {
			collections[coll] = "region_" + event.stationId + "_" + coll;
		}
	} else {
		bases = bases.concat(regions);
	}
	for (let coll of bases) {
		collections[coll] = coll;
	}
	return collections;
}

'use strict';
const db = uniCloud.database();
const cmd = db.command;
exports.main = async (event, context) => {
	let withData = ["goods", "goods_categories", "identity", "shops", "users"];
	let collections = [
		"addresses",
		"ads",
		"carts",
		"goods",
		"goods_activities",
		"goods_categories",
		"goods_day_sales",
		"goods_shop_day_sales",
		"goods_visites",
		"identity",
		"order_refunds",
		"orders",
		"shop_categories",
		"shop_comments",
		"shops",
		"user_balance_logs",
		"user_often_buy_shops",
		"user_recommend_shops",
		"users"
	];
	let data = {};
	for (let m of collections) {
		data[m] = {};
		let da = await db.collection(m).limit(30).get();
		data[m].data = da.data;
	}
	return data;
};

'use strict';
const db = uniCloud.database();
/**
 * 订单处理
 */
exports.main = async (event, context) => {
	//id为5e9d61c31ee4a2004c55801e
	let id = event.id || event._id;
	let uid = +event.uid;
	let data = {};
	data["order"] = await db.collection("orders").where({
		_id: id
	}).field({
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		state: 1
	}).limit(1).get();
	

	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

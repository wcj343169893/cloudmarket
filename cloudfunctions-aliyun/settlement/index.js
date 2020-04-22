'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	//查询购物车选中数据
	let shopid = parseInt(event.id);
	let uid = parseInt(event.uid);
	const cmd = db.command;
	let carts = await db.collection('carts').where({
		shopid: shopid,
		checked: true,
		uid: uid
	}).field({
		"goods_id": 1,
		"sku_id": 1,
		"amount": 1
	}).get();

	if (carts.affectedDocs == 0) {
		return {
			"code": 404,
			"message": "结算商品不存在"
		};
	}
	let data = {
		"carts": carts.data,
		"address": {},
		"goods":[]
	}
	let ids = [];
	for (let i = 0; i < carts.affectedDocs; i++) {
		ids.push(carts.data[i].goods_id);
	}
	//查询实时商品信息
	let goods = await db.collection('goods').where({
		shopid: shopid,
		id: cmd.in(ids)
	}).field({
		"id": 1,
		"title": 1,
		"stock": 1,
		"src": 1,
		"price": 1,
		"skus": 1,
		"originPrice": 1,
	}).get();

	if (goods.affectedDocs > 0) {
		data["goods"] = goods.data;
	}
	//查询默认收货地址
	let address = await db.collection('addresses').where({
		uid: uid
	}).orderBy("default", "desc").limit(1).get();
	if (address.affectedDocs > 0) {
		data["address"] = address.data[0];
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

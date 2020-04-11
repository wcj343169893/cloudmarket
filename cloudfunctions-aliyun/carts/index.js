'use strict';
const db = uniCloud.database();
const getCollectionNames = require('collection_names');
exports.main = async (event, context) => {
	let shopid = parseInt(event.id);
	let uid = parseInt(event.uid);
	//list full edit
	let opt = event.opt;
	if (shopid < 1 || uid < 1) {
		return {
			"code": 404,
			"message": "用户或店铺信息不存在",
		};
	}
	//获取所有collection名称
	let collectionNames = getCollectionNames(event);
	let data = [];
	let cartCollection = db.collection(collectionNames['carts']);
	if (opt == "list") {
		//查询列表
		let carts = await cartCollection.where({
			shopid: shopid,
			uid: uid
		}).field({
			"_id": 0,
			"goods_id": 1,
			"sku_id": 1,
			"amount": 1,
		}).get();
		if (carts.affectedDocs > 0) {
			data = carts.data;
		}
	} else if (opt == "full") {
		let carts = await cartCollection.where({
			shopid: shopid,
			uid: uid
		}).field({
			"_id": 0,
			"goods_id": 1,
			"sku_id": 1,
			"amount": 1,
			"created": 1,
			"price": 1,
			"src": 1
		}).get();
		if (carts.affectedDocs > 0) {
			data = carts.data;
		}
	} else if (opt == "clean") {
		//清空当前用户在指定店铺的所有数据
		let res = await cartCollection.where({
		  shopid: shopid,
		  uid: uid,
		}).remove();
		data="ok";
	} else if (opt == "edit") {
		//增加或者删除
		//商品id
		let goods_id = parseInt(event.goods_id);
		//规格
		let sku_id = event.sku_id ? parseInt(event.sku_id) : 0;
		//数量
		let amount = event.amount ? parseInt(event.amount) : 0;
		if(goods_id < 1){
			return {
				"code": 404,
				"message": "商品不存在",
			};
		}
		//查询是否存在，否则新增
		let cartsOld = await cartCollection.where({
			shopid: shopid,
			uid: uid,
			goods_id: goods_id,
			sku_id: sku_id,
		}).field({
			amount: 1
		}).get();
		let date = new Date();
		if (cartsOld.affectedDocs == 0) {
			if(amount < 1){
				return {
					"code": 404,
					"message": "商品不存在",
				};
			}
			let reslt = await cartCollection.add({
				shopid: shopid,
				uid: uid,
				goods_id: goods_id,
				sku_id: sku_id,
				amount: amount,
				created: date.toISOString()
			});
			data = "ok";
		} else if(amount < 1){
			//删除购物车
			let reslt = await cartCollection.doc(cartsOld.data[0]._id).remove();
			data = "ok";
		} else {
			let reslt = await cartCollection.doc(cartsOld.data[0]._id).update({
				amount: amount
			});
			data = "ok";
		}
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

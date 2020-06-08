'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let {customUserId} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let shopid = parseInt(event.id);
	let uid = +customUserId;
	//list full edit
	let opt = event.opt;
	if (shopid < 1) {
		return {
			"code": 404,
			"message": "用户或店铺信息不存在",
		};
	}
	//获取所有collection名称
	//let collectionNames = getCollectionNames(event);
	let data = [];
	let cartCollection = db.collection("carts");

	const cmd = db.command;
	if (opt == "list") {
		//查询列表
		let carts = await cartCollection.where({
			shopid: shopid,
			uid: uid
		}).field({
			"goods_id": 1,
			"sku_id": 1,
			"amount": 1,
		}).get();
		if (carts.data.length > 0) {
			data = carts.data;
		}
	} else if (opt == "full") {
		let carts = await cartCollection.where({
			shopid: shopid,
			uid: uid
		}).field({
			"goods_id": 1,
			"sku_id": 1,
			"amount": 1,
			"created": 1,
			"modified": 1,
			"checked": 1,
			"src": 1,
			"title": 1,
			"subTitle": 1,
			"price": 1
		}).orderBy("created", "desc").get();
		if (carts.data.length > 0) {
			//data = carts.data;
			data = {
				"cart": carts.data,
				"goods": []
			}
			let ids = [];
			for (let i = 0; i < carts.data.length; i++) {
				ids.push(carts.data[i].goods_id);
			}
			//查询实时商品信息
			let goods = await db.collection("goods").where({
				shopid: shopid,
				id: cmd.in(ids)
			}).field({
				"_id": 0,
				"id": 1,
				"title": 1,
				"stock": 1,
				"src": 1,
				"score": 1,
				"price": 1,
				"skuname": 1,
				"skus": 1,
				"originPrice": 1,
				"monthlySale": 1,
				"categories": 1,
				"miaosha": 1,
				"manjian": 1,
				"yuding": 1,
			}).get();
			if (goods.data.length > 0) {
				data["goods"] = goods.data;
			}
		} else {
			return {
				"code": 404,
				"message": "无数据",
			};
		}
	} else if (opt == "settlement") {
		//设置结算属性
		let ids = [];
		if (event.cartIds) {
			ids = event.cartIds.split(",");
		}
		if (ids.length < 1) {
			return {
				"code": 404,
				"message": "商品不存在",
			};
		}
		//其他商品设置为不结算
		let res = await cartCollection.where({
			shopid: shopid,
			uid: uid,
			_id: cmd.nin(ids)
		}).update({
			settlement: false,
		});
		//设置特定商品为结算
		let res2 = await cartCollection.where({
			shopid: shopid,
			uid: uid,
			_id: cmd.in(ids)
		}).update({
			settlement: true,
		});
		data = res2;
	} else if (opt == "selected") {
		//批量选中
		let checked = event.checked ? true : false;
		let condition = {
			shopid: shopid,
			uid: uid,
			checked: !checked
		};
		//批量处理指定的购物车信息
		if (event.cartIds) {
			condition["_id"] = cmd.in(event.cartIds.split(","));
		}
		let res = await cartCollection.where(condition).update({
			checked: checked,
		});
		data = "ok";
	} else if (opt == "clean") {
		let condition = {
			shopid: shopid,
			uid: uid
		};
		//移除指定多条信息
		if (event.cartIds) {
			condition["_id"] = cmd.in(event.cartIds.split(","));
		}
		//清空当前用户在指定店铺的所有数据
		let res = await cartCollection.where(condition).remove();
		data = "ok";
	} else if (opt == "addmany") {
		let goodsList = event.data;
		if (goodsList.length < 1) {
			return {
				"code": 404,
				"message": "商品不存在"
			};
		}
		//其他商品设置为不结算
		let res = await cartCollection.where({
			shopid: shopid,
			uid: uid
		}).update({
			settlement: false,
		});
		//循环加入购物车
		let date = new Date();
		for (let ele of goodsList) {
			ele.settlement = true;
			await saveCartInfo(ele, shopid, uid, date);
		}
		return {
			"code": 200,
			"message": "批量添加成功"
		};
	} else if (opt == "edit") {
		//增加或者删除
		//商品id
		event.goods_id = +event.goods_id;
		//规格
		event.sku_id = +event.sku_id;
		//数量
		event.amount = +event.amount;
		//当前卖价
		event.price = +event.price;
		//默认选中
		event.checked = event.checked ? true : false;
		if (event.goods_id < 1) {
			return {
				"code": 404,
				"message": "商品不存在",
			};
		}
		data = await saveCartInfo(event, shopid, uid, new Date());
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

const saveCartInfo = async function(ele, shopid, uid, date) {
	let cartCollection = db.collection("carts");
	//查询是否存在，否则新增
	let cartsOld = await cartCollection.where({
		shopid: shopid,
		uid: uid,
		goods_id: ele.goods_id,
		sku_id: ele.sku_id,
	}).field({
		amount: 1,
		checked: 1
	}).limit(1).get();
	if (cartsOld.data.length == 0) {
		//新增
		return await cartCollection.add({
			shopid: shopid,
			uid: uid,
			goods_id: ele.goods_id,
			sku_id: ele.sku_id,
			amount: ele.amount,
			title: ele.title,
			subTitle: ele.subTitle,
			checked: true,
			src: ele.src ? ele.src : "",
			price: ele.price ? +ele.price : 0,
			settlement: ele.settlement ? true : false,
			modified: date.toISOString(),
			created: date.toISOString()
		});
	} else if (ele.amount < 1) {
		//删除购物车
		return await cartCollection.doc(cartsOld.data[0]._id).remove();
	} else {
		//更新
		return await cartCollection.doc(cartsOld.data[0]._id).update({
			amount: ele.amount,
			checked: ele.checked,
			src: ele.src ? ele.src : "",
			price: ele.price ? +ele.price : 0,
			settlement: ele.settlement ? true : false,
			modified: date.toISOString()
		});
	}
}

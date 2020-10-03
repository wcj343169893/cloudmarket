'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const cartCollection = db.collection("cloud_carts");
const models = {
	//列表
	async list(data) {
		const {
			shopid,
			uid
		} = data;
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
			return carts.data;
		}
		return false;
	},
	//完整购物车数据
	async full(data) {
		const {
			shopid,
			uid
		} = data;
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
			let ids = [];
			for (let i = 0; i < carts.data.length; i++) {
				ids.push(carts.data[i].goods_id);
			}
			//查询实时商品信息
			let goods = await goodsCollection.where({
				shopid: shopid,
				isCategoryShow: 1,
				isSold: 1,
				id: cmd.in(ids)
			}).field({
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
				"tuangou": 1
			}).get();
			return {
				"cart": carts.data,
				"goods": goods.data
			}
		}
		return false;
	},
	//选中或者取消选中
	async selected(data) {
		const {
			shopid,
			uid,
			cartIds
		} = data;
		//批量选中
		let checked = data.checked ? true : false;
		let condition = {
			shopid: shopid,
			uid: uid,
			checked: !checked
		};
		//批量处理指定的购物车信息
		if (cartIds) {
			condition["_id"] = cmd.in(cartIds.split(","));
		}
		return await cartCollection.where(condition).update({
			checked: checked,
		});
	},
	//全部清理掉
	async clean(data) {
		const {
			shopid,
			uid,
			cartIds
		} = data;
		let condition = {
			shopid: shopid,
			uid: uid
		};
		//移除指定多条信息
		if (cartIds) {
			condition["_id"] = cmd.in(cartIds.split(","));
		}
		//清空当前用户在指定店铺的所有数据
		return await cartCollection.where(condition).remove();
	},
	async addmany(data) {
		const {
			shopid,
			uid
		} = data;
		let goodsList = data.data;
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
		return "批量添加成功";
	},
	async edit(event) {
		const {
			id,
			uid
		} = event;

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
		//如果存在，是否累加
		event.appends = event.appends ? true : false;
		if (event.goods_id < 1) {
			return {
				"code": 404,
				"message": "商品不存在",
			};
		}
		let result = await saveCartInfo(event, id, uid, new Date());
		if (!result) {
			return false;
		}
		return result;
	},
	//设置为结算状态
	async settlement(event) {
		const {
			shopid,
			uid
		} = event;
		//设置结算属性
		let ids = [];
		if (event.cartIds) {
			ids = event.cartIds.split(",");
		}
		if (ids.length < 1) {
			event.message = "商品不存在";
			return false;
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
		return await cartCollection.where({
			shopid: shopid,
			uid: uid,
			_id: cmd.in(ids)
		}).update({
			settlement: true,
		});
	},
	/**
	 * 查询购物车总数量
	 * @param {Object} data
	 */
	async total(data) {
		const {
			shopid,
			uid
		} = data;
		const $ = db.command.aggregate
		let res2 = await cartCollection.aggregate()
			.match({
				shopid: shopid,
				uid: uid
			}).group({
				_id: null,
				totalAmount: $.sum('$amount')
			})
			.end();
		if (res2.data.length > 0) {
			return res2.data[0].totalAmount;
		}
		return "0"
	}
}

/**
 * 保存到购物车
 * @param {Object} ele
 * @param {Object} shopid
 * @param {Object} uid
 * @param {Object} date
 */
const saveCartInfo = async function(ele, shopid, uid, date) {
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
	if (ele.amount < 1) {
		//删除购物车
		return await cartCollection.doc(cartsOld.data[0]._id).remove();
	}
	let goodsInfo = await getGoodsById(ele.goods_id);
	if (!goodsInfo) {
		return {
			"code": 404,
			"message": "商品不存在",
		};
	}

	let amount = ele.amount;
	if (cartsOld.data.length > 0 && ele.appends) {
		amount += cartsOld.data[0].amount;
	}
	//判断库存是否充足
	if (goodsInfo.stock < amount) {
		ele.message = "商品库存不足";
		return false;
	}
	let time = new Date().getTime();
	if (goodsInfo.skus) {
		let sku = goodsInfo.skus.filter(sku => {
			return sku.id == ele.sku_id;
		});
		sku = sku[0];
		goodsInfo.subTitle = sku.name.replace('&gt;', ' ');
		goodsInfo.price = sku.price;
		if (sku.src) {
			goodsInfo.src = sku.src;
		}
	}
	//判断是否限购，只有秒杀商品指定型号,支持没有型号情况，必须在秒杀期间
	if (goodsInfo.miaosha && time < goodsInfo.miaosha.endTime && time > goodsInfo.miaosha.beginTime) {
		if ((!ele.sku_id || ele.sku_id == goodsInfo.miaosha.sku_id) && goodsInfo.miaosha.limit > 0 &&
			goodsInfo.miaosha.limit < amount) {
			ele.message = `商品限购${goodsInfo.miaosha.limit}件`;
			return false;
		}
		goodsInfo.price = goodsInfo.miaosha.price;
	} else if (goodsInfo.tuangou && time < goodsInfo.tuangou.endTime && time > goodsInfo.tuangou.beginTime) {
		goodsInfo.price = goodsInfo.tuangou.price;
	}
	if (cartsOld.data.length == 0) {
		//新增
		return await cartCollection.add({
			shopid: shopid,
			uid: uid,
			goods_id: ele.goods_id,
			sku_id: ele.sku_id,
			amount: ele.amount,
			title: goodsInfo.title,
			subTitle: goodsInfo.subTitle ? goodsInfo.subTitle : "",
			checked: true,
			src: goodsInfo.src,
			price: goodsInfo.price,
			settlement: ele.settlement ? true : false,
			modified: date.toISOString(),
			created: date.toISOString()
		});
	} else {
		//更新
		return await cartCollection.doc(cartsOld.data[0]._id).update({
			amount: ele.appends ? cmd.inc(ele.amount) : ele.amount,
			checked: ele.checked,
			subTitle: goodsInfo.subTitle ? goodsInfo.subTitle : "",
			src: goodsInfo.src,
			price: goodsInfo.price,
			settlement: ele.settlement ? true : false,
			modified: date.toISOString()
		});
	}
}

const getGoodsById = async function(id) {
	const goodsInfo = await goodsCollection.where({
		id: id,
		isCategoryShow: 1,
		isSold: 1
	}).field({
		id: 1,
		title: 1,
		src: 1,
		price: 1,
		skus: 1,
		stock: 1,
		miaosha: 1,
		tuangou: 1
	}).limit(1).get();
	if (goodsInfo.data.length == 0) {
		return false;
	}
	return goodsInfo.data[0];
}

module.exports = models;

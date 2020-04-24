'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
	//查询购物车选中数据
	let shopid = parseInt(event.id);
	let uid = parseInt(event.uid);
	let addressid = event.addressid;
	let type = event.type;
	const cmd = db.command;
	let carts = await db.collection('carts').where({
		shopid: shopid,
		checked: true,
		uid: uid
	}).field({
		"goods_id": 1,
		"sku_id": 1,
		"price": 1,
		"amount": 1
	}).get();

	if (carts.affectedDocs == 0) {
		return {
			"code": 404,
			"message": "结算商品不存在"
		};
	}
	let data = {
		"shopid": shopid,
		"uid": uid,
		"cartCount": 0, //总件数
		"totalMoney": 0,
		"stockNotEnough": [],
		"totalDiscount": 0,
		"address": {},
		"goods": []
	}
	let ids = [];
	let cartMap = {};
	//处理商品购物车数据
	carts.data.forEach(ct => {
		cartMap[ct.goods_id + '_' + ct.sku_id] = {
			price: ct.price,
			amount: ct.amount
		};
		data.cartCount += ct.amount;
		ids.push(ct.goods_id);
	});
	const goodsCollection = db.collection('goods');
	//查询实时商品信息
	let goods = await goodsCollection.where({
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
		let goodsOut = [];
		//处理选中数量
		goods.data.forEach(ele => {
			if (ele.skus && ele.skus.length > 0) {
				ele.skus.forEach(sku => {
					//相当于clone对象
					let goo = { ...ele
					};
					goo["hasSku"] = true;
					//删除多型号
					delete goo.skus;
					let key = ele.id + '_' + sku.id;
					if (cartMap[key] && cartMap[key].amount > 0) {
						goo["cart"] = cartMap[key].amount;
						goo.sku_id = sku.id;
						goo.price = sku.price;
						//加入购物车时的差价
						goo.cutPrice = 0;
						if (cartMap[key].price > sku.price) {
							goo.cutPrice = cartMap[key].price - sku.price;
						}
						goo.stock = sku.stock;
						goo.originPrice = sku.originPrice;
						goo.subName = sku.name.replace('&gt;', ' ');
						if (sku.src) {
							goo.src = sku.src;
						}
						goodsOut.push(goo);
					}
				});
			} else {
				let key = ele.id + '_0';
				ele["cart"] = cartMap[key].amount;
				ele["hasSku"] = false;
				ele.sku_id = 0;
				//加入购物车时的差价
				ele.cutPrice = 0;
				if (cartMap[key].price > ele.price) {
					ele.cutPrice = cartMap[key].price - ele.price;
				}
				goodsOut.push(ele);
			}
		});
		goodsOut.forEach(ele => {
			//购物车总价格
			data.totalMoney += ele.price * ele.cart;
			if (ele.originPrice > 0) {
				//购物车总折扣
				data.totalDiscount += (ele.originPrice - ele.price) * ele.cart;
			}
			//检查库存是否不足
			if (ele.cart > ele.stock) {
				data.stockNotEnough.push(ele);
			}
		})
		data["goods"] = goodsOut;
	}
	//查询默认收货地址,结算的时候，前端传addressid
	let addressCondition = {
		uid: uid
	};
	if (addressid) {
		addressCondition["_id"] = addressid;
	}
	let address = await db.collection('addresses').where(addressCondition).orderBy("default", "desc").limit(1).get();
	if (address.affectedDocs > 0) {
		data["address"] = address.data[0];
	}
	//提交订单
	if (type && type == "submit") {
		//收货地址不存在
		if (!data.address._id) {
			return {
				"code": 404,
				"message": "收货地址错误"
			};
		}
		//结算商品不存在
		if (data.goods.lengt < 1) {
			return {
				"code": 404,
				"message": "商品不存在"
			};
		}
		//检查是否存在库存不足的商品
		if (data.stockNotEnough.lengt > 0) {
			return {
				"code": 404,
				"message": "商品库存不足",
				"data": data
			};
		}
		data.goods.forEach(ele => {
			//减少库存,默认下单减库存，inc,这里不像redis能返回更新后的结果，所以还是可能会出现超卖的情况
			//有问题
			/* if (ele.hasSku) {
				let res = await goodsCollection.where({
					_id: ele._id,
					"skus.id": ele.sku_id
				}).update({
					monthlySale: cmd.inc(ele.cart),
					stock: cmd.inc(-1 * ele.cart),
					'skus.$.stock': cmd.inc(-1 * ele.cart)
				});
			} else {
				let res = await goodsCollection.where({
					_id: ele._id
				}).update({
					monthlySale: cmd.inc(ele.cart),
					stock: cmd.inc(-1 * ele.cart)
				});
			} */
			//@todo保存商品每日销量
		});
		//备注
		data["remark"] = event.remark;
		const day = new Date().toISOString();
		data["created"] = day;
		data["modified"] = day;
		//用户设备信息
		data["platform"] = [
			context.OS,
			context.PLATFORM
		].join(",");
		data["requestId"] = context.requestId;
		//用户真实ip
		data["ip"] = context.headers["x-forwarded-for"].split(",")[0];
		//状态：0未付款，1已付款，2已发货，3已收货
		data["state"] = 0;
		//字典表递增获得位id
		data["id"] = 0;
		//保存订单
		let res = await db.collection("orders").add(data);
		if (res.inserted == 0) {
			return {
				"code": 404,
				"message": "提交订单失败",
			};
		}
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

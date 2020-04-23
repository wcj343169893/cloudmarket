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
		let goodsOut = [];
		//处理选中数量
		goods.data.forEach(ele => {
			if (ele.skus && ele.skus.length > 0) {
				ele.skus.forEach(sku => {
					let goo = { ...ele
					};
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

	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

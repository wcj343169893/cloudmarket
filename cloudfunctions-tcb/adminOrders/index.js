'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	updateUserOrderCount
} = require('base-common');
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let {customUserId} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let shopid = +event.shopid;
	let uid = +customUserId;
	let type = event.type || "list";
	//0全部，1待付款，2已付款，待收货，3待评价
	//实际状态值：-2删除，-1取消，0未付款，1已付款，2已发货，3已收货待评价
	let state = event.state;
	let data;
	let conditions = {
		shopid: shopid
	};
	let time = new Date().getTime();
	const orderCollection = db.collection("orders");
	//console.log(event)
	if (type == "list") {
		let page = +event.page;
		let limit = +event.limit;
		if (page < 1) {
			page = 1;
		}
		if (limit < 1) {
			limit = 10;
		}
		//'payup':"未发货", 'delivered':'已发货', 'received':'已收货', 'estimated':'已评价', 'refunded':'退款/售后'
		switch (state) {
			case "unpaid":
				//1待付款
				conditions["state"] = 0;
				conditions["lastPayTime"] = cmd.gt(time);
				break;
			case "payup":
				//2已付款,待发货
				conditions["state"] = 1;
				break;
			case "delivered":
				//已发货，待收货
				conditions["state"] = 2;
				break;
			case "received":
				//已发货，待收货
				conditions["state"] = 3;
				break;
			case "estimated":
				//已评价
				conditions["state"] = 4;
				break;
			case "refunded":
				//售后----待定
				conditions["state"] = 4;
				break;
			default:
				conditions["state"] = cmd.gt(-1);
				conditions["isDelete"] = 0;
				break;
		}
		data = await orderCollection.where(conditions).orderBy("id", "desc").skip((page - 1) * limit).limit(limit).field({
			id: 1,
			totalMoney: 1,
			totalDiscount: 1,
			state: 1,
			created: 1,
			goods: 1,
			cartCount: 1,
			address: 1,
			cancelStyle: 1,
			remark: 1,
			shopid: 1,
			"payInfo.time": 1,
			"payInfo.name": 1,
			yuding:1,
			lastPayTime: 1
		}).get();
		data["page"] = page;
		data["limit"] = limit;
	} else {
		conditions["_id"] = event.id;
		let field = {
			state: 1,
			shopid:1,
			uid:1
		};
		data = await orderCollection.where(conditions).field(field).get();
		if (data.data.length == 0) {
			return {
				"code": 404,
				"message": "订单不存在"
			};
		}
		let order = data.data[0];
		if (type == "addDelivery") {
			if(order.state != 1){
				return {
					"code": 404,
					"message": "订单状态异常"+order.state
				};
			}
			//@todo 如果是单个商品发货，需要对单个商品更新state状态，否则只更新全部
			data = await orderCollection.doc(order._id).update({
				state: 2
			});
			//更新用户已发货和已收货
			let resUser = await updateUserOrderCount(order.uid, "delivered", 1, "payup", order.shopid);
		}
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

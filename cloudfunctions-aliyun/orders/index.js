'use strict';
const db = uniCloud.database();
/**
 * 订单处理
 */
exports.main = async (event, context) => {
	//id为5e9d61c31ee4a2004c55801e
	let id = event.id || event._id;
	let uid = +event.uid;
	let type = event.type || "list";
	//0全部，1待付款，2已付款，待收货，3待评价
	//实际状态值：-2删除，-1取消，0未付款，1已付款，2已发货，3已收货待评价
	let state = +event.state;
	let page = +event.page;
	let limit = +event.limit;
	if (page < 1) {
		page = 1;
	}
	if (limit < 1) {
		limit = 10;
	}
	let conditions = {
		uid: uid
	};
	let data;
	const cmd = db.command;
	const orderCollection = db.collection("orders");
	if (type == "list") {
		if (state > 0) {
			switch (state) {
				case 1:
					//1待付款
					conditions["state"] = 0;
					break;
				case 2:
					//2已付款，待收货
					conditions["state"] = 1;
					break;
				case 3:
					//3待评价
					conditions["state"] = 3;
					break;
				case 4:
					//售后
					conditions["state"] = 4;
					break;
				default:
					conditions["state"] = cmd.gt(-2);
					break;
			}
		}
		data = await orderCollection.where(conditions).field({
			id: 1,
			totalMoney: 1,
			totalDiscount: 1,
			state: 1,
			created: 1,
			goods: 1,
			cartCount: 1,
			address: 1
		}).skip((page - 1) * limit).limit(limit).orderBy("_id", "desc").get();
		data["page"] = page;
		data["limit"] = limit;
	}else{
		//取消未付款的订单
		conditions["_id"]=id;
		if(type == "cancel"){
			conditions["state"]=cmd.in([0,-1]);
		}
		data = await orderCollection.where(conditions).limit(1).field({
			state:1
		}).get();
		if(data.affectedDocs == 0){
			return {
				"code": 404,
				"message": "订单不存在"
			}; 
		}
		let order = data.data[0];
		if(order.state == -1){
			return {
				"code": 404,
				"message": "订单已取消"
			}; 
		}
		if(type == "cancel"){
			data = await orderCollection.doc(order._id).update({state:-1});
		}
	}

	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

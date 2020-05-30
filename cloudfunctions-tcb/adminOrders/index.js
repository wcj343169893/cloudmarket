'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	getLoginUser
} = require('token');
exports.main = async (event, context) => {
	let {
		customUserId
	} = await getLoginUser(event);
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let shopid = +event.shopid;
	let uid = customUserId;
	let type = event.type || "list";
	//0全部，1待付款，2已付款，待收货，3待评价
	//实际状态值：-2删除，-1取消，0未付款，1已付款，2已发货，3已收货待评价
	let state = +event.state;
	let data;
	let conditions = {
		shopid: shopid
	};
	let time = new Date().getTime();
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
		if (state > 0) {
			switch (state) {
				case 1:
					//1待付款
					conditions["state"] = 0;
					conditions["lastPayTime"] = cmd.gt(time);
					break;
				case 2:
					//2待发货
					conditions["state"] = 1;
					break;
				case 3:
					//3待评价，已收货
					conditions["state"] = 3;
					break;
				case 4:
					//售后
					conditions["state"] = 4;
					break;
				default:
					//conditions["state"] = cmd.gt(-2);
					conditions["isDelete"] = 0;
					break;
			}
		}
		data = await db.collection("orders").where(conditions).orderBy("id", "desc").skip((page - 1) * limit).limit(limit).field({
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
			lastPayTime: 1
		}).get();
		data["page"] = page;
		data["limit"] = limit;
	}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

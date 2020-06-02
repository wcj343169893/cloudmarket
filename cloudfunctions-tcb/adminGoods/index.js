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
	//商品类型,"online"在售,"miaosha"秒杀,"yushou"预售,"baokuan"爆款,"shouqin"即将售罄
	let state = event.state;
	let data;
	let conditions = {
		shopid: shopid
	};
	let time = new Date().getTime();
	const goodsCollection = db.collection("goods");
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
		let order = ["id", "desc"];
		switch (state) {
			case "online":
				//1所有
				break;
			case "miaosha":
				//2秒杀
				conditions["miaosha"] = cmd.exists(true);
				break;
			case "yuding":
				//预售
				conditions["yuding"] = cmd.exists(true);
				break;
			case "baokuan":
				//爆款,按销量排序
				order = ["sales", "desc"];
				break;
			case "shouqin":
				//即将售罄，库存小于10
				conditions["stock"] = cmd.lt(10);
				order = ["stock", "asc"];
				break;
			default:
				break;
		}
		data = await goodsCollection.where(conditions).orderBy(...order).skip((page - 1) * limit).limit(limit).field({
			"id": 1,
			"title": 1,
			"stock": 1,
			"visite": 1,
			"src": 1,
			"shopid": 1,
			"imgs": 1, //轮播图
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
		data["page"] = page;
		data["limit"] = limit;
	} else {}
	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

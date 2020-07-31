'use strict';
const db = uniCloud.database();
const cmd = db.command;
/**
 * 分页查询店铺秒杀商品
 */
exports.main = async (event, context) => {
	let shopid = +event.shopid;
	let page = +event.page;
	let limit = +event.limit;
	let time = new Date().getTime();
	//正在秒杀商品5条,必须是有库存的秒杀
	let miaoshaGoods = await db.collection('goods').where({
		shopid: shopid,
		isSold:1,
		"miaosha.stock": cmd.gt(0),
		"miaosha.beginTime": cmd.lt(time+24*3600*1000),
		"miaosha.endTime": cmd.gt(time),
	}).field({
		_id: 0,
		id: 1,
		src: 1,
		title: 1,
		subTitle:1,
		isSold:1,
		miaosha: 1,
		price: 1,
		stock: 1
	}).skip((page - 1) * limit).limit(limit).orderBy("miaosha.beginTime","desc").get();
	return {
		"code": 200,
		"message": "操作成功",
		"data": miaoshaGoods.data
	};
};

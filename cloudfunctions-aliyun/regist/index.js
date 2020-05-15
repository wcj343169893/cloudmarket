'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	/* //服务端当前时间
	const day = new Date().toISOString();
	const collection = db.collection('users');
	//验证手机号是否已经存在，微信openid。。。
	event["regist"] = day	;
	event["lastLogin"] = day;
	console.log(event);
	let res = await collection.add(event);
	return res.inserted; */
	/* let cart = 3;
	const cmd = db.command;
	let res = await db.collection('goods').where({
		_id:"5e75bd28d040d3004cb60b7c",
		"skus.id":10001
	}).update({
		stock:cmd.inc(-1*cart),
		'skus.$.stock':cmd.inc(-1*cart)
	}); */
	/* let os = context.OS //客户端操作系统，返回值：android、ios    等
	  let platform = context.PLATFORM //运行平台，返回值为 mp-weixin、app-plus等
	  let appid = context.APPID // manifest.json中配置的appid
	
	return [os,platform,appid]; */

	const cmd = db.command;
	/* let res =await db.collection("identity").where({"key":"orders"}).update({
		value:cmd.inc(1)
	}); */
	/* 
	await db.collection("identity").doc("5eb1166933bd17004e01b396").update({
		value:cmd.inc(1)
	});
	let res = await db.collection("identity").doc("5eb1166933bd17004e01b396").get(); */
	/* let res = await db.collection("goods").where({
		_id: "5e75bd15b1e402004d1dbbce",
		stock:cmd.gte(5)
	}).update({
		miaosha:{
			stock:cmd.inc(-1 * 5),
			sales:cmd.inc(5)
		}
	}); */
	//{"affectedDocs":1,"updated":1}


	/* let res = await db.collection('goods').where({
		_id: "5e75bd28d040d3004cb60b7c",
	}).update({
		"skus.1.stock":222
	}); */
	let carts = await db.collection('carts').where({
		checked: true,
		uid: 10000
	}).field({
		"goods_id": 1,
		"sku_id": 1,
		"price": 1,
		"amount": 1
	}).get();
	for (let ele of carts.data) {
		let res = await deleteCart(ele);
		console.log(res);
	}
	return carts;
};


const deleteCart = function(ele) {
	return db.collection('carts').where({
		"goods_id": ele.goods_id,
		"sku_id": ele.sku_id,
		uid: 10000
	}).update({
		amount: 4
	});
}

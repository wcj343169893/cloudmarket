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
	//{"data.length":1,"updated":1}


	/* let res = await db.collection('goods').where({
		_id: "5e75bd28d040d3004cb60b7c",
	}).update({
		"skus.1.stock":222
	}); */
	/* let carts = await db.collection('carts').where({
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
	} */
	// 清理全部数据
	/* const collection = db.collection('carts');
	let res = await collection.get();
	console.log(1)
	let data = res.data.map(async (document) => {
		console.log(2)
		let r = await collection.doc(document._id).update({
			time:new Date().getTime()
		});
		console.log(3,r);
		return r;
	});
	console.log(4)
	return data; */

	/* const orderCollection = db.collection("orders");
	let order = await orderCollection.doc("5ebe930933bd17004e01ca6d").field({
		goods:1,
		state:1
	}).get();
	return order; */
	const app = uniCloud.init({
	  spaceId: 'cloud-market-3c5868',
	  credentials: require('./credentials.json')
	});
	
	const auth = app.auth();
	
	let customUserId = '10000';
	
	const ticket = auth.createTicket(customUserId, {
	  refresh: 10 * 60 * 1000 // 每十分钟刷新一次登录态， 默认为一小时
	});
	return ticket;
};
/* 

const deleteCart = function(ele) {
	return db.collection('carts').where({
		"goods_id": ele.goods_id,
		"sku_id": ele.sku_id,
		uid: 10000
	}).update({
		amount: 4
	});
}
 */

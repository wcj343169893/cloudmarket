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
	/* const app = uniCloud.init({
	  spaceId: 'cloud-market-3c5868',
	  credentials: require('./credentials.json')
	});
	
	const auth = app.auth();
	
	let customUserId = '10000';
	
	const ticket = auth.createTicket(customUserId, {
	  refresh: 10 * 60 * 1000 // 每十分钟刷新一次登录态， 默认为一小时
	});
	return ticket; */
	let po = new db.Geo.Point(113.91934346588135, 22.487874584531095);
	let str =
		"113.90341758728027 22.46917851496644,113.90745162963867 22.47020960449022,113.90839576721191 22.471875194432027,113.91406059265137 22.46648178300711,113.92024040222168 22.469495774098846,113.91500473022461 22.474571821398893,113.92650604248047 22.482026928584514,113.92607688903809 22.478061496005573,113.9395523071289 22.475047691295924,113.95182609558105 22.48472335786479,113.95285606384277 22.505341374315076,113.91603469848633 22.50510349164863,113.9143180847168 22.50415195689087,113.91363143920898 22.502486755311175,113.91551971435547 22.49979067215121,113.91775131225586 22.49931488731488,113.91715049743652 22.49733243288233,113.90899658203125 22.488212776614095,113.90401840209961 22.473540764346186,113.90255928039551 22.46973371797133,113.90341758728027 22.46917851496644";
	let lines = [];
	let points = [];
	for (let ss of str.split(",")) {
		let ll = ss.split(" ");
		console.log(ll[0], ll[1])
		points.push(new db.Geo.Point(+ll[0], +ll[1]))
	}
	console.log(points)

	let pol = new db.Geo.Polygon([
		new db.Geo.LineString(points),
	]);
	let res = await db.collection("shops").doc("faf20935850e4e81a3fc8ce87548948f").update({
		lnglat: po,
		serviceArea: pol
	});
	return res;
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

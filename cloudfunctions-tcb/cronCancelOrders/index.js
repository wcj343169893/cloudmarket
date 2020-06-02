'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	updateGoodsMiaoshaStock,
	updateGoodsStock,
	updateUserOrderCount
} = require('base-common');
const auth = uniCloud.auth();
/**
 * 自动取消24小时未付款的订单，定时器每小时执行一次
 */
exports.main = async (event, context) => {
	let {customUserId} = await auth.getUserInfo();
	let uid = +customUserId;
	const orderCollection = db.collection("orders");
	let time = new Date().getTime();
	const day = new Date().toISOString();
	let ordCondition = {
		lastPayTime: cmd.lt(time),
		state: 0
	};
	//只清理自己的数据
	if(uid > 0){
		ordCondition["uid"]=uid;
	}
	
	let orders = await orderCollection.where(ordCondition).field({
		goods: 1,
		uid:1,
		shopid:1
	}).get();
	if (orders.data.length == 0) {
		return {
			code:404,
			message:"没有需要清理的订单"
		};
	}
	let ids = orders.data.map(m => {
		return m._id;
	});
	//直接执行批量更新
	let result = await orderCollection.where({
		_id: cmd.in(ids)
	}).update({
		state: -1,
		cancelStyle: "auto",
		modified: day
	});
	for (let order of orders.data) {
		for (let ele of order.goods) {
			if (ele.miaosha) {
				let res = await updateGoodsMiaoshaStock(ele, -1);
				console.log("updateGoodsMiaoshaStock", res);
			}
			let resStock = await updateGoodsStock(ele, -1);
			console.log("updateGoodsStock", resStock);
		}
		
		//更新用户已取消和未支付数量
		let resUser = await updateUserOrderCount(order.uid,"canceled",1,"unpaid",order.shopid);
		console.log("resUser", resUser);
	}
	return {
		code:200,
		message:"清理成功",
		data:result
	};
};

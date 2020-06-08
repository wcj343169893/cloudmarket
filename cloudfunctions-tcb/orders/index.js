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
 * 订单处理
 */
exports.main = async (event, context) => {
	//id为5e9d61c31ee4a2004c55801e
	let {
		customUserId
	} = await auth.getUserInfo();
	if (customUserId < 1) {
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let id = event.id || event._id;
	let uid = +customUserId;
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
		uid: uid,
		isDelete: 0
	};
	let data;
	const orderCollection = db.collection("orders");
	let time = new Date().getTime();
	//测试语句，全部更新为未删除状态
	//await orderCollection.where({_id:cmd.exists(true)}).update({isDelete:0});
	if (type == "list") {
		if (state > 0) {
			switch (state) {
				case 1:
					//1待付款
					conditions["state"] = 0;
					conditions["lastPayTime"] = cmd.gt(time);
					break;
				case 2:
					//2已付款，待收货，包含已发货
					conditions["state"] = cmd.in([1, 2]);
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
			address: 1,
			cancelStyle: 1,
			remark: 1,
			shopid: 1,
			yuding: 1,
			"payInfo.time": 1,
			"payInfo.name": 1,
			lastPayTime: 1,
			cancelApply: 1,
			refundApply: 1
		}).skip((page - 1) * limit).limit(limit).orderBy("id", "desc").get();
		data["page"] = page;
		data["limit"] = limit;
	} else {
		//取消未付款的订单
		conditions["_id"] = id;
		let field = {
			state: 1,
			totalMoney: 1,
			shopid: 1
		};
		if (type == "cancel") {
			Object.assign(field,{
				goods:1,
				yuding:1,
				payInfo:1,
				body:1,
			});
			conditions["state"] = cmd.in([0, -1]);
		}
		if (type == "detail") {
			field = {
				id: 1,
				totalMoney: 1,
				totalDiscount: 1,
				state: 1,
				created: 1,
				remark: 1,
				goods: 1,
				cartCount: 1,
				address: 1,
				lastPayTime: 1,
				cancelStyle: 1,
				shopid: 1,
				modified: 1,
				payInfo: 1,
				yuding: 1
			};
		}
		data = await orderCollection.where(conditions).limit(1).field(field).get();
		if (data.data.length == 0) {
			return {
				"code": 404,
				"message": "订单不存在"
			};
		}
		let order = data.data[0];
		if (type == "cancel") {
			if (order.state < 0) {
				return {
					"code": 404,
					"message": "订单已取消"
				};
			} else if (order.state > 0) {
				//@todo 用户已付款，发送通知和取消申请，正常情况不会出现在这里，用户需发起退款申请
				return {
					"code": 200,
					"message": "已发送取消申请"
				};
			}
			//如果未付款，可以直接取消，
			//已付款，或者已付定金，则发起取消请求
			//取消未付款订单
			data = await orderCollection.doc(order._id).update({
				state: -1,
				cancelStyle: event.style
			});
			//取消申请
			await pushOrderCancelInfo(order._id, "您的取消申请已提交。");
			for (let ele of order.goods) {
				if (ele.miaosha) {
					let res = await updateGoodsMiaoshaStock(ele, -1);
					console.log("updateGoodsMiaoshaStock", res);
				}
				let resStock = await updateGoodsStock(ele, -1);
				console.log("updateGoodsStock", resStock);
			}
			//更新用户已取消和未支付数量
			let resUser = await updateUserOrderCount(uid, "canceled", 1, "unpaid", order.shopid);
			console.log("resUser", resUser);

			if (order.payInfo) {
				//这里已经是走申请退款流程，不能直接取消，需要商家同意
				/* await pushOrderCancelInfo(order._id, "您的订单拦截成功，正在进行退款审核，请耐心等待。");
				order.payInfo.id=order._id;
				//退款定时器,全额退款
				await addOrderRefund(order.uid,order.payInfo,order.payInfo.totalFee,"取消"+order.body); */
			} else if (order.yuding && order.yuding.payInfo) {
				//是否扣除服务费
				let serviceMoney = false;
				order.yuding.payInfo.id = order._id;
				if (order.yuding.finalPaymentBeginTime < time && serviceMoney) {
					await pushOrderCancelInfo(order._id, "您的预售订单已取消，已过预售期，扣除20%服务费。");
					await addOrderRefund(order.uid, order.yuding.payInfo, order.yuding.payInfo.totalFee * 0.8, "取消" + order.body);
				} else {
					await pushOrderCancelInfo(order._id, "您的预售订单拦截成功，正在进行退款审核，请耐心等待。");
					//退款定时器,全额退款
					await addOrderRefund(order.uid, order.yuding.payInfo, order.yuding.payInfo.totalFee, "取消" + order.body);
				}
			} else {
				await pushOrderCancelInfo(order._id, "您的订单已取消。");
			}
		} else if (type == "delete") {
			//删除订单，软删除
			data = await orderCollection.doc(order._id).update({
				isDelete: 1
			});
			//更新用户已取消和已删除
			let resUser = await updateUserOrderCount(uid, "deleted", 1, "canceled", order.shopid);
			console.log("resUser", resUser);
		} else if (type == "makesure") {
			//确定收货,资金解冻
			data = await orderCollection.doc(order._id).update({
				state: 3
			});
			//更新用户已发货和已收货
			let resUser = await updateUserOrderCount(uid, "received", 1, "delivered", order.shopid);
			//增加用户积分
			await updateUserScore(uid,order.totalMoney);
			//@todo 资金解冻
		} else if (type == "detail") {
			//查询详细
			data = order;
		}
	}

	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};

/**
 * 添加取消订单进度
 * @param {Object} id 
 * @param {Object} message
 */
const pushOrderCancelInfo = async function(id, message) {
	return await db.collection("orders").doc(id).update({
		cancelApply: cmd.push({
			message: message,
			time: new Date().getTime()
		})
	});
}
/**
 * 创建退款
 * @param {Object} payInfo 
 */
const addOrderRefund = async function(uid, payInfo, refundFee, refundDesc) {
	//order_refunds
	return await db.collection("order_refunds").add({
		...payInfo,
		uid: uid,
		refundStatus: "refunding",
		refundFee: refundFee,
		refundDesc: refundDesc,
		created: new Date().toISOString()
	});
}

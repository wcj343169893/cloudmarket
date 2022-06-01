'use strict';
const db = uniCloud.database();
const cmd = db.command;
const coupons = require("../coupon");
const {
	updateGoodsMiaoshaStock,
	updateGoodsStock,
	updateUserIncome,
	updateUserOrderCount,
	updateUserScore,
	genIdentityId,
	genOrderNo
} = require('base-common');
const orderCollection = db.collection("cloud_orders");
const orderRefundsCollection = db.collection("cloud_order_refunds");
const {
	print
} = require('printers');
const {
	sendOrderDelivery
} = require('push');
const list = async (data, context) => {
	const {
		page,
		limit,
		key,
		state,
		shopid
	} = data;
	//0全部，1待付款，2已付款，待收货，3待评价
	//实际状态值：-2删除，-1取消，0未付款，1已付款，2已发货，3已收货待评价
	let conditions = {
		shopid: shopid
	};
	let time = new Date().getTime();
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
			conditions["isRefundAll"] = cmd.exists(false);
			break;
		case "delivered":
			//已发货，待收货
			conditions["state"] = 2;
			conditions["isRefundAll"] = cmd.exists(false);
			break;
		case "received":
			//已收货，待评价
			conditions["state"] = 3;
			conditions["isRefundAll"] = cmd.exists(false);
			break;
		case "estimated":
			//已评价
			conditions["state"] = 4;
			break;
		case "refunded":
			//售后----待定getRefunded
			break;
		default:
			conditions["state"] = cmd.gt(-1);
			conditions["isDelete"] = 0;
			break;
	}
	if (key && key.trim().length > 0) {
		conditions["goods.title"] = new RegExp(key.trim());
	}
	let res = await orderCollection.where(conditions).orderBy("id", "desc").skip((page - 1) * limit).limit(
		limit).field({
		id: 1,
		totalMoney: 1,
		totalDiscount: 1,
		state: 1,
		created: 1,
		goods: 1,
		cartCount: 1,
		address: 1,
		cancelStyle: 1,
		deliveryType: 1,
		selfRaising: 1,
		deliveryHour: 1,
		isRefunding: 1,
		refundAmount: 1,
		isRefundAll: 1,
		remark: 1,
		shopid: 1,
		shop: 1,
		raisingPoint: 1,
		payInfo: 1,
		userInfo: 1,
		yuding: 1,
		lastPayTime: 1
	}).get();
	if (res.data.length == 0) {
		//表示没有数据，默认提示语，可以省略
		//data.message = "暂无数据";
		return false;
	}
	return res.data;
}
/**
 * 取消订单
 */
const cancel = async (data) => {
	const {
		_id,
		shopid
	} = data;
	let order = await getOrderById({
		_id,
		shopid
	}, {
		shopid: 1,
		couponsChecked: 1,
		goods: 1,
		uid: 1,
		state: 1,
	});
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	if (order.state < 0) {
		data.message = "订单已取消";
		return false;
	} else if (order.state > 0) {
		//@todo 用户已付款，发送通知和取消申请，正常情况不会出现在这里，用户需发起退款申请
		return false;
	}
	//如果未付款，可以直接取消，
	//已付款，或者已付定金，则发起取消请求
	//取消未付款订单
	let result = await orderCollection.doc(order._id).update({
		state: -1,
		cancelStyle: "shop"
	});
	//取消申请
	await pushOrderCancelInfo(order._id, "您的取消申请已提交。");
	for (let ele of order.goods) {
		let resStock = await updateGoodsStock(ele, -1, true);
		console.log("updateGoodsStock", resStock);
	}
	//更新用户已取消和未支付数量
	let resUser = await updateUserOrderCount(order.uid, "canceled", 1, "unpaid", order.shopid);
	console.log("resUser", resUser);
	let time = new Date().getTime();
	await pushOrderCancelInfo(order._id, "您的订单已取消。");
	//已使用的优惠券
	if (order.couponsChecked) {
		await coupons.canceled(order.couponsChecked);
	}
	return result;
}
/**
 * 添加取消订单进度
 * @param {Object} id 
 * @param {Object} message
 */
const pushOrderCancelInfo = async (id, message) => {
	return await orderCollection.doc(id).update({
		cancelApply: cmd.push({
			message: message,
			time: new Date().getTime()
		})
	});
}
/**
 * 分页查询退款申请
 */
const getRefunded = async (data) => {
	const {
		page,
		limit,
		key,
		state,
		shopid
	} = data;
	let condition = {
		shopid,
	};
	if (state != "all") {
		condition["state"] = state;
	}
	const res = await orderRefundsCollection.where(condition).orderBy("id", "desc").skip((page - 1) * limit)
		.limit(
			limit)
		.get();
	if (res.data.length == 0) {
		return false;
	}
	return res.data;
}
/**
 * 退款审核通过
 */
const passedRefund = async (data) => {
	const {
		id,
		shopid,
		operator
	} = data;
	let order = await getOrderRefundById({
		shopid,
		_id: id
	});
	if (!order) {
		data.message = "退款订单不存在";
		return false;
	}
	const res = await orderRefundsCollection.doc(id).update({
		state: "successed",
		refundStatus: "paying",
		steps: cmd.unshift({
			title: "退款中",
			operator,
			desc: "您的退款申请已通过，待财务退款中",
			time: Date.now()
		})
	});
	let orderMain = await getOrderById({
		_id: order.orderId
	}, {
		refundAmount: 1,
		cartCount: 1
	});
	if (!orderMain) {
		data.message = "订单不存在";
		return false;
	}
	let dataField = {}
	//已退款数量
	let refundAmount = orderMain.refundAmount ? +orderMain.refundAmount : 0;
	//判断是否全部退款
	console.log("退款比例", refundAmount + order.refundApplyAmount, orderMain.cartCount)
	if (refundAmount + order.refundApplyAmount >= orderMain.cartCount) {
		dataField["isRefundAll"] = 1;
		console.log("全部退款退货")
	}

	//更新主订单
	await orderCollection.doc(order.orderId).update({
		isRefunding: cmd.inc(-1),
		refundAmount: cmd.inc(order.refundApplyAmount),
		[`goods.${order.index}`]: {
			refundAmount: cmd.inc(order.refundApplyAmount),
			isRefunding: cmd.remove()
		},
		...dataField
	});
	return res;
}
/**
 * 退款审核失败
 */
const refuseRefund = async (data) => {
	const {
		id,
		shopid,
		operator
	} = data;
	let order = await getOrderRefundById({
		shopid,
		_id: id
	});
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	const res = await orderRefundsCollection.doc(id).update({
		state: "failed",
		steps: cmd.unshift({
			title: "退款失败",
			operator,
			desc: "您的退款申请已拒绝",
			time: Date.now()
		})
	});
	//更新主订单
	await orderCollection.doc(order.orderId).update({
		isRefunding: cmd.inc(-1),
		[`goods.${order.index}`]: {
			isRefunding: cmd.remove()
		}
	});
	return res;
}
/**
 * 录入快递单号
 */
const addExpress = async (data) => {
	let conditions = {
		_id: data._id,
		shopid: data.shopid
	};
	let order = await getOrderById(conditions, {
		selfRaising: 1,
		express: 1,
		state: 1,
		goods: 1,
		body: 1,
		shopid: 1,
		uid: 1
	});
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	//快递信息,直接支持多条
	let res = await orderCollection.doc(order._id).update({
		express: cmd.push(data.express)
	});

	//告知买家已发货
	await sendOrderDelivery(order)
	return res;
}
/**
 * 订单发货
 */
const addDelivery = async (data) => {
	let conditions = {
		_id: data._id,
		shopid: data.shopid
	};
	let order = await getOrderById(conditions, {
		selfRaising: 1,
		state: 1,
		shopid: 1,
		body: 1,
		goods: 1,
		uid: 1
	});
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	if (order.state != 1) {
		data.message = "订单状态异常" + order.state;
		return false;
	}
	let saveData = {
		deliveredTime: Date.now(),
		deliveredUid: data.operator,
		state: 2
	};
	//@todo 如果是单个商品发货，需要对单个商品更新state状态，否则只更新全部
	let res = await orderCollection.doc(order._id).update(saveData);
	//更新用户已发货和已收货
	let resUser = await updateUserOrderCount(order.uid, "delivered", 1, "payup", order.shopid);
	//TODO 自提订单，发送短信
	if (order.selfRaising) {
		/* const res = await uniCloud.sendSms({
			smsKey: '****************',
			smsSecret: '****************',
			phone: order.selfRaising.mobile,
			templateId: 'uniID_code',
			data: {
				name: 'DCloud',
				code: '123456',
				action: '注册',
				expMinute: '3',
			}
		}) */
	}
	//告知买家已发货
	await sendOrderDelivery(order)
	return res;
}
/**
 * 订单改价格
 */
const changePrice = async (data) => {
	const {
		_id,
		money,
		shopid
	} = data;
	let order = await getOrderById({
		_id,
		shopid
	}, {
		originTotalMoney: 1,
		totalMoney: 1
	});
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	if (!order.originTotalMoney) {
		order.originTotalMoney = order.totalMoney;
	}
	let res = await orderCollection.doc(_id).update({
		originTotalMoney: order.originTotalMoney,
		totalMoney: money
	});
	return res;
}

/**
 * 查詢单个訂單信息，支持提货码查询商品
 */
const detail = async (data) => {
	//必须是本店铺信息
	let conditions = {
		shopid: data.shopid
	};
	if (data._id) {
		conditions["_id"] = data._id;
	} else if (data.number) {
		//提货码
		conditions["deliveryHour.number"] = +data.number;
	}
	return await getOrderById(conditions, {});
}
/**
 * 自提订单
 */
const selftake = async (data) => {
	let conditions = {
		_id: data._id,
		shopid: data.shopid
	};
	let order = await getOrderById(conditions);
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	if (order.state != 2) {
		data.message = "订单状态异常" + order.state;
		return false;
	}
	//@todo 如果是单个商品发货，需要对单个商品更新state状态，否则只更新全部
	let res = await orderCollection.doc(order._id).update({
		receivedTime: Date.now(),
		receivedUid: data.operator,
		state: 3
	});
	//更新用户已发货和已收货
	let resUser = await updateUserOrderCount(order.uid, "received", 1, "delivered", order.shopid);
	return res;
}
/**
 * 按自提点发货
 */
const selftakebyraising = async (data) => {
	const {
		id,
		operator,
		shopid,
	} = data;
	return await orderCollection.where({
		"raisingPoint._id": id,
		state: 1,
		shopid,
		isRefundAll: cmd.exists(false)
	}).update({
		receivedTime: Date.now(),
		receivedUid: operator,
		state: 2
	});
}
/**
 * 查询订单
 */
const getOrderById = async (conditions, field) => {
	if (!field) {
		field = {
			state: 1,
			shopid: 1,
			uid: 1
		};
	}
	let data = await orderCollection.where(conditions).field(field).limit(1).get();
	if (data.data.length == 0) {
		return false;
	}
	return data.data[0];
}
/**
 * 查询退款
 */
const getOrderRefundById = async (conditions, field) => {
	if (!field) {
		field = {
			refundApplyAmount: 1,
			orderId: 1,
			state: 1,
			index: 1,
			shopid: 1,
			uid: 1
		};
	}
	let data = await orderRefundsCollection.where(conditions).field(field).limit(1).get();
	if (data.data.length == 0) {
		return false;
	}
	return data.data[0];
}
/**
 * 打印订单
 */
const printOrder = async (data) => {
	let conditions = {
		_id: data._id,
		shopid: data.shopid
	};
	//查询订单
	const order = await getOrderById(conditions, {});
	if (!order) {
		return false;
	}
	//打印小票
	const res = await print(order, order.shopid);
	console.log("print", res);
	return res;
}
const comment = async (data) => {
	const {
		id,
		comment
	} = data;
}
module.exports = {
	list: list,
	detail: detail,
	addDelivery: addDelivery,
	addExpress,
	selftake,
	selftakebyraising,
	print: printOrder,
	getRefunded,
	passedRefund,
	refuseRefund,
	comment,
	cancel,
	changePrice
}

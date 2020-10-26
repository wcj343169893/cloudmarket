'use strict';
const db = uniCloud.database();
const cmd = db.command;
const {
	updateUserOrderCount
} = require('base-common');
const orderCollection = db.collection("cloud_orders");
const orderRefundsCollection = db.collection("cloud_order_refunds");
const {
	print
} = require('printers');
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
	let res = await orderCollection.where(conditions).orderBy("id", "desc").skip((page - 1) * limit).limit(limit).field({
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
		deliveryHour: 1,
		remark: 1,
		shopid: 1,
		payInfo: 1,
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
	const res = await orderRefundsCollection.where(condition).orderBy("id", "desc").skip((page - 1) * limit).limit(limit)
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
			time: new Date().toISOString()
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
	//判断是否全部退款
	if (orderMain.refundAmount >= orderMain.cartCount) {
		dataField["isRefundAll"] = 1;
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
			time: new Date().toISOString()
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
 * 订单发货
 */
const addDelivery = async (data) => {
	let conditions = {
		_id: data._id,
		shopid: data.shopid
	};
	let order = await getOrderById(conditions);
	if (!order) {
		data.message = "订单不存在";
		return false;
	}
	if (order.state != 1) {
		data.message = "订单状态异常" + order.state;
		return false;
	}
	//@todo 如果是单个商品发货，需要对单个商品更新state状态，否则只更新全部
	let res = await orderCollection.doc(order._id).update({
		deliveredTime: new Date().toISOString(),
		deliveredUid: data.operator,
		state: 2
	});
	//更新用户已发货和已收货
	let resUser = await updateUserOrderCount(order.uid, "delivered", 1, "payup", order.shopid);
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
		receivedTime: new Date().toISOString(),
		receivedUid: data.operator,
		state: 3
	});
	//更新用户已发货和已收货
	let resUser = await updateUserOrderCount(order.uid, "received", 1, "delivered", order.shopid);
	return res;
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
const comment = async(data)=>{
	const{id,comment}=data;
}
module.exports = {
	list: list,
	detail: detail,
	addDelivery: addDelivery,
	selftake,
	print: printOrder,
	getRefunded,
	passedRefund,
	refuseRefund,
	comment
}

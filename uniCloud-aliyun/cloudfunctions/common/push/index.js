//《多厂商推送透传消息带通知》
'use strict';
const unipush = require("./unipush");
const db = uniCloud.database();
const cmd = db.command;
const {
	getPushConfig
} = require('configs');
const uniID = require('uni-id');
const userCollection = db.collection("uni-id-users");
const cacheCollection = db.collection("cloud_identity");
const messageCollection = db.collection("cloud_message");
const model = {
	/**
	 * 推送新订单给商家的所有接受者,order.shopid
	 * @param {Object} order
	 */
	async sendNewOrder(order) {
		let page = `/pages/admin/admin?shopid=${order.shopid}&second=Order&state=payup`;
		return await sendToShop({
			"title": "新订单提醒",
			"content": "你有一笔新订单，请及时处理",
			page,
			order: {
				body: order.body,
				totalMoney: order.totalMoney,
				timeConsumingInfo: order.timeConsumingInfo,
				totalDiscount: order.totalDiscount,
				selfRaising: order.selfRaising,
				goods: order.goods,
				address: order.address,
				userInfo: order.userInfo,
			},
			"payload": JSON.stringify({
				data: "新订单提醒",
				page
			}),
		}, order.shopid);
	},
	/**
	 * 订单发货推送，推送给买家
	 * @param {Object} order
	 */
	async sendOrderDelivery(order) {
		let page = `/pages/order/order?state=2`;
		return sendSingle({
			"title": "订单状态提醒",
			"content": `您购买的${order.body}已发货`,
			page,
			order: {
				body: order.body,
				goods: order.goods,
			},
			"payload": JSON.stringify({
				data: "新订单提醒",
				page
			}),
		}, order.uid);
	},
	/**
	 * 发送消息给系统管理员，堆积起来，10分钟以上再推送
	 * @param {Object} data
	 */
	async sendSystemMessage(data) {
		console.log(data)
		return true;
	}
}
/**
 * 根据店铺id，推送给多个人
 */
const sendToShop = async (data, shopid) => {
	const {
		appId
	} = getPushConfig(data.client);
	let {
		cids,
		uids
	} = await getShopClientIdsByShopid(shopid, appId);
	if (!cids) {
		console.log("无登录设备，不发送消息");
		return false;
	}
	//批量保存推送消息
	await messageCollection.add(uids.map(u => {
		return {
			...data,
			status: 0,
			created: Date.now(),
			user_id: u,
		}
	}))
	data.clientid = cids;
	return await unipush.toList(data);
}
/**
 * 单独推送给一个人
 */
const sendSingle = async (data, uid) => {
	const {
		appId
	} = getPushConfig(data.client);
	data.clientid = await getUserClientId(uid, appId);
	if (!data.clientid) {
		console.log("无登录设备，不发送消息");
		return false;
	}
	//发送给某一个人
	await messageCollection.add({
		...data,
		status: 0,
		created: Date.now(),
		user_id: uid,
	})
	return await unipush.toSingle(data);
}
/**
 * 根据店铺id，查询接收的设备id
 */
const getShopClientIdsByShopid = async (shopid, appId) => {
	let users = await userCollection.where({
		admin: cmd.in([shopid]),
		[`push.${appId}`]: cmd.exists(true)
	}).field({
		push: 1
	}).get();
	if (users.data.length == 0) {
		return {
			cids: false,
		};
	}
	let cids = [];
	let uids = []
	users.data.map(u => {
		//cid不能重复
		if (cids.indexOf(u.push[appId].clientid) == -1) {
			cids.push(u.push[appId].clientid);
		}
		if (uids.indexOf(u._id) == -1) {
			uids.push(u._id);
		}
	});
	return {
		cids,
		uids
	};
}
/**
 * 根据uid，查询clientId
 */
const getUserClientId = async (uid, appId) => {
	let info = await uniID.getUserInfo({
		uid,
		field: ["push"]
	});
	if (info.userInfo.push && info.userInfo.push[appId]) {
		return info.userInfo.push[appId].clientid;
	}
	return false;
}
module.exports = model;

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
const model = {
	/**
	 * 推送新订单给商家的所有接受者,order.shopid
	 * @param {Object} order
	 */
	async sendNewOrder(order) {
		return await sendToShop({
			"title": "新订单提醒",
			"content": "你有一笔新订单，请及时处理",
			"payload": JSON.stringify({
				data: "新订单提醒"
			}, )
		}, order.shopid);
	}
}
/**
 * 根据店铺id，推送给多个人
 */
const sendToShop = async (data, shopid) => {
	const {
		appId
	} = getPushConfig(data.client);
	data.clientid = await getShopClientIdsByShopid(shopid, appId);
	if (!data.clientid) {
		console.log("无登录设备，不发送消息");
		return false;
	}
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
		return false;
	}
	let cids = [];
	users.data.map(u => {
		cids.push(u.push[appId].clientid);
	});
	return cids;
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

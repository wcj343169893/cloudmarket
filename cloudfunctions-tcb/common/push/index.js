//《多厂商推送透传消息带通知》
'use strict';
const unipush = require("./unipush");
const {
	getPushConfig
} = require('configs');
const uniID = require('uni-id');
const model = {
	async sendNewOrder(order) {
		return await sendSingle({
			"title": "新订单提醒",
			"content": "你有一笔新订单，请及时处理",
			"payload": JSON.stringify({
				data: "新订单提醒"
			}, )
		}, order.uid);
	}
}
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

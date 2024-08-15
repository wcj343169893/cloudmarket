'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
/**
 * 动态加载模块，不需要事先定义
 */
const getModule = async (delivery, action, data, context) => {
	if (!delivery) {
		console.error(`店铺没有设置配送模块`)
		return false;
	}
	console.log("getModule", delivery)
	const {
		thirdPartyModule,
		thirdPartyDeliveryId: deliveryId
	} = delivery;
	let subModule = deliveryId ? deliveryId.toLocaleLowerCase() : "index";
	let model = null;
	try {
		model = require(`./${thirdPartyModule}/${subModule}`);
	} catch (e) {
		try {
			model = require(`./${thirdPartyModule}/index`);
		} catch (e) {
			console.error(e)
			throw new Error(`配送模块不存在`);
		}
	}
	await model.initConfig(context);
	return model[action](data);
}
/**
 * 验证通知签名
 */
const validateSign = async (event, context) => {
	const {
		module,
	} = event;
	let [thirdPartyModule, thirdPartyDeliveryId] = module.split("_");
	return await getModule({
		thirdPartyModule,
		thirdPartyDeliveryId
	}, "validateSign", event, context);
}
/**
 * 处理订阅消息
 */
// const subscribe = async (event, context) => {
// 	const {
// 		module,
// 		action,
// 		data
// 	} = event;
// 	return await getModule(module, action, data, context, "subscribe");
// }
//mockNotify
const mockNotify = async (event, context) => {
	const {
		module,
		data,
	} = event;
	return await getModule(module, "mockNotify", data, context);
}
/**
 * 预下配送单
 */
const preAdd = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "preAdd", data, context);
}
/**
 * 增加配送订单
 */
const add = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "add", data, context);
}
/**
 * 更新订单
 */
const update = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "update", data, context);
}
/**
 * 取消配送订单
 */
const cancel = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "cancel", data, context);
}
/**
 * 订单退款
 */
const refund = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "refund", data, context);
}
/**
 * 锁定和解锁订单
 */
const lock = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "lock", data, context);
}
/**
 * 添加/修改店铺
 */
const addShop = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	let result = await getModule(delivery, "addShop", data, context);
	if (!result) {
		return false;
	}
	//更新
	await shopCollection.doc(data._id).update({
		result
	})
	return true;
}
const getShop = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "getShop", data, context);
}
/**
 * 修改商家是否出餐,会收到一个出餐通知
 */
const updateShopFlag = async (event, context) => {
	const {
		delivery,
		data
	} = event;
	return await getModule(delivery, "updateShopFlag", data, context);
}

module.exports = {
	add,
	cancel,
	addShop,
	getShop,
	refund,
	update,
	lock,
	updateShopFlag,
	validateSign,
	mockNotify
}
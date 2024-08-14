'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
/**
 * 动态加载模块，不需要事先定义
 */
const getModule = async (module, action, data, context, subModule) => {
	try {
		if (!module) {
			console.error(`店铺没有设置配送模块`)
			return false;
		}
		if (!subModule) {
			subModule = "index";
		}
		const model = require(`./${module}/${subModule}`);
		await model.initConfig(context);
		return model[action](data);
	} catch (e) {
		console.error(e)
		console.error(`模块${module} ${subModule}不存在`)
		throw new Error(`delivery模块${module} ${subModule}不存在`);
	}
	return false;
}
/**
 * 验证通知签名
 */
const validateSign = async (event, context) => {
	const {
		module,
	} = event;
	return await getModule(module, "validateSign", event, context);
}
/**
 * 处理订阅消息
 */
const subscribe = async (event, context) => {
	const {
		module,
		action,
		data
	} = event;
	return await getModule(module, action, data, context, "subscribe");
}
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
		module,
		data
	} = event;
	return await getModule(module, "preAdd", data, context);
}
/**
 * 增加配送订单
 */
const add = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, "add", data, context);
}
/**
 * 更新订单
 */
const update = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, "update", data, context);
}
/**
 * 取消配送订单
 */
const cancel = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, "cancel", data, context);
}
/**
 * 订单退款
 */
const refund = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, "refund", data, context);
}
/**
 * 锁定和解锁订单
 */
const lock = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, "lock", data, context);
}
/**
 * 添加/修改店铺
 */
const addShop = async (event, context) => {
	const {
		module,
		data
	} = event;
	let delivery = await getModule(module, "addShop", data, context);
	if (!delivery) {
		return false;
	}
	//更新
	await shopCollection.doc(data._id).update({
		delivery
	})
	return true;
}
const getShop = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, "getShop", data, context);
}
/**
 * 修改商家是否出餐,会收到一个出餐通知
 */
const updateShopFlag = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, "updateShopFlag", data, context);
}

module.exports = {
	add,
	cancel,
	addShop,
	getShop,
	subscribe,
	refund,
	update,
	lock,
	updateShopFlag,
	validateSign,
	mockNotify
}
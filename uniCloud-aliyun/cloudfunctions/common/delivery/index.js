'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
/**
 * 动态加载模块，不需要事先定义
 */
const getModule = (module, context, subModule) => {
	try {
		if (!subModule) {
			subModule = "index";
		}
		const model = require(`./${module}/${subModule}`);
		model.context = context;
		return model;
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
	return await getModule(module, context)["validateSign"](event, context);
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
	return await getModule(module, context, "subscribe")[action](data, context);
}
/**
 * 预下配送单
 */
const preAdd = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["preAdd"](data, context);
}
/**
 * 增加配送订单
 */
const add = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["add"](data, context);
}
/**
 * 更新订单
 */
const update = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["update"](data, context);
}
/**
 * 取消配送订单
 */
const cancel = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["cancel"](data, context);
}
/**
 * 订单退款
 */
const refund = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["refund"](data, context);
}
/**
 * 锁定和解锁订单
 */
const lock = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["lock"](data, context);
}
/**
 * 添加店铺
 */
const addShop = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["addShop"](data, context);
}
const getShop = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["getShop"](data, context);
}
/**
 * 修改商家是否出餐,会收到一个出餐通知
 */
const updateShopFlag = async (event, context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module, context)["updateShopFlag"](data, context);
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
	validateSign
}
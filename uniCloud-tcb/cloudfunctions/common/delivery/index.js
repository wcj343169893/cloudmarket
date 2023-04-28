'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
/**
 * 动态加载模块，不需要事先定义
 */
const getModule = (module, subModule) => {
	try {
		if (!subModule) {
			subModule = "index";
		}
		return require(`./${module}/${subModule}`);
	} catch (e) {
		console.error(`模块${module} ${subModule}不存在`)
		throw new Error(`delivery模块${module} ${subModule}不存在`);
	}
	return false;
}
/**
 * 验证通知签名
 */
const validateSign = async (event,context) => {
	const {
		module,
	} = event;
	return await getModule(module)["validateSign"](event,context);
}
/**
 * 处理订阅消息
 */
const subscribe = async (event) => {
	const {
		module,
		action,
		data
	} = event;
	return await getModule(module, "subscribe")[action](data);
}
/**
 * 预下配送单
 */
const preAdd = async (event,context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["preAdd"](data,context);
}
/**
 * 增加配送订单
 */
const add = async (event,context) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["add"](data,context);
}
/**
 * 更新订单
 */
const update = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["update"](data);
}
/**
 * 取消配送订单
 */
const cancel = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["cancel"](data);
}
/**
 * 订单退款
 */
const refund = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["refund"](data);
}
/**
 * 锁定和解锁订单
 */
const lock = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["lock"](data);
}
/**
 * 添加店铺
 */
const addShop = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["addShop"](data);
}
/**
 * 修改商家是否出餐,会收到一个出餐通知
 */
const updateShopFlag = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["updateShopFlag"](data);
}

module.exports = {
	add,
	cancel,
	addShop,
	subscribe,
	refund,
	update,
	lock,
	updateShopFlag,
	validateSign
}

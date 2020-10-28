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
const validateSign = async (event) => {
	const {
		module,
	} = event;
	return await getModule(module)["validateSign"](event);
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
 * 增加配送订单
 */
const addOrder = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["addOrder"](data);
}
/**
 * 取消配送订单
 */
const cancelOrder = async (event) => {
	const {
		module,
		data
	} = event;
	return await getModule(module)["cancelOrder"](data);
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

module.exports = {
	addOrder,
	cancelOrder,
	addShop,
	subscribe,
	validateSign
}

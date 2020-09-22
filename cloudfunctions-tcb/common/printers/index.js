'use strict';
const db = uniCloud.database();
const cmd = db.command;
const modules = {
	yilianyun: require("./yilianyun"),
	feieyun: require("./feieyun"),
};
const shopCollection = db.collection("cloud_shops");
/**
 * 打印文字
 * @param {Object} data 订单数据 
 * @param {Int} shopid 店铺id 
 */
const print = async (data, shopid) => {
	//查找店铺的打印机，如果多台，则随机
	let shopInfo = await shopCollection.where({
		id: shopid
	}).field({
		isPrint: 1,
		printers: 1
	}).get();
	if (shopInfo.data.length == 0) {
		console.log("店铺信息获取失败")
		return false;
	}
	shopInfo = shopInfo.data[0];
	if (!shopInfo.isPrint) {
		console.log("未开启打印功能");
		return false;
	}
	let printers = shopInfo.printers;
	if (!printers || printers.length == 0) {
		console.log("无打印设备");
		return false;
	}
	//过滤可用的设备，在店铺开始营业的时候，自动检测设备是否在线
	printers = printers.filter(e => {
		return e.enable && e.online;
	});
	if (printers.length == 0) {
		console.log("无可用的打印设备");
		return false;
	}
	//随机获取一个
	let index = 0;
	if (printers.length > 1) {
		index = parseInt(Math.random() * printers.length);
	}
	//module 为统一名称，表示打印机类型
	const {
		module
	} = printers[index];
	//调用子模块方法
	return await modules[module]["print"](data, printers[index]);
}
/**
 * 添加打印设备
 */
const addPrinter = async (data) => {
	const {
		module
	} = data;
	return await modules[module]["addPrinter"](data);
}
/**
 * 获取打印机状态
 */
const getPrintStatus = async (data) => {
	const {
		module
	} = data;
	//调用子模块方法
	return await modules[module]["getPrintStatus"](data);
}
/**
 * 直接打印内容
 */
const println = async (data, config) => {
	const {
		module
	} = config;
	return await modules[module]["print"](data, config);
}
module.exports = {
	addPrinter,
	print,
	println,
	getPrintStatus
}

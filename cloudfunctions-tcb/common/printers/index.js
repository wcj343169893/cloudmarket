'use strict';
const db = uniCloud.database();
const cmd = db.command;
const modules = {
	yilianyun: require("./yilianyun")
};
const shopCollection = db.collection("cloud_shops");
/**
 * 打印文字
 */
const print = async (data, shopid) => {
	//查找店铺的打印机，如果多台，则随机
	let shopInfo = await shopCollection.where({
		id: shopid
	}).field({
		printers: 1
	}).get();
	if (shopInfo.data.length == 0) {
		console.log("店铺信息获取失败")
		return false;
	}
	let printers = shopInfo.data[0].printers;
	if (!printers || printers.length == 0) {
		console.log("无打印设备");
		return false;
	}
	//随机获取一个
	let index = 0;
	if (printers.length > 1) {
		index = parseInt(Math.random() * printers.length);
	}
	const {
		machine,
		module
	} = printers[index];
	//设备id
	data.machine = machine;
	//调用子模块方法
	return await modules[module]["print"](data);
}
/**
 * 添加打印设备
 */
const addPrinter = async (data) => {

}
const getPrintStatus = async (data) => {
	//调用子模块方法
	return await modules["yilianyun"]["getPrintStatus"](data);
}
module.exports = {
	addPrinter,
	print,
	getPrintStatus
}

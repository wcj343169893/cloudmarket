'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const printerTypesCollection = db.collection("cloud_printer_types");
const {
	addPrinter,
	getPrintStatus,
	print
} = require('printers');
const modules = {
	async category(data) {
		const result = await printerTypesCollection.where({
			_id: cmd.exists(true)
		}).get();
		if (result.data.length == 0) {
			return false;
		}
		return result.data;
	},
	/**
	 * 更新打印机某一条的信息
	 * @param {Object} data
	 */
	async save(data) {
		const {
			shopid,
			index,
			info
		} = data;
		return await shopCollection.where({
			id: shopid
		}).update({
			['printers.' + index]: info
		});
	},
	/**
	 * 新增打印机
	 * @param {Object} data
	 */
	async add(data) {
		//调用授权
		const res = await addPrinter(data);
		if (!res) {
			return false;
		}
		data.online = true;
		data.enable = true;
		return await shopCollection.where({
			id: data.shopid
		}).update({
			printers: cmd.push(data)
		});
	},
	//删除指定设备
	"delete": async (data) => {
		console.log(data)
		let printers = await this.getPrinters(data);
		if (!printers) {
			return false;
		}
		//留下其他设备
		printers = printers.filter(pri => {
			return pri.module != data.module || pri.machine != data.machine;
		});
		return await shopCollection.where({
			id: data.shopid
		}).update({
			printers: printers
		});
	},
	/**
	 * 检查打印机运行状态
	 * @param {Object} data
	 */
	async checkStatus(data) {
		let printers = await this.getPrinters(data);
		if (!printers) {
			return false;
		}
		for (let index in printers) {
			let res = await getPrintStatus(printers[index]);
			printers[index].online = !!res;
		}
		await shopCollection.where({
			id: data.shopid
		}).update({
			printers: printers
		});
		return printers;
	},
	/**
	 * 获取店铺打印机
	 * @param {Object} data
	 */
	async getPrinters(data) {
		const shop = await shopCollection.where({
			id: data.shopid
		}).field({
			printers: 1
		}).limit(1).get();
		if (shop.data.length == 0 || !shop.data[0].printers || shop.data[0].printers.length == 0) {
			return false;
		}
		return shop.data[0].printers;
	}
};
module.exports = modules

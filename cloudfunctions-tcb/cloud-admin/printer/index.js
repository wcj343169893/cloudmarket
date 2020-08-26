'use strict';
const db = uniCloud.database();
const cmd = db.command;
const shopCollection = db.collection("cloud_shops");
const printerTypesCollection = db.collection("cloud_printer_types");
const modules = {
	async category(data){
		const result = await printerTypesCollection.where({_id:cmd.exists(true)}).get();
		if(result.data.length == 0){
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
		const {
			shopid,
			info
		} = data;
		return await shopCollection.where({
			id: shopid
		}).update({
			printers: cmd.push(info)
		});
	}
};
module.exports = modules
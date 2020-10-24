'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const categoryCollection = db.collection("cloud_goods_categories");
const models = {
	/**
	 * 分页导入商品1571
	 */
	async goods() {
		const goodsList = require("./goods.json");
		let data = [],
			res;
		for (let i = 0; i < goodsList.length; i++) {
			data.push(goodsList[i]);
			if (i > 0 && i % 100 == 0) {
				res = await goodsCollection.add(data);
				data = [];
				console.log(res);
			}
		}
		res = await goodsCollection.add(data);
		console.log(res);
	},
	/**
	 * 一次导入所有分类
	 */
	async goodsCategory() {
		const categoryList = require("./goodsCategory.json");
		let res = await categoryCollection.add(categoryList);
		console.log(res);
	}
};
module.exports = models;

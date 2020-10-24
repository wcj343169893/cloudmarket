'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const models = {
	limits: {
		cloud_users: 3,
		cloud_identity: 100,
		cloud_documents: 100,
		cloud_goods: 1,
		cloud_goods_categories: 100,
		cloud_goods_visites: 1,
		cloud_goods_deletes: 1,
		cloud_goods_day_sales: 1,
		cloud_goods_shop_day_sales: 1,
		cloud_user_balance_logs: 1,
		cloud_carts: 1,
		cloud_shops: 2,
		cloud_orders: 1,
		cloud_order_refunds: 1
	},
	maxGoodsId: 0,
	outGoodsData: [],
	/**
	 * 正常导出，这里不包含商品数据，数据太多，用db_init.json无法导入
	 */
	async normal() {
		const dbInit = require("./db_init.json");
		for (let name in dbInit) {
			//限制条数
			let limit = this.limits[name] ? this.limits[name] : 10;
			let result = await db.collection(name).limit(limit).get();
			dbInit[name].data = result.data;
		}
		return dbInit;
	},
	/**
	 * 导出商品数据，手动保存到imports中的goods.json，才能导入
	 */
	async goods() {
		let res = await goodsCollection.where({
			id: cmd.gt(this.maxGoodsId)
		}).limit(100).orderBy("id", "asc").get();
		console.log("获得商品", res.data.length)
		if (res.data.length > 0) {
			this.maxGoodsId = res.data[res.data.length - 1].id;
			outGoodsData = outGoodsData.concat(res.data);
			await this.goods();
		}
		return outGoodsData;
	}
};
module.exports = models;

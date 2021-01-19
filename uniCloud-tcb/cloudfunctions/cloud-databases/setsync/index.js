'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const {
	genIdentityId
} = require('base-common');
const models = {
	shopid: 123457,
	async goods(data) {
		if (data.module) {
			this.shopid = +data.module;
		}
		//data商品数组
		let newData = [];
		let outData = {
			updated: 0,
			upserted: 0
		};
		if (data.data) {
			for (let key in data.data) {
				let info = data.data[key];
				let res = await goodsCollection.where({
					upc: info.upc
				}).update({
					modified: Date.now(),
					title: info.title,
					price: info.price,
					stock: info.stock
				});
				//console.log(res,info)
				if (res.updated == 0) {
					//新增数据
					newData.push(info);
				} else {
					outData.updated++;
				}
			}
		}
		if (newData.length > 0) {
			let startId = await genIdentityId("goods", newData.length) - newData.length;
			newData.forEach(goods => {
				startId++;
				goods = Object.assign(goods, {
					shopid: this.shopid,
					id: startId
				});
				delete goods._id;
				outData.upserted++;
			})
			await goodsCollection.add(newData);
		}
		return outData;
	},
}
module.exports = models;

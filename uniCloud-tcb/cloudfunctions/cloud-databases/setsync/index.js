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
			exists: 0,
			upserted: 0
		};
		if (data.data) {
			let upcs = data.data.map(i => {
				i.upc
			});
			let oldDatas = await goodsCollection.where({
				upc: cmd.in(upcs)
			}).field({
				title: 1,
				price: 1,
				stock: 1,
			}).limit(500).get();
			let goodsMap = {};
			oldDatas.data.map(o => {
				goodsMap[o.upc] = o;
			});
			for (let key in data.data) {
				let info = data.data[key];
				if (!goodsMap[info.upc]) {
					console.log("新增", info.upc)
					newData.push(info);
					continue;
				} else if (goodsMap[info.upc].title == info.title && goodsMap[info.upc].price == info.price &&
					goodsMap[info.upc].stock == info.stock) {
					console.log("info.upc 信息相同", info.upc)
					outData.exists++;
					continue;
				}
				let res = await goodsCollection.where({
					upc: info.upc
				}).update({
					modified: Date.now(),
					title: info.title,
					price: info.price,
					stock: info.stock
				});
				outData.updated++;
			}
		}
		if (newData.length > 0) {
			let startId = await genIdentityId("goods", newData.length) - newData.length;
			newData.forEach(goods => {
				startId++;
				goods = Object.assign(goods, {
					shopid: this.shopid,
					id: startId,
					isCategoryShow:0,
					isSold:0,
					categories: [
					    {
					        "id": 1004,
					        "isShow": 1,
					        "name": "大分类一"
					    },
					    {
					        "id": 2002,
					        "name": "小分类yi"
					    }
					]
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

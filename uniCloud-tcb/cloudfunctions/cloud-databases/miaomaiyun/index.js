'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const categoryCollection = db.collection("cloud_goods_categories");
const {
	genIdentityId
} = require('base-common');
const models = {
	shopid: 123457,
	async goods({
		module,
		data
	}) {
		let outData = []
		if (module) {
			this.shopid = +module;
		}
		for (let i = 0; i < data.length; i++) {
			let oldCate = data[i];
			let cate = this.formatGoods(oldCate, i);
			console.log("goods", cate)
			let {
				doc
			} = await goodsCollection.where({
				id: cate.id,
				shopid: this.shopid,
			}).updateAndReturn(cate);
			console.log("doc", doc)
			if (!doc) {
				cate.created = Date.now();
				//新增
				let {
					id
				} = await goodsCollection.add(cate);
				console.log("id", id)
				doc = {
					_id: id,
					id: cate.id
				}
			}
			outData.push(doc.id)
		}
		return outData;
	},
	async category({
		module,
		data,
		parent_id,
		pid
	}) {
		// console.log("data", data)
		if (module) {
			this.shopid = +module;
		}
		//2级分类
		for (let i = 0; i < data.length; i++) {
			let oldCate = data[i];
			let cate = this.formatCategory(oldCate, i, parent_id, pid);
			console.log("cate", cate)
			let {
				doc
			} = await categoryCollection.where({
				id: cate.id,
				shopid: this.shopid,
			}).updateAndReturn(cate);
			// console.log("doc", doc)
			if (!doc) {
				cate.created = Date.now();
				//新增
				let {
					id
				} = await categoryCollection.add(cate);
				console.log("id", id)
				doc = {
					_id: id,
					id: cate.id
				}
			}
			if (oldCate.childs && oldCate.childs.length > 0) {
				await this.category({
					data: oldCate.childs,
					parent_id: doc._id,
					pid: doc.id
				})
			}
		}
		return true;
	},
	formatCategory(cate, index, parent_id, pid) {
		let data = {
			shopid: this.shopid,
			isShow: 1,
			parent_id,
			pid,
			modified: Date.now(),
			recommendGoods: 0,
			posid: index + 1000
		}
		let fieldMap = {
			category_id: "id",
			name: "name",
			img: "src",
		}
		for (let key in fieldMap) {
			if (fieldMap[key]) {
				data[fieldMap[key]] = cate[key]
			}
		}
		return data;
	},
	formatGoods(goods, index) {
		let data = {
			"shopid": this.shopid,
			"autoOffTime": false,
			"banner": "",
			"modified": Date.now(),
			"guarantee_period": "",
			"categories": [{
				"id": goods.category_id,
				"isShow": 1,
				"name": goods.category_name
			}, ],
			"deliveryTags": [],
			"isCategoryShow": 1,
			"isLimit": false,
			"isNewUser": false,
			"isRecommend": false,
			"isSold": 1,
			"limit": 0,
			"manufacture": "",
			"net_weight": "",
			"onlySelfTake": 0,
			"posid": 0,
			"rate": 1,
			"saleType": "normal",
			"score": 1,
			"share": "",
			"specsType": "single",
			"src": goods.imgs ? goods.imgs[0] : "",
			"stock": 99999999,
			"storage_condition": "",
			"subTitle": "",
			"visite": 1
		}
		let fieldMap = {
			barcode_id: "upc",
			goods_title: "title",
			detial: "description",
			imgs: "imgs",
		}
		let numberFieldMap = {
			original_price: "originPrice",
			price: "price",
			goods_id: "id",
			sale_num: "stock",
			month_sales: "monthlySale",
		}
		for (let key in fieldMap) {
			if (fieldMap[key]) {
				data[fieldMap[key]] = goods[key]
			}
		}
		for (let key in numberFieldMap) {
			if (numberFieldMap[key]) {
				data[numberFieldMap[key]] = +goods[key]
			}
		}
		return data;
	}
}
module.exports = models;

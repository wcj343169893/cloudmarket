'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const shopCollection = db.collection("cloud_shops");
const userCollection = db.collection("uni-id-users");
const categoryCollection = db.collection("cloud_goods_categories");
const documentsCollection = db.collection("cloud_documents");
const adsCollection = db.collection("cloud_ads");
const {
	genIdentityId
} = require('base-common');
const models = {
	shopid: 0,
	originShopId: 0,
	/**
	 * 新旧分类id
	 */
	cateIdsMap: {},
	cateStartId: 0,
	/**
	 * 复制店铺数据
	 * @param {Object} event
	 */
	async copy(event) {
		const {
			database,
			synchronization,
			originShopId,
			users
		} = event;
		//复制店铺
		let res = await this.shop({
			synchronization,
			originShopId
		});
		console.log("店铺复制完成", res)
		//添加用户管理权限
		if (users) {
			res = await this.addUserShopAdmins(users);
			console.log("添加用户管理权限完成", res);
		}
		if (database.category) {
			res = await this.goodsCategory();
			console.log("分类复制完成", res)
			if (database.goods) {
				res = await this.goods();
				console.log("商品复制完成", res)
			}
		}
		if (database.documents) {
			res = await this.documents();
			console.log("说明文档复制完成", res)
		}
		if (database.ads) {
			res = await this.ads();
			console.log("广告复制完成", res)
		}
		return res;
	},
	/**
	 * 复制店铺，得到一个新的店铺id
	 * @param {Object} event
	 */
	async shop(event) {
		let info = {};
		if (event.originShopId) {
			let res = await shopCollection.where({
				id: +event.originShopId
			}).get();
			if (res.data.length == 0) {
				return false;
			}
			info = res.data[0];
			this.originShopId = info.id;
		} else {
			info = require("./shop.json");
		}
		this.shopid = await genIdentityId("shops");
		info = Object.assign(info, {
			...event
		}, {
			_id: undefined,
			id: this.shopid,
			dayStatisticsLog: undefined,
			goods: {},
			isPrint: false,
			monthSale: 0,
			order: {},
			score: 5
		})
		return await shopCollection.add(info);
	},
	/**
	 * 添加用户管理店铺权限
	 * @param {Object} event
	 */
	async addUserShopAdmin(event) {
		if (event.uid) {
			return await userCollection.where({
				_id: event.uid
			}).update({
				admin: cmd.addToSet(this.shopid)
			});
		}
	},
	/**
	 * 添加用户管理店铺权限
	 * @param {Object} event
	 */
	async addUserShopAdmins(users) {
		return await userCollection.where({
			_id: cmd.in(users)
		}).update({
			role: ["admin"],
			admin: cmd.addToSet(this.shopid)
		});
	},
	/**
	 * 一次导入所有分类,最好分类id不一样
	 */
	async goodsCategory() {
		let categoryList;
		if (this.originShopId) {
			let res = await categoryCollection.where({
				shopid: this.originShopId
			}).orderBy("id", "asc").get();
			if (res.data.length == 0) {
				return false;
			}
			categoryList = res.data;
		} else {
			categoryList = require("./goodsCategory.json");
		}
		//计算总个数，包含一级和二级
		let cateCount = categoryList.length;
		categoryList.forEach(main => {
			main._id = undefined;
			if (main.children) {
				cateCount += main.children.length;
			}
		});
		this.cateStartId = await genIdentityId("goods_categories", cateCount) - cateCount;

		categoryList.forEach(main => {
			this.replaceCategoryInfo(main);
			if (main.children) {
				main.children.forEach(cate => {
					cate.pid = main.id;
					this.replaceCategoryInfo(cate);
				})
			}
		})
		let res = await categoryCollection.add(categoryList);
		console.log(res);

	},
	/**
	 * 弃用
	 */
	async getCategoryImg() {
		let categoryList = require("./goodsCategory.json");
		let path = "https://xxx.tcb.qcloud.la";
		let urls = [];
		categoryList.forEach(cate => {
			if (cate.src.indexOf(path) === 0) {
				urls.push(cate.src)
			}
		});
		return urls;
	},
	/**
	 * 弃用
	 */
	async getGoodsImg() {
		const goodsList = require("./goods.json");
		let path = "https://xxx.tcb.qcloud.la";
		let urls = [];
		goodsList.forEach(goods => {
			if (goods.src.indexOf(path) === 0) {
				urls.push(goods.src)
			}
			if (goods.imgs) {
				goods.imgs.map(img => {
					if (img.indexOf(path) === 0) {
						urls.push(img)
					}
				})
			}
		});
		return urls;
	},
	/**
	 * 替换商品里面的图片，必须把文件上传到指定位置
	 * @param {Object} goods
	 * @param {Object} domain
	 */
	replaceGoodsUrlDomain(goods, domain) {
		let reg = /cdn\.cjblog\.org/g;
		if (goods.src) {
			goods.src = goods.src.replace(reg, domain);
		}
		if (goods.imgs) {
			goods.imgs.forEach(img => {
				img = img.replace(reg, domain);
			})
		}
		if (goods.categories) {
			goods.categories.forEach(cate => {
				if (cate.src) {
					cate.src = cate.src.replace(reg, domain);
				}
			})
		}
	},
	/**
	 * 分页导入商品1571，商品id新生成
	 */
	async goods(event) {
		let goodsList;
		if (this.originShopId) {
			let res = await goodsCollection.where({
				shopid: this.originShopId
			}).limit(1000).get();
			if (res.data.length == 0) {
				return false;
			}
			goodsList = res.data;
		} else {
			//从配置文件分配导入
			goodsList = require("./goods.json");
		}
		let data = [],
			res;
		let startId = await genIdentityId("goods", goodsList.length) - goodsList.length;
		for (let i = 0; i < goodsList.length; i++) {
			startId++;
			//更新分类id
			let goods = goodsList[i];
			if (goods.categories) {
				goods.categories.forEach(cate => {
					cate = Object.assign(cate, {
						...this.cateIdsMap[cate.id]
					});
				})
			}
			//替换图片域名
			/* if (domain) {
				this.replaceGoodsUrlDomain(goods, domain);
			} */
			goods = Object.assign(goods, {
				shopid: this.shopid,
				id: startId,
				originId: goods._id,
				_id: undefined
			});
			data.push(goods);
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
	 * 批量复制文档
	 */
	async documents() {
		let documentList
		if (this.originShopId) {
			let res = await documentsCollection.where({
				shopid: this.originShopId
			}).get();
			if (res.data.length == 0) {
				return false;
			}
			documentList = res.data;
		} else {
			documentList = require("./documents.json");
		}

		documentList.forEach(doc => {
			doc = Object.assign(doc, {
				shopid: this.shopid,
				_id: undefined
			})
		});
		let res = await documentsCollection.add(documentList);
		console.log(res);
		return res;
	},
	/**
	 * 复制轮播图，广告
	 * @param {Object} event
	 */
	async ads(event) {
		let data
		if (this.originShopId) {
			let res = await adsCollection.where({
				shopid: this.originShopId
			}).get();
			if (res.data.length == 0) {
				return false;
			}
			data = res.data;
		} else {
			data = require("./ads.json");
		}
		data.forEach(doc => {
			doc = Object.assign(doc, {
				shopid: this.shopid,
				_id: undefined
			})
		});
		return await adsCollection.add(data);
	},
	replaceCategoryInfo(cate) {
		this.cateStartId++;
		let id = cate.id;
		cate = Object.assign(cate, {
			shopid: this.shopid,
			id: this.cateStartId,
			_id: undefined
		});
		this.cateIdsMap[id] = Object.assign({ ...cate
		}, {
			children: undefined
		});
	}
};
module.exports = models;

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
		let res;
		//复制店铺
		res = await this.shop(event);
		console.log("店铺复制完成", res)
		//添加用户管理权限
		res = await this.addUserShopAdmin(event);
		console.log("添加用户管理权限完成", res);
		res = await this.goodsCategory(event);
		console.log("分类复制完成", res)
		res = await this.goods(event);
		console.log("商品复制完成", res)
		res = await this.documents(event);
		console.log("说明文档复制完成", res)
		res = await this.ads(event);
		console.log("广告复制完成", res)
		return res;
	},
	/**
	 * 复制店铺，得到一个新的店铺id
	 * @param {Object} event
	 */
	async shop(event) {
		let info = require("./shop.json");
		this.shopid = await genIdentityId("shops");
		info = Object.assign(info, {
			...event
		}, {
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
	 * 一次导入所有分类,最好分类id不一样
	 */
	async goodsCategory(event) {
		const {
			shopid
		} = event;
		let categoryList = require("./goodsCategory.json");
		if (shopid) {
			this.shopid = shopid;
		}
		//计算总个数，包含一级和二级
		let cateCount = categoryList.length;
		categoryList.forEach(main => {
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
		const {
			shopid,
			domain
		} = event;
		if (shopid) {
			this.shopid = shopid;
		}
		const goodsList = require("./goods.json");
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
			if (domain) {
				this.replaceGoodsUrlDomain(goods, domain);
			}
			goods = Object.assign(goods, {
				shopid: this.shopid,
				id: startId,
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
	async documents(event) {
		const {
			shopid
		} = event;
		if (shopid) {
			this.shopid = shopid;
		}
		let documentList = require("./documents.json");
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
		const {
			shopid
		} = event;
		if (shopid) {
			this.shopid = shopid;
		}
		let data = require("./ads.json");
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

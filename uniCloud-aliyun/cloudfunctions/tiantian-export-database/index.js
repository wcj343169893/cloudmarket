'use strict';
const fs = require("fs")
const db = uniCloud.database();
/**
 * 本地执行云函数，生成db_init.json，外网无法访问
 */
exports.main = async (event, context) => {
	// 2022-12-05处理商品、分类、轮播图
	// return exportFilterData();
	return exportMallData();
};


/**
 * 2022-12-05处理商品、分类、轮播图、优惠券
 */
const exportMallData = async () => {
	let origin = require('./db_init_full.json')
	//只更新这三个表数据
	let mallCollections = ["cloud_ads", "cloud_goods", "cloud_goods_categories", "cloud_coupons"]
	for await (let coll of mallCollections) {
		origin[coll].data = await getDataByPage(coll, 1);
		console.log(`${coll}导出完成`)
	}
	console.log("全部导出完成")
	fs.writeFileSync(require('path').resolve(__dirname, '../../database/db_init.json'), JSON.stringify(origin))
	console.log("写入完成")
	return origin;
}
const exportFilterData = async () => {
	let shopid = 10000
	let origin = require('./db_init_full.json')
	let collections = Object.keys(origin);
	let keepData = ["cloud_ads", "cloud_documents"]
	for (let coll of keepData) {
		if (origin[coll]) {
			let {
				data
			} = origin[coll]
			if (data) {
				origin[coll].data = data.filter(e => e.shopid == shopid);
			}
		}
	}
	console.log("全部导出完成")
	fs.writeFileSync(require('path').resolve(__dirname, '../../database/db_init.json'), JSON.stringify(origin))
}
const exortAllData = async () => {
	let origin = require('./db_init_origin.json')
	let collections = Object.keys(origin);

	/**
	 * 导出所有数据的表
	 */
	let allDataCollection = [
		"opendb-admin-menus",
		"opendb-news-articles", "opendb-news-categories", "cloud_ads", "cloud_goods_categories",
		"cloud_identity", "cloud_printer_types",
		"uni-id-permissions", "uni-id-roles", "cloud_documents", "cloud_goods", "cloud_shops",
		"cloud_shop_express_templates",
	]
	//默认无数据
	collections.map(e => {
		origin[e].data = []
	})
	for await (let coll of allDataCollection) {
		//查询数据，默认只查询了100条
		origin[coll].data = await getDataByPage(coll, 1);
		console.log(`${coll}导出完成`)
	}
	console.log("全部导出完成")
	fs.writeFileSync(require('path').resolve(__dirname, '../../database/db_init.json'), JSON.stringify(origin))
	console.log("写入完成")
	return origin;
}

const getDataByPage = async (coll, page, limit = 500) => {
	let {
		data
	} = await db.collection(coll).skip((page - 1) * limit).limit(500).get();
	if (data.length == limit) {
		console.log(coll + " page:" + page)
		data = data.concat(await getDataByPage(coll, page + 1, limit))
	}
	return data;
}

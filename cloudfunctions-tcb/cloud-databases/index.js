'use strict';
const db = uniCloud.database();
/**
 * 登录https://unicloud.dcloud.net.cn/cloud-database，
 * 按F12，
 * 打开云数据库，
 * 查看网络请求： https://unicloud.dcloud.net.cn/unicloud/api/database/collections
 * 复制返回内容到config文件
 */
const conf = require("./config");
/**
 * 导出集合数据
 */
exports.main = async (event, context) => {
	let collections = conf["main"]["data"]["collections"];
	let data = {};
	for (let m of collections) {
		data[m.name] = {
			data: []
		};
		//限制条数
		//let limit = limits[m.name] != undefined ? limits[m.name] : 1;
		let limit = 200;
		let collectionName = "cloud_"+m.name;
		//判断集合是否存在
		try{
			await db.createCollection(collectionName);
			let result = await db.collection(m.name).limit(limit).get();
			//data[m.name].data = result.data;
			for (let da of result.data) {
				await db.collection(collectionName).add(da);
			}
		}catch(e){
			//TODO handle the exception
		}
		
		
		//设置索引
		if (indexs[m.name]) {
			data[m.name].index = indexs[m.name];
		}
	}
	return data;
};
/**
 * 限制导出条数
 */
const limits = {
	"users": 3,
	"identity": 30,
	"documents": 30,
	"goods_visites": 0,
	"goods_deletes": 0,
	"goods_day_sales": 0,
	"goods_shop_day_sales": 0,
	"user_balance_logs": 0,
	"carts": 0,
	"shops": 2,
	"orders": 0,
	"order_refunds": 0
}
/**
 * 必备索引,索引是数组
 */
const indexs = {
	"shops": [{
		"IndexName": "index_lonlat",
		"MgoKeySchema": {
			"MgoIndexKeys": [{
				"Name": "lnglat",
				"Direction": "2dsphere"
			}],
			"MgoIsUnique": false
		}
	}]
}

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
		data[m.name] = {};
		//限制条数
		let limit = limits[m.name] ? limits[m.name] : 100;
		let da = await db.collection(m.name).limit(limit).get();
		data[m.name].data = da.data;
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
	"users": 3
}
/**
 * 必备索引
 */
const indexs = {
	"shops": {
		"IndexName": "index_lonlat",
		"MgoKeySchema": {
			"MgoIndexKeys": [{
				"Name": "lnglat",
				"Direction": "2dsphere"
			}],
			"MgoIsUnique": false
		}
	}
}

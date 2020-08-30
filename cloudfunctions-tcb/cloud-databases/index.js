'use strict';
const db = uniCloud.database();
/**
 * 登录https://unicloud.dcloud.net.cn/cloud-database，
 * 按F12，
 * 打开云数据库，
 * 查看网络请求： https://unicloud.dcloud.net.cn/unicloud/api/database/collections
 * 复制返回内容到config文件
 */
/**
 * 导出集合数据
 */
exports.main = async (event, context) => {
	let collections = configs.data.collections;
	let data = {};
	for (let m of collections) {
		data[m.name] = {
			data: []
		};
		//限制条数
		let limit = limits[m.name] ? limits[m.name] : 1;
		//let collectionName = "cloud_"+m.name;
		let result = await db.collection(m.name).limit(limit).get();
		data[m.name].data = result.data;
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
	"cloud_users": 3,
	"cloud_identity": 30,
	"cloud_documents": 30,
	"cloud_goods": 100,
	"cloud_goods_visites": 1,
	"cloud_goods_deletes": 1,
	"cloud_goods_day_sales": 1,
	"cloud_goods_shop_day_sales": 1,
	"cloud_user_balance_logs": 1,
	"cloud_carts": 1,
	"cloud_shops": 2,
	"cloud_orders": 1,
	"cloud_order_refunds": 1
}
/**
 * 必备索引,索引是数组
 */
const indexs = {
	"cloud_shops": [{
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

const configs = {
	"desc": "ok",
	"data": {
		"collections": [{
			"name": "cloud_addresses"
		}, {
			"name": "cloud_ads"
		}, {
			"name": "cloud_carts"
		}, {
			"name": "cloud_documents"
		}, {
			"name": "cloud_goods"
		}, {
			"name": "cloud_goods_activities"
		}, {
			"name": "cloud_goods_categories"
		}, {
			"name": "cloud_goods_day_sales"
		}, {
			"name": "cloud_goods_deletes"
		}, {
			"name": "cloud_goods_shop_day_sales"
		}, {
			"name": "cloud_goods_visites"
		}, {
			"name": "cloud_identity"
		}, {
			"name": "cloud_order_refunds"
		}, {
			"name": "cloud_orders"
		}, {
			"name": "cloud_shop_comments"
		}, {
			"name": "cloud_shops"
		}, {
			"name": "cloud_user_balance_logs"
		}, {
			"name": "uni-app-version"
		}, {
			"name": "uni-id-users"
		}, {
			"name": "uni-verify"
		}]
	}
};

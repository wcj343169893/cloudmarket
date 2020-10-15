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
		let limit = limits[m.name] ? limits[m.name] : 10;
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
	"cloud_goods_categories": 100,
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
	"cloud_goods": [{
			"IndexName": "index_cate",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
						"Name": "shopid",
						"Direction": "1"
					},
					{
						"Name": "categories.id",
						"Direction": "1"
					}
				],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "index_sold",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
						"Name": "shopid",
						"Direction": "1"
					},
					{
						"Name": "isSold",
						"Direction": "1"
					},
					{
						"Name": "isCategoryShow",
						"Direction": "1"
					}
				],
				"MgoIsUnique": false
			}
		}
	],
	"cloud_identity": [{
		"IndexName": "index_key",
		"MgoKeySchema": {
			"MgoIndexKeys": [{
				"Name": "key",
				"Direction": "1"
			}],
			"MgoIsUnique": true
		}
	}],
	"cloud_shops": [{
		"IndexName": "index_lonlat",
		"MgoKeySchema": {
			"MgoIndexKeys": [{
				"Name": "lnglat",
				"Direction": "2dsphere"
			}],
			"MgoIsUnique": false
		}
	}],
	"uni-id-users": [{
			"IndexName": "username",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "username",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "mobile",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "mobile",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "email",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "email",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "wx_openid.app-plus",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "wx_openid.app-plus",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "wx_openid.mp-weixin",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "wx_openid.mp-weixin",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "wx_unionid",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "wx_unionid",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "ali_openid",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "ali_openid",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "my_invite_code",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "my_invite_code",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "inviter_uid",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "inviter_uid",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "invite_time",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "invite_time",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		},
		{
			"IndexName": "role",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "role",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		}
	],
	"uni-id-roles": [{
			"IndexName": "role_id",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "role_id",
					"Direction": "1"
				}],
				"MgoIsUnique": true
			}
		},
		{
			"IndexName": "permission",
			"MgoKeySchema": {
				"MgoIndexKeys": [{
					"Name": "permission",
					"Direction": "1"
				}],
				"MgoIsUnique": false
			}
		}
	],
	"uni-id-permissions": [{
		"IndexName": "permission_id",
		"MgoKeySchema": {
			"MgoIndexKeys": [{
				"Name": "permission_id",
				"Direction": "1"
			}],
			"MgoIsUnique": true
		}
	}]
}

const configs = {
	"ret": 0,
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
			"name": "cloud_goods_comments"
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
			"name": "cloud_printer_types"
		}, {
			"name": "cloud_shops"
		}, {
			"name": "cloud_user_balance_logs"
		}, {
			"name": "uni-app-version"
		}, {
			"name": "uni-id-permissions"
		}, {
			"name": "uni-id-roles"
		}, {
			"name": "uni-id-users"
		}, {
			"name": "uni-verify"
		}]
	}
};

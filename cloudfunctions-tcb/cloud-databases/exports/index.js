'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const usersCollection = db.collection("uni-id-users");
const {
	getDayTime,
	getDateFormat
} = require('base-common');
const models = {
	limits: {
		cloud_users: 3,
		cloud_identity: 100,
		cloud_documents: 100,
		cloud_goods: 1,
		cloud_goods_categories: 100,
		cloud_goods_visites: 1,
		cloud_goods_deletes: 1,
		cloud_goods_day_sales: 1,
		cloud_goods_shop_day_sales: 1,
		cloud_user_balance_logs: 1,
		cloud_carts: 1,
		cloud_shops: 2,
		cloud_orders: 1,
		cloud_order_refunds: 1
	},
	maxGoodsId: 0,
	outGoodsData: [],
	/**
	 * 正常导出，这里不包含商品数据，数据太多，用db_init.json无法导入
	 */
	async normal() {
		const dbInit = require("./db_init.json");
		for (let name in dbInit) {
			//限制条数
			let limit = this.limits[name] ? this.limits[name] : 10;
			let result = await db.collection(name).limit(limit).get();
			dbInit[name].data = result.data;
		}
		return dbInit;
	},
	/**
	 * 导出商品数据，手动保存到imports中的goods.json，才能导入
	 */
	async goods() {
		let res = await goodsCollection.where({
			id: cmd.gt(this.maxGoodsId)
		}).limit(100).orderBy("id", "asc").get();
		console.log("获得商品", res.data.length)
		if (res.data.length > 0) {
			this.maxGoodsId = res.data[res.data.length - 1].id;
			outGoodsData = outGoodsData.concat(res.data);
			await this.goods();
		}
		return outGoodsData;
	},
	/**
	 * 导出会员信息
	 * @param {Object} data
	 * @link http://api.cjblog.org/databases/exports/member?state=allMember
	 */
	async member(data) {
		const xlsx = require("node-xlsx");
		const {
			state,
			getContent
		} = data;
		let condition = {
			_id: cmd.exists(true)
		};
		let statistics = this.getUserStateCondition();
		if (state && statistics[state]) {
			condition = statistics[state];
		}
		//分页查询数据
		let page = 1,
			limit = 500,
			result = [
				["卡号", "姓名", "身份证", "手机号", "地址", "日期"]
			];
		for (let i = 0; i < 100; i++) {
			const res = await usersCollection.where(condition).field({
				member: 1,
				id: 1
			}).skip((page - 1) * limit).limit(limit).orderBy("id", "asc").get();
			if (res.data.length == 0) {
				break;
			}
			res.data.map(usr => {
				if (usr.member) {
					let {
						name,
						idcard,
						mobile,
						address,
						created
					} = usr.member;
					result.push([usr.id, name, idcard, mobile, address, created ? new Date(created) : new Date()]);
				}
			});
			if (res.data.length < limit) {
				break;
			}
		}
		if (result.length > 1) {
			//宽度
			const options = {
				'!cols': [{
					wch: 10
				}, {
					wch: 10
				}, {
					wch: 20
				}, {
					wch: 20
				}, {
					wch: 20
				}, {
					wch: 20
				}]
			};
			let filename = state + getDateFormat("yyyy-MM-dd");
			let buffer = xlsx.build([{
				name: "mySheet",
				data: result
			}], options);
			if (getContent) {
				return buffer.toString('base64');
			}
			return {
				mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
				statusCode: 200,
				isBase64Encoded: true,
				headers: {
					'content-type': 'text/plain',
					'Content-disposition': `attachment; filename=${filename}.xlsx`,
				},
				body: buffer.toString('base64')
			}
		}
		return false;
	},
	getUserStateCondition() {
		const {
			todayTime,
			yestertodayTime
		} = getDayTime();
		let statistics = {
			yestertoday: {
				register_date: cmd.gte(yestertodayTime).lt(todayTime)
			},
			today: {
				register_date: cmd.gte(todayTime)
			},
			allMember: {
				member: cmd.exists(true),
			},
			yestertodayMember: {
				member: cmd.exists(true),
				register_date: cmd.gte(yestertodayTime).lt(todayTime)
			},
			todayMember: {
				member: cmd.exists(true),
				register_date: cmd.gte(todayTime)
			},
		};
		return statistics;
	},
};
module.exports = models;

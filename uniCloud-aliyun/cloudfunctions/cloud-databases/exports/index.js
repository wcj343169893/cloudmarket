'use strict';
const db = uniCloud.database();
const cmd = db.command;
const $ = db.command.aggregate;
const goodsCollection = db.collection("cloud_goods");
const ordersCollection = db.collection("cloud_orders");
const usersCollection = db.collection("uni-id-users");
const xlsx = require("node-xlsx");
const nodemailer = require("nodemailer");
const {
	getDayTime,
	getDate,
	getDateFormat
} = require('base-common');
const {
	getConfig
} = require('configs');
const path = require("path");
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
	async users() {
		let res = await usersCollection.where({
			_id: cmd.exists(true)
		}).limit(500).orderBy("id", "asc").get();
		console.log("获得用户", res.data.length)
		if (res.data.length > 0) {
			return false;
		}
		return res.data;
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
	async order(data) {
		const {
			state
		} = data;
	},
	/**
	 * 导出会员信息
	 * @param {Object} data
	 * @link http://api.cjblog.org/databases/exports/member?state=allMember
	 */
	async member(data) {
		const {
			state,
			date,
			getContent
		} = data;
		let condition = {
			_id: cmd.exists(true)
		};
		let statistics = this.getUserStateCondition();
		let filename = "excel";
		if (state && statistics[state]) {
			filename = state + getDateFormat("yyyy-MM-dd");
			condition = statistics[state];
		} else if (date) {
			filename = date;
			//指定日期,2020-12-12
			let beginTime = new Date(`${date}T00:00:00.000Z`).getTime();
			let endTime = new Date(`${date}T23:59:59.999Z`).getTime();
			condition = {
				member: cmd.exists(true),
				"member.time": cmd.gte(beginTime).lte(endTime)
			};
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
					result.push([usr.id, name, idcard, mobile, address, created ? getDate(created) :
						getDate()
					]);
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
	/**
	 * 导出自提点的订单和商品(待发货，已发货)
	 * @param {Object} data
	 * @link http://api.cjblog.org/databases/exports/selfraising?id=2fd465895fafc49500b4c1e063f2e69f
	 */
	async selfraising(data) {
		let {
			id,
			state,
			getContent
		} = data;
		if (!state) {
			state = 1;
		} else {
			state = parseInt(state);
		}
		let page = 1,
			limit = 500,
			condition = {
				"raisingPoint._id": id,
				state,
				isRefundAll: cmd.exists(false)
			},
			result = [];
		let title = ["订单号", "每日编号", "商品数量", "姓名", "电话", "提货时间", "时段", "提货码", "提货密码", "订单状态", "总金额", "商品ID",
			"商品标题", "商品规格",
			"商品价格", "商品数量",
			"UPC"
		];
		result.push(title);
		for (let i = 0; i < 100; i++) {
			const res = await ordersCollection.where(condition).skip((page - 1) * limit).limit(limit).orderBy(
				"id", "asc").get();
			if (res.data.length == 0) {
				break;
			}
			res.data.map(order => {
				if (!order.refundAmount) {
					order.refundAmount = 0;
				}
				let base = [order.id, order.dayIndex, order.cartCount - order.refundAmount, order
					.selfRaising.name, order.selfRaising
					.mobile,
					getDate(order.deliveryHour.id), order.deliveryHour.time, order.deliveryHour
					.number, order.deliveryHour.password,
					order.state, order.totalMoney
				];
				let baseLength = base.length;
				let index = 0;
				order.goods.map((goods) => {
					let cells = base;
					if (!goods.refundAmount) {
						goods.refundAmount = 0;
					}
					if (goods.amount - goods.refundAmount > 0) {
						if (index > 0) {
							cells = new Array(baseLength)
						} else {
							cells = base;
						}
						cells.push(goods.id);
						cells.push(goods.title);
						cells.push(goods.name);
						cells.push(goods.price);
						cells.push(goods.amount - goods.refundAmount);
						cells.push(goods.upc);
						result.push(cells);
						index++;
					}
				})
			});
			if (res.data.length < limit) {
				break;
			}
		}
		if (result.length > 1) {
			//宽度
			const options = {
				'!cols': []
			};
			for (let i = 0; i < title.length; i++) {
				options['!cols'].push({
					wch: 20
				})
			}

			let filename = id + getDateFormat("yyyyMMddhhmmss");
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
		return {
			mpserverlessComposedResponse: true, // 使用阿里云返回集成响应是需要此字段为true
			statusCode: 200,
			headers: {
				'content-type': 'text/html',
			},
			body: "暂无内容"
		};
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
				"member.time": cmd.gte(yestertodayTime).lt(todayTime)
			},
			todayMember: {
				member: cmd.exists(true),
				"member.time": cmd.gte(todayTime)
			},
		};
		return statistics;
	},
	async sendEmail(data) {
		let config = getConfig("email");
		if (!config || !config.transport) {
			return false;
		}
		// Generate test SMTP service account from ethereal.email
		// Only needed if you don't have a real mail account for testing
		//let testAccount = await nodemailer.createTestAccount();
		console.log("开始发送")
		// create reusable transporter object using the default SMTP transport
		let transporter = nodemailer.createTransport(config.transport);
		console.log("创建账号")
		// send mail with defined transport object
		let info = await transporter.sendMail({
			subject: "邮件主题", // Subject line
			...config.send,
			...data
		});
		console.log("Message sent: ", info.messageId);
		return info;
	},
	/**
	 * 每日定时任务,1.发送会员邮件，2.数据报表邮件
	 * @param {Object} data
	 */
	async timer(data) {
		//昨日时间
		let date = getDateFormat("yyyy-MM-dd", Date.now() - 3600 * 24 * 1000);
		let beginTime = new Date(`${date}T00:00:00.000Z`).getTime();
		let endTime = new Date(`${date}T23:59:59.999Z`).getTime();
		const memberRes = await usersCollection.where({
			member: cmd.exists(true),
			"member.time": cmd.gte(beginTime).lte(endTime)
		}).count();
		if (memberRes.total > 0) {
			let file = await this.member({
				date: date,
				getContent: true
			});
			let content = [];
			let config = getConfig();
			//会员信息下载地址
			let url = [config.domain, "/databases/exports/member", "?date=" + date].join("");
			content.push(`<p>${date}查询到会员信息${memberRes.total}条</p>`);
			content.push(`<p>开始时间戳:${beginTime},结束时间戳:${endTime}</p>`);
			content.push(`<p><a href="${url}">重新获取</a></p>`);
			content.push(`<p>${url}</p>`);
			content.push(`<p>更改日期,即可查询其他日期的数据</p>`);
			//查询会员数量
			return await this.sendEmail({
				subject: `${date}新申请${memberRes.total}会员`,
				html: content.join(""),
				attachments: [{
					filename: `${date}.xlsx`,
					content: file,
					encoding: 'base64'
				}]
			});
		} else {
			//没有会员
			return await this.sendEmail({
				subject: `${date}会员没有新会员`,
				html: `<p>${date}没有新注册会员</p>`
			});
		}
	}
};
module.exports = models;

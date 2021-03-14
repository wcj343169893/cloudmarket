'use strict';
const db = uniCloud.database();
const cmd = db.command;
const uniID = require('uni-id');
const {
	addUserBalanceLog,
	genIdentityId
} = require('base-common');
const {
	getUserConfig
} = require('configs');
const shopCollection = db.collection("cloud_shops");
const ordersCollection = db.collection("cloud_orders");
const orderRefundsCollection = db.collection("cloud_order_refunds");
const userBalanceLogCollection = db.collection("cloud_user_balance_logs");
const selfraisingCollection = db.collection("cloud_self_raising_points");
const couponUserCollection = db.collection("cloud_coupon_users");
const userCashoutCollection = db.collection("cloud_user_cashouts");
const userCollection = db.collection("uni-id-users");
const models = {
	//我的信息
	async mine(data, context) {
		let res = await getUserInfo(data.uid, [
			"id", "nickname", "my_invite_code",
			"gender", "status", "mobile", "email",
			"mobile_confirmed", "balance",
			"email_confirmed", "avatar", "comment", "birthday",
			"coupons", "score", "member", "raisingPoint", "wx_openid", "ali_openid", "role"
		], context.userInfo);
		//查询报错
		if (res.code > 0) {
			return res;
		}
		//自动生成用户id,方便传播和查询
		if (!res.userInfo.id && getUserConfig().autoSetId) {
			res.userInfo.id = await this.setUserMember(data.uid);
		}
		//是否设置昵称
		res.userInfo.isSetNickname = !!res.userInfo.nickname;
		//设置默认值
		res.userInfo = Object.assign({
			balance: 0,
			coupons: 0,
			score: 0,
			nickname: "游客",
			gender: 3,
			birthday: ""
		}, res.userInfo)
		return res.userInfo;
	},
	/**
	 * 设置用户的会员卡信息,member
	 * @param {Object} uid
	 */
	async setUserMember(uid, info = false, genId = false) {
		let data = {
			uid
		};
		if (!genId) {
			genId = await genIdentityId("users");
			data.id = genId;
		}
		//会员扩展信息
		if (info) {
			info.created = new Date().toISOString();
			info.time = Date.now();
			data.member = info;
		}
		//保存id
		let result = await uniID.updateUser(data);
		console.log("save user id", result, info);
		return genId;
	},
	/**
	 * 申请会员卡
	 * @param {Object} data
	 */
	async member(data, context) {
		const {
			uid
		} = data;
		const {
			userInfo
		} = context;
		delete data.uid;
		//如果用户已经有id，则只更新info
		return await this.setUserMember(uid, data, userInfo.id);
	},
	//信息统计
	async statistics(data, context) {
		let res = await getUserInfo(data.uid, ["id", "order", "nickname", "balance", "admin", "coupons",
				"score", "count"
			],
			context.userInfo);
		if (res.code > 0) {
			return res;
		}
		let info = res.userInfo;
		//处理余额为2位小数
		info.balance = info.balance ? info.balance.toFixed(2) * 1 : 0;
		//免费开通会员最后期限
		info.lastFreeVip = new Date().getTime() + 3600 * 1000 * 24 * 365;
		//当前时间
		info.time = new Date().getTime();
		//88/年
		info.vipPrice = 88;
		//管理店铺
		await this.getAdminShop(info);
		//管理的提货点
		await this.getAdminSelfRaisingPoint(info);
		//我的订单统计
		await this.getOrderStatistics(info);
		//我的有效优惠券数量
		await this.getCouponsStatistics(info);
		//查询我的自提点（团长）
		return info;
	},
	//开通会员，后续完成
	async vip(data) {
		//限时开通途径，free
		let channel = data.channel;
		data.message = "开通失败";
		return false;
	},
	/**
	 * 申请提现
	 * @param {Object} data
	 */
	async cashout({
		uid,
		money
	}, {
		userInfo
	}) {
		//余额不足
		if (money > userInfo.balance) {
			console.log("余额不足", money, userInfo.balance)
			return false;
		}

		if (!userInfo.wx_openid && !userInfo.ali_openid) {
			console.log("未绑定微信/支付宝")
			return false;
		}
		money = +money;
		let transaction = await db.startTransaction();
		let res = await userCollection.where({
			_id: uid,
			balance: cmd.gte(money)
		}).update({
			balance: cmd.inc(money * -1),
		});
		if (res.updated > 0) {
			userInfo.balance = userInfo.balance - money;
			let uinfo = await getUserInfo(uid, [
				"id", "nickname",
				"gender", "status", "mobile", "email", "avatar",
				"comment", "birthday", "member", "wx_openid",
				"ali_openid", "role", "last_login_date", "register_date", "balance"
			], userInfo);
			res = await userCashoutCollection.add({
				uid,
				money,
				state: 0,
				user: uinfo.userInfo,
				created: Date.now()
			})
			console.log("提现记录：", res)
			let log = await addUserBalanceLog({
				uid: uid,
				type: 0, //0支出，1收入
				balance: userInfo.balance,
				money: money,
				description: "提现",
				cashout: {
					_id: res.id,
					state: 0
				}
			});
			console.log("收支日志：", log)
			transaction.commit();
			return res;
		}
		transaction.rollback();
		return false;
	},
	/**
	 * 分页查询零钱明细
	 * @param {Object} data
	 */
	async balancelog(data) {
		const {
			page,
			limit,
			uid
		} = data;
		const res = await userBalanceLogCollection.where({
			uid
		}).orderBy("created", "desc").skip((page - 1) * limit).limit(limit).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	},
	//修改用户信息
	async save(data) {
		let strinFields = ["avatar", "nickname", "birthday"];
		let intFields = ["gender"];
		let entity = {};
		for (let f in data) {
			if (strinFields.indexOf(f) != -1) {
				//可保存的字段
				entity[f] = data[f];
			} else if (intFields.indexOf(f) != -1) {
				entity[f] = parseInt(data[f]);
			}
		}
		console.log("保存用户基本信息", entity);
		//保存更改
		return await uniID.updateUser({
			uid: data.uid,
			...entity
		});
	},
	/**
	 * 设置用户的自提点
	 * @param {Object} data
	 */
	async setSelfRaisingPoint(data) {
		const {
			uid,
			raisingPoint
		} = data;
		//位置
		raisingPoint.location = new db.Geo.Point(raisingPoint.longitude, raisingPoint.latitude);
		return await uniID.updateUser({
			uid,
			raisingPoint
		});
	},
	/**
	 * 微信小程序更新用户信息，需要解密
	 * @param {Object} data
	 */
	async saveByMpWeixin(data) {
		const {
			uid,
			userInfo
		} = data;
		console.log(userInfo);
		//@TODO 验证真实性
		let saveData = {
			uid,
			nickname: userInfo.nickName,
			avatar: userInfo.avatarUrl,
			gender: userInfo.gender
		};
		await this.save(saveData);
		return saveData;
	},
	/**
	 * 获取用户订单真实统计,与order字段不冲突
	 * @param {Object} info
	 */
	async getOrderStatistics(info) {
		//类型,-2:deleted已删除，-1:canceled已取消，0:unpaid未付款，1:payup已付款，
		//2:delivered已发货，3:received已收货，4:estimated已评价，refunded退款
		let statistics = {
			unpaid: {
				isDelete: 0,
				state: 0
			},
			payup: {
				state: cmd.in([1, 2]),
				isDelete: 0,
				isRefundAll: cmd.exists(false)
			},
			received: {
				state: 3,
				isDelete: 0,
				isRefundAll: cmd.exists(false)
			}
		};
		if (!info["order"]) {
			info["order"] = {};
		}
		for (let key in statistics) {
			info["order"][key] = await this.getOrderStatisticsByCondition({
				uid: info._id,
				...statistics[key]
			})
		}
		//退款条数
		info["order"]["refund"] = await this.getOrderRefundStatisticsByCondition({
			uid: info._id,
			state: "verifying"
		})
	},
	/**
	 * 查询店铺订单统计
	 * @param {Object} shop
	 */
	async getShopOrderStatistics(shop) {
		let time = new Date().getTime();
		let statistics = {
			unpaid: {
				state: 0,
				lastPayTime: cmd.gt(time)
			},
			payup: {
				state: 1,
				isRefundAll: cmd.exists(false)
			},
			estimated: {
				state: 4,
				isRefundAll: cmd.exists(false)
			}
		}
		shop["order"] = {};
		for (let key in statistics) {
			shop["order"][key] = await this.getOrderStatisticsByCondition({
				shopid: shop.id,
				...statistics[key]
			});
		}
		//退款中的数量
		shop["order"]["refunded"] = await this.getOrderRefundStatisticsByCondition({
			shopid: shop.id,
			state: "verifying"
		});
	},
	/**
	 * 根据订单条件，查询总条数
	 * @param {Object} uid
	 * @param {Object} condition
	 */
	async getOrderStatisticsByCondition(condition) {
		let res = await ordersCollection.where({
			...condition
		}).count();
		return res.total;
	},
	/**
	 * 查询退款申请条数
	 * @param {Object} uid
	 */
	async getOrderRefundStatisticsByCondition(condition) {
		let res = await orderRefundsCollection.where({
			...condition
		}).count();
		return res.total;
	},
	/**
	 * 团长管理的提货点
	 * @param {Object} info
	 */
	async getAdminSelfRaisingPoint(info) {
		let res = await selfraisingCollection.where({
			uid: info._id
		}).limit(100).field({
			address: 1,
			latitude: 1,
			longitude: 1,
			mobile: 1,
			commission: 1,
			name: 1,
			state: 1,
			head: 1,
			inside: 1,
			src: 1
		}).orderBy("created", "desc").get();
		if (res.data.length > 0) {
			info.selfraising = res.data;
		}
	},
	/**
	 * 我管理的店铺
	 * @param {Object} info
	 */
	async getAdminShop(info) {
		if (info.admin) {
			//查询店铺的订单统计情况,以及店铺信息
			let shops = await shopCollection.where({
				id: cmd.in(info.admin)
			}).orderBy("id", "desc").limit(30).get();
			info.admin = [];
			for (let shop of shops.data) {
				await this.getShopOrderStatistics(shop);
				info.admin.push(shop);
			}
		}
	},
	async shops(data, context) {
		const {
			userInfo
		} = context;
		if (userInfo.admin) {
			let res = await shopCollection.where({
				id: cmd.in(userInfo.admin)
			}).field({
				id: 1,
				name: 1
			}).orderBy("id", "desc").limit(50).get();
			return res.data;
		}
		return false;
	},
	async push(data) {
		const {
			uid,
			appid
		} = data;
		delete data.uid;
		//保存id
		let result = await uniID.updateUser({
			uid: uid,
			push: {
				[`${appid}`]: data
			}
		});
		console.log("更新用户推送配置", uid, data, result);
		return data;
	},
	/**
	 * 查询优惠券总数
	 * @param {Object} data
	 */
	async getCouponsStatistics(data) {
		let t = Date.now();
		let res = await couponUserCollection.where({
			uid: data._id,
			state: 0,
			beginTime: cmd.lt(t),
			endTime: cmd.gt(t)
		}).count();
		data.coupons = res.total;
	},
	/**
	 * 分页查询优惠券
	 */
	async coupons(data) {
		const {
			page,
			limit,
			uid,
			state
		} = data;
		let t = Date.now();
		let conditions = {
			uid
		};
		//0未使用，1已使用，2已过期
		//可用
		if (state == 0) {
			Object.assign(conditions, {
				state,
				beginTime: cmd.lt(t),
				endTime: cmd.gt(t)
			})
		} else if (state == 2) {
			//过期
			Object.assign(conditions, {
				endTime: cmd.lt(t)
			})
		} else {
			//已使用
			conditions.state = 1;
		}
		//created 领券时间
		let res = await couponUserCollection.where(conditions).orderBy("created", "desc").skip((page - 1) *
			limit).limit(
			limit).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	}
}
/**
 * 优先读取之前查询的信息
 */
const getUserInfo = async (uid, field, userInfo) => {
	if (userInfo) {
		let data = {
			_id: uid
		};
		for (let f of field) {
			if (userInfo[f] !== undefined) {
				data[f] = userInfo[f];
			}
		}
		return {
			code: 0,
			userInfo: data
		};
	}
	return await uniID.getUserInfo({
		uid,
		field
	});
}

module.exports = models;

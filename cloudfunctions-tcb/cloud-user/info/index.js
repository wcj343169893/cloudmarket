'use strict';
const db = uniCloud.database();
const cmd = db.command;
const uniID = require('uni-id');
const {
	genIdentityId
} = require('base-common');
const shopCollection = db.collection("cloud_shops");
const ordersCollection = db.collection("cloud_orders");
const orderRefundsCollection = db.collection("cloud_order_refunds");
const userBalanceLogCollection = db.collection("cloud_user_balance_logs");
const models = {
	//我的信息
	async mine(data, context) {
		let res = await getUserInfo(data.uid, [
			"id", "nickname", "my_invite_code",
			"gender", "status", "mobile", "email",
			"mobile_confirmed", "balance",
			"email_confirmed", "avatar", "comment", "birthday",
			"coupons", "score"
		]);
		//查询报错
		if (res.code > 0) {
			return res;
		}
		//自动生成用户id,方便传播和查询
		if (!res.userInfo.id) {
			let id = await genIdentityId("users");
			//保存id
			let result = await uniID.updateUser({
				uid: data.uid,
				id
			});
			console.log("save user id", result);
			res.userInfo.id = id;
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
	//信息统计
	async statistics(data) {
		let res = await getUserInfo(data.uid, ["order", "balance", "admin", "coupons", "score", "count"]);
		if (res.code > 0) {
			return res;
		}
		let info = res.userInfo;
		//处理余额为2位小数
		info.balance = info.balance ? info.balance.toFixed(2) * 1 : 0;
		if (info.admin) {
			//查询店铺的订单统计情况,以及店铺信息
			let shops = await shopCollection.where({
				id: cmd.in(info.admin)
			}).field({
				id: 1,
				name: 1,
				src: 1,
				monthSale: 1,
				address: 1,
				order: 1,
				banner: 1
			}).orderBy("id", "desc").limit(30).get();
			info.admin = [];
			for (let shop of shops.data) {
				await this.getShopOrderStatistics(shop);
				info.admin.push(shop);
			}
		}
		//免费开通会员最后期限
		info.lastFreeVip = 1601530971745;
		//当前时间
		info.time = new Date().getTime();
		//88/年
		info.vipPrice = 88;
		await this.getOrderStatistics(info);
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
	 * 微信小程序更新用户信息，需要解密
	 * @param {Object} data
	 */
	async saveByMpWeixin(data){
		const {uid,userInfo} = data;
		console.log(userInfo);
		//@TODO 验证真实性
		let saveData = {
			uid,
			nickname:userInfo.nickName,
			avatar:userInfo.avatarUrl,
			gender:userInfo.gender
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
				state: 0
			},
			payup: {
				state: cmd.in([1, 2])
			},
			received: {
				state: 3
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
		let statistics = {
			unpaid: {
				state: 0
			},
			payup: {
				state: 1
			},
			estimated: {
				state: 4
			}
		}
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
	}
}
/**
 * uniid插件还未发布的方法
 */
const getUserInfo = async (uid, field) => {
	return await uniID.getUserInfo({
		uid,
		field
	});
}

module.exports = models;

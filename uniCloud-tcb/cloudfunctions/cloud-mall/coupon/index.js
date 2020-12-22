'use strict';
const db = uniCloud.database();
const cmd = db.command;
const couponCollection = db.collection("cloud_coupons");
const couponUserCollection = db.collection("cloud_coupon_users");
const {
	getDayTime
} = require('base-common');
const model = {
	async exists(data) {
		const {
			shopid
		} = data;
		if (!shopid) {
			return false;
		}
		let t = Date.now();
		try {
			let res = await couponCollection.where({
				shopid,
				state: 1,
				beginTime: cmd.lt(t),
				endTime: cmd.gt(t)
			}).count();
			return res.total > 0;
		} catch (e) {
			//TODO handle the exception
			console.log("请添加cloud_coupons");
		}
		return false;
	},
	async list(data) {
		const {
			shopid,
			uid,
			type
		} = data;
		if (!shopid) {
			return false;
		}
		//state 1有效
		//type 1商品券，2店铺券
		let t = Date.now();
		let res = await couponCollection.where({
			shopid,
			type,
			state: 1,
			beginTime: cmd.lt(t),
			endTime: cmd.gt(t)
		}).get();
		//没有优惠券
		if (res.data.length == 0) {
			return false;
		}
		//判断是否已领取，是否能再次领取(limit)
		let myCouponsMap = await this.getMyCouponsMap({
			uid,
			shopid
		});
		res.data.forEach(coupon => {
			//已领取数量
			coupon.getAmount = myCouponsMap[coupon._id] ? myCouponsMap[coupon._id].amount : 0;
			//限制领取数量
			coupon.canGetAmount = coupon.limit - coupon.getAmount;
		});
		return res.data;
	},
	/**
	 * 领取
	 * @param {Object} data
	 */
	async takeit(data) {
		const {
			shopid,
			uid,
			_id
		} = data;
		if (!_id || !shopid) {
			return false;
		}
		let t = Date.now();
		//判断是否可用再领取
		let coupons = await this.getCouponsById(data);
		if (!coupons) {
			data.message = "优惠券不存在"
			return false;
		}
		//查询有效的优惠券
		let myCoupons = await this.getMyCouponsMap({
			_id,
			shopid,
			uid,
		});
		//可以领取
		if (!myCoupons[_id] || (coupons.limit > myCoupons[_id].amount)) {
			//优惠券是否限定可用时间
			if (coupons.days) {
				//指定天数内可用
				const {
					yestertodayTime: endTime
				} = getDayTime(coupons.days * -1);
				if (endTime < coupons.endTime) {
					coupons.endTime = endTime;
				}
			} else if (coupons.today) {
				//仅当天可用
				const {
					yestertodayTime: endTime
				} = getDayTime(-1);
				if (endTime < coupons.endTime) {
					//今天晚上的23:59:59.999
					coupons.endTime = endTime - 1;
				}
			}
			//新增领取记录
			let addRes = await couponUserCollection.add({
				...coupons,
				id: coupons._id,
				_id: undefined,
				uid,
				amount: 1,
				state: 0,
				created: Date.now()
			});
			if (addRes.inserted > 0) {
				await couponCollection.doc(_id).update({
					statistics: {
						count: cmd.inc(1)
					}
				});
			}
			return addRes;
		}
		return false;
	},
	async getCouponsById({
		shopid,
		_id
	}) {
		let t = Date.now();
		let res = await couponCollection.where({
			shopid,
			_id,
			state: 1,
			beginTime: cmd.lt(t),
			endTime: cmd.gt(t)
		}).limit(1).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data[0];
	},
	async getMyCouponsMap(data) {
		let t = Date.now();
		let coupons = await this.mine({ ...data,
			state: 0,
			beginTime: cmd.lt(t),
			endTime: cmd.gt(t)
		});
		let maps = {}
		coupons.map(coup => {
			if (!maps[coup.id]) {
				maps[coup.id] = coup;
			} else {
				//累加数量
				maps[coup.id].amount++;
			}
		});
		return maps;
	},
	/**
	 * 自己领取的优惠券
	 * @param {Object} data
	 * @param {Object} data.state 状态，0未使用，1已使用，2已过期
	 */
	async mine(data) {
		const {
			uid,
		} = data;
		if (!uid) {
			return [];
		}
		let res = await couponUserCollection.where(data).get();
		return res.data;
	},
}
module.exports = model

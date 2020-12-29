'use strict';
const db = uniCloud.database();
const cmd = db.command;
const couponCollection = db.collection("cloud_coupons");
const couponUserCollection = db.collection("cloud_coupon_users");
const {
	getDayTime
} = require('base-common');
//优惠券类型
const couponsTypes = {
	manjine: require('./type/manjine'),
	manshuliang: require('./type/manshuliang')
};
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
		//type 1商品券,2分类券,3店铺券
		let t = Date.now();
		let res = await couponCollection.where({
			shopid,
			type,
			state: 1,
			stock: cmd.gt(0),
			beginTime: cmd.lt(t),
			endTime: cmd.gt(t)
		}).orderBy("beginTime", "desc").get();
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
				} = getDayTime(coupons.days * -1 + 1);
				if (endTime < coupons.endTime) {
					coupons.endTime = endTime - 1;
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
			//区分商品和分类券
			if (coupons.type == 1) {
				delete coupons.category;
			} else if (coupons.type == 2) {
				delete coupons.goods;
			} else {
				delete coupons.category;
				delete coupons.goods;
			}
			let styles = ["manjine", "manshuliang"];
			//排除不支持的结算方式
			styles.map(st => {
				if (coupons.style != st) {
					delete coupons[st];
				}
			});

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
					stock: cmd.inc(-1),
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
	async getGoodsCouponsList(data) {
		const {
			uid,
			shopid,
			couponsId
		} = data;
		console.log("查询优惠券", couponsId)
		//一件商品只能用一张
		let t = Date.now();
		//所有商品的统计，总价，数量，分类下的总价和数量
		this.getGoodsStatics(data)
		//查询这个店铺可用的优惠券(店铺券，分类券，商品券)
		let mineCondition = {
			shopid,
			uid,
			state: 0,
			beginTime: cmd.lt(t),
			endTime: cmd.gt(t)
		};
		//查询指定的优惠券id，后面在判断的时候，优惠券也只存在一条
		if (couponsId) {
			mineCondition._id = couponsId;
		}
		let coupons = await this.mine(mineCondition);
		if (coupons.length == 0) {
			//没有优惠券
			return;
		}
		//可用优惠券
		data.coupons = [];
		//不可用优惠券
		data.couponsDisabled = [];
		//判断可用和不可用
		let isChecked = false;
		for (let cou of coupons) {
			//获得指定类型的优惠券
			let coupon = couponsTypes[cou.style];
			cou.checked = false;
			//处理符合优惠券的商品信息
			coupon.statistical(cou, data);
			//判断条件，所有优惠券只能用一张
			if (coupon.check(cou)) {
				//可用
				if (!isChecked) {
					//首次自动选择
					console.log("首次自动选择", cou._id, couponsId)
					cou.checked = true;
					isChecked = true;
					data.couponsId = cou._id;
				}
				data.coupons.push(cou);
			} else {
				//不可用
				data.couponsDisabled.push(cou);
			}
			if (cou.checked) {
				data.couponsChecked = cou;
				console.log(cou)
				if (data.submit) {
					data.totalDiscount += cou.discount;
					data.totalMoney -= cou.discount;
					let per = cou.discount / cou.totalMoney;
					//分摊优惠到各个商品
					data.goods.forEach(g => {
						if (cou.innerGoodsIds.indexOf(g._id) != -1) {
							g.discount += Number((per * g.totalMoney).toFixed(2));
						}
					});
					//console.log(JSON.stringify(data.goods))
					//更新优惠券为已使用，使用时间
					let res2 = await couponUserCollection.where({
						_id: cou._id,
						state: 0,
						uid,
						beginTime: cmd.lt(t),
						endTime: cmd.gt(t)
					}).update({
						state: 1,
						useData: {
							ids: data.goodsTotalIds,
							order: data.id,
							money: data.goodsTotalMoneyMap,
							amount: data.goodsTotalAmountMap,
							category: data.goodsTotalCategoryMap
						},
						useTime: Date.now()
					});
					if (res2.updated < 1) {
						throw new Error("优惠券使用失败");
					}
					console.log("使用优惠券成功", cou._id);
					delete data.goodsTotalIds;
					//所有商品总价统计
					delete data.goodsTotalMoney;
					delete data.goodsTotalMoneyMap;
					//所有商品数量统计
					delete data.goodsTotalAmount;
					delete data.goodsTotalAmountMap;
					//分类累加统计
					delete data.goodsTotalCategoryMap;

					delete data.coupons;
					delete data.couponsDisabled;
				}
			}

		}
	},
	/**
	 * 获得此次订单的商品统计
	 * @param {Object} data
	 */
	getGoodsStatics(data) {
		let goodsIds = [];
		//所有商品总价统计
		data.goodsTotalMoney = 0;
		data.goodsTotalMoneyMap = {};
		//所有商品数量统计
		data.goodsTotalAmount = 0;
		data.goodsTotalAmountMap = {};
		//分类累加统计
		data.goodsTotalCategoryMap = {};
		data.goods.map(g => {
			//秒杀商品不能使用优惠券
			if (!g.miaosha) {
				//多规格，合并为一条
				if (goodsIds.indexOf(g._id) == -1) {
					goodsIds.push(g._id);
					data.goodsTotalMoneyMap[g._id] = g.totalMoney;
					data.goodsTotalAmountMap[g._id] = g.amount;
				} else {
					data.goodsTotalMoneyMap[g._id] += g.totalMoney;
					data.goodsTotalAmountMap[g._id] += g.amount;
				}
				if (g.categories) {
					g.categories.map(cate => {
						if (!data.goodsTotalCategoryMap[cate.id]) {
							data.goodsTotalCategoryMap[cate.id] = {
								totalMoney: 0,
								totalAmount: 0,
								gids: []
							}
						}
						data.goodsTotalCategoryMap[cate.id].totalAmount += g.amount;
						data.goodsTotalCategoryMap[cate.id].totalMoney += g.totalMoney;
						data.goodsTotalCategoryMap[cate.id].gids.push(g._id);
					});
				}

				data.goodsTotalAmount += g.amount;
				data.goodsTotalMoney += g.totalMoney;
			}
		});
		data.goodsTotalIds = goodsIds;
	},
	/**
	 * 取消一条
	 * @param {Object} ids
	 */
	async canceled(coupons) {
		console.log("返还优惠券", coupons._id)
		await couponUserCollection.doc(coupons._id).update({
			state: 0
		});
	},
	/**
	 * 取消多条
	 * @param {Object} ids
	 */
	async canceledMany(ids) {
		console.log("返还优惠券", ids)
		await couponUserCollection.where({
			_id: cmd.in(ids)
		}).update({
			state: 0
		});
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
		//按优惠金额倒序排列
		let res = await couponUserCollection.where(data).orderBy("price", "desc").get();
		return res.data;
	},
}
module.exports = model

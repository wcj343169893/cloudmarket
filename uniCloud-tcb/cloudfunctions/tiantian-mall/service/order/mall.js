const {
	Service
} = require('uni-cloud-router')
const crypto = require('crypto');
const {
	getTodayTime,
} = require('../util');
/**
 * 商城订单处理，
 */
module.exports = class MallService extends Service {
	constructor(ctx) {
		super(ctx)
		this.collection = this.db.collection('tian-mall-orders')
		this.goodsGroupBuyingCollection = this.db.collection('opendb-mall-goods-group-buying')
	}
	/**
	 * 保存订单
	 * @param {Object} order 
	 */
	async save(order) {
		//构造订单字段
		const {
			id
		} = await this.collection.add({
			...order,
			id: await this.service.user.user.genIdentityId("tian-mall-orders", 1, 1000000),
			is_delete: 0,
			create_time: Date.now(),
			update_time: Date.now(),
		});
		return id;
	}
	/**
	 * 付款前查询支付金额
	 * @param {Object} order 
	 */
	async info(id) {
		//构造订单字段
		let {
			data
		} = await this.collection.where({
			_id: id,
			state: 0
		}).field({
			total_fee: 1, //付款总价
			discount: 1,
			goods_total_fee: 1,
			last_pay_time: 1,
			user_id: 1,
			group_buying: 1,
			goods: 1,
			body: 1,
		}).get()
		if (data.length == 0) {
			return false;
		}
		let info = data[0];
		return {
			...info,
			treasure: info.goods.filter(e => e.is_treasure).length > 0,
			title: "商城购物"
		};
	}

	/**
	 * 取消订单，只能取消自己的订单
	 * @param {Object} id
	 */
	async cancel(id, uid, next, isAdmin = false, adminUser = 0) {
		const cmd = this.db.command;
		if (!adminUser) {
			adminUser = uid;
		}
		let res = await this.collection.where({
			_id: id,
			user_id: isAdmin ? undefined : uid,
			state: isAdmin ? cmd.gte(0) : cmd.in([0, 1])
		}).update({
			state: -1,
			logs: cmd.push({
				adminUser,
				time: Date.now(),
				title: "取消订单"
			})
		});
		if (res.updated > 0) {
			//返还积分
			let {
				data
			} = await this.collection.doc(id).field({
				score: 1,
				platform: 1,
				payInfo: 1,
				total_fee: 1,
				user_id: 1,
			}).get();
			if (data.length > 0) {
				if (data[0].score) {
					await this.service.user.user.editScore(data[0].user_id, data[0].score * 1, `商城购物返还积分`, 99);
				}
				await next(data[0])
			}
		}
		return res;
	}

	/**
	 * 更新支付单号，避免重复，支付成功之后，根据此id查询订单
	 */
	async updateOutTradeNo(order) {
		return await this.collection.doc(order._id).update({
			outTradeNo: order.outTradeNo
		});
	}
	/**
	 * 付款后更新订单状态
	 * @param {Object} payinfo
	 */
	async afterPayment(payinfo, order) {
		const cmd = this.db.command;
		let saveOrder = {
			state: 1,
			payInfo: {
				time: Date.now(),
				...payinfo
			},
		}
		if (!order) {
			//payinfo.transaction_id;
			let outTradeNo = payinfo.outTradeNo;
			console.log("商城订单支付完成回调成功，更新订单信息", payinfo)
			//更新订单状态
			let data = await this.collection.where({
				outTradeNo,
				state: 0
			}).update(saveOrder);
			if (data.updated == 0) {
				console.log("订单已处理")
				return false;
			}
			console.log("订单状态更新成功");
			//保证查询最新一条订单
			let res = await this.collection.where({
				outTradeNo
			}).orderBy("create_time", "desc").limit(1).get();
			order = res.data[0];
		}

		//返积分或者返现金
		let {
			userInfo,
			inviters
		} = await this.service.user.user.getMyInviters(order.user_id);
		if (inviters) {
			//设置佣金比例
			inviters.forEach((inviter, index) => {
				inviter.state = 0; //返利状态，0未结算，1已结算
				inviter.score = 0;
				inviter.money = 0;
			})
		}
		//返利状态，0未开始，1已收货，待到账，2已到账
		saveOrder.rebate_state = 0;
		saveOrder.inviters = inviters;
		saveOrder.userInfo = userInfo;
		//更新会员权益升级，增加返佣
		await this.updateOrderRebate(order.goods, saveOrder);
		//新订单提醒
		// let isSendNewOrder = await sendNewOrder(order);
		// console.log("sendNewOrder", isSendNewOrder);
		// 打印订单
		// let isPrint = await print(order, order.shopid);
		let gb = false;
		//拼单匹配
		if (order.group_buying) {
			gb = await this.groupBuyingProcess(order, saveOrder);
		}
		saveOrder.logs = cmd.push({
			time: Date.now(),
			title: "付款完成"
		});
		//如果是虚拟商品，生成账号密码
		await this.generateNumber(order.goods, saveOrder, order)

		//更新订单信息
		await this.collection.doc(order._id).update(saveOrder);
		console.log("更新订单完成")
		await this.service.mall.goods.updateGoodsDaySales(order.goods)
		//更新商品销量
		await this.service.mall.goods.updateGoodsSkuSales(order.goods)
		console.log("更新商品销量完成")
		if (gb) {
			await this.groupBuyingProcessCallback(saveOrder.group_buying.group_buying_id, gb);
		}
		//发送公众号通知店主
		await this.service.weixin.message.new_order.send({
			order_id: order._id,
			order: {
				...order,
				...saveOrder
			}
		})
		return order;
	}
	async generateNumber(goods, saveOrder, order) {
		if (goods) {
			let pickUpCode = []
			goods.map(e => {
				if (!e.is_real) {
					//默认有效期90天
					let offline_time = Date.now() + 3600 * 24 * 1000 * 90
					if (!e.offline_time && offline_time > e.offline_time) {
						offline_time = e.offline_time;
					}
					for (let i = 0; i < e.amount; i++) {
						pickUpCode.push({
							isUse: false,
							shop_id: e.shop_id, //店铺编号
							_id: e.goods_id,
							name: e.name,
							sku_name: e.sku_name,
							endTime: offline_time, //号码有效期
							account: this.getRandomNumber(12),
							password: this.getRandomNumber(6),
						})
					}
				}
			})
			if (pickUpCode.length > 0) {
				saveOrder.pickUpCode = pickUpCode;
				//自动发货
				saveOrder.state = 2;
				//发送短信个客户
				await this.service.sms.tuangou_code.send({
					order_id: order._id,
					order: {
						...order,
						...saveOrder
					}
				})
			}
		}
	}
	getRandomNumber(leng = 8) {
		let first = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		return first[Math.floor(Math.random() * first.length)] + (Math.random() + "").substr(2, leng - 1)
	}

	/**
	 * 订单退款
	 * @param {Object} order
	 */
	async refund(order) {}
	/**
	 * 查询所有退款订单
	 */
	async getRefundOrders() {
		console.log("查询退款订单")
		return []
	}
	/**
	 * 单个订单退款成功
	 * @param {Object} order
	 */
	async refundSuccess(order) {}


	/**
	 * 订单支付完成后，处理会员权益商品，并增加返佣
	 * @param {Object} goods
	 * @param {Object} saveOrder
	 */
	async updateOrderRebate(goods, saveOrder) {
		console.log("updateOrderRebate")
		saveOrder.today = getTodayTime(0, true);
		//订单返利列表
		saveOrder.rebates = [];
		//判断当前是否已经是会员权益用户
		if (!saveOrder.userInfo.members) {
			saveOrder.userInfo.members = []
		}
		let {
			rebate_money_rate,
			rebate_score_rate,
		} = this.ctx.getConfigs.config("mall.order");
		let rebate_pension_dividends = 0,
			rebate_score_dividends = 0;
		for (let g of goods) {
			//礼包商品，
			if (g.vip_level_id && g.get_service_month) {
				if (!saveOrder.userInfo.levels) {
					//获取用户的等级验证
					await this.service.user.level.getAllLevel(saveOrder.userInfo);
				}
				let levels = []
				//验证用户是否能享受礼包服务
				if (saveOrder.userInfo.levels) {
					levels = saveOrder.userInfo.levels.filter(e => e.passed && e._id == g
						.vip_level_id);
				}
				if (levels.length > 0) {
					let level = {};
					let memberIndex = saveOrder.userInfo.members.findIndex(e => e.id == g.vip_level_id);
					let day = new Date();
					day.setHours(23);
					day.setMinutes(59);
					day.setSeconds(59);
					day.setMilliseconds(999);
					day.setMonth(day.getMonth() + g.get_service_month * 1 * g.amount)
					if (memberIndex == -1) {
						level = {
							id: g.vip_level_id,
							name: levels[0].name,
							beginTime: Date.now(),
							endTime: day.getTime()
						}
					} else {
						//存在旧的信息
						level = saveOrder.userInfo.members[memberIndex];
						if (level.endTime > Date.now()) {
							day = new Date(level.endTime);
							day.setMonth(day.getMonth() + g.get_service_month * 1 * g.amount)
						}
						level.name = levels[0].name;
						level.endTime = day.getTime();
						//删除原数据
						saveOrder.userInfo.members.splice(memberIndex, 1)
					}
					saveOrder.userInfo.members.push(level);
				} else {
					console.log("不满足会员升级条件");
				}
			}
			let rateMoney = rebate_money_rate,
				rateScore = rebate_score_rate;
			//上级邀请者返现金或者积分
			if (g.rebate_money_rate) {
				rateMoney = g.rebate_money_rate.split(",");
				if (rateMoney.length > 0 && saveOrder.inviters && saveOrder.inviters.length > 0) {
					//设置佣金比例
					saveOrder.inviters.forEach((inviter, index) => {
						//必须保证是正数
						if (rateMoney[index] && rateMoney[index] > 0) {
							//佣金比例*订单中商品总金额（默认全部参与分成），单位分，金额有可能是0，在处理转账的时候，过滤掉
							inviter.money += parseInt(this.getAmountByRate(g.total, g.amount, rateMoney[
								index]));
						}
					})
				}
				console.log("上级返现金")
			}
			//返上级积分
			if (g.rebate_score_rate) {
				rateScore = g.rebate_score_rate.split(",");
				if (rateScore.length > 0 && saveOrder.inviters && saveOrder.inviters.length > 0) {
					//设置佣金比例
					saveOrder.inviters.forEach((inviter, index) => {
						//返佣积分
						if (rateScore[index] && rateScore[index] > 0) {
							//积分允许是小数
							inviter.score += this.getAmountByRate(g.total, g.amount, rateScore[index]);
						}
					})
				}
				console.log("上级返积分")
			}
			//2级服务商
			if (g.rebate_service) {
				let serviceRates = g.rebate_service.split(",");
				let serviceMoney = serviceRates.map(rate => {
					//大于1，表示返现金，单位为分;小于等于1，表示返商品金额比例，范围0.01~1
					return this.getAmountByRate(g.total, g.amount, rate);
				})
				saveOrder.inviters.forEach(inviter => {
					if (inviter.isMember && serviceRates[inviter.serviceIndex] && serviceMoney[inviter
							.serviceIndex]) {
						//服务商返利
						inviter.money += serviceMoney[inviter.serviceIndex];
					}
				});
				console.log("服务商返利")
			}
			//自己返利rebate_self_money
			if (g.rebate_self_money) {
				if (!saveOrder.rebate_self_money) {
					saveOrder.rebate_self_money = 0;
				}
				saveOrder.rebate_self_money += this.getAmountByRate(g.total, g.amount, g.rebate_self_money);
				console.log("购买者返利")
			}
			//养老积分池
			if (g.rebate_pension_dividends) {
				rebate_pension_dividends += this.getAmountByRate(g.total, g.amount, g.rebate_pension_dividends);
			}
			//共享积分池
			if (g.rebate_score_dividends) {
				rebate_score_dividends += this.getAmountByRate(g.total, g.amount, g.rebate_score_dividends);
			}
		}
		//保存用户的member信息
		if (saveOrder.userInfo.members.length > 0) {
			await this.service.user.user.save(saveOrder.userInfo._id, {
				members: saveOrder.userInfo.members
			})
			console.log("会员续期处理完成")
		}
		//养老积分池，每日养老金
		if (rebate_pension_dividends > 0) {
			saveOrder.rebate_pension_dividends = rebate_pension_dividends;
			saveOrder.rebates.push({
				type: "pension_money",
				amount: rebate_pension_dividends
			})
			console.log("每日养老金处理完成")
		}
		//共享积分池
		if (rebate_score_dividends > 0) {
			saveOrder.rebate_score_dividends = rebate_score_dividends;
			saveOrder.rebates.push({
				type: "bonus_money",
				amount: rebate_score_dividends
			})
			console.log("共享积分池处理完成")
		}
		//本人返利
		if (saveOrder.rebate_self_money) {
			saveOrder.rebates.push({
				type: "user",
				title: "本人返利",
				id: saveOrder.userInfo._id,
				money: saveOrder.rebate_self_money
			})
		}
		//推荐人返利
		saveOrder.inviters.map(invite => {
			if (invite.money > 0 || invite.score > 0) {
				saveOrder.rebates.push({
					type: "user",
					id: invite._id,
					title: "推荐返利",
					score: invite.score,
					money: invite.money
				})
			}
		});
	}

	getAmountByRate(total, amount, rate) {
		//大于1，表示返现金，单位为分;小于等于1，表示返商品金额比例，范围0.01~1
		if (rate > 1) {
			return amount * rate;
		}
		//单位是分
		return parseInt(total * rate);
	}

	async groupBuyingProcess(order, saveOrder) {
		let gb = order.group_buying;
		if (gb.group_buying_id) {
			//查找原来的拼单
			let {
				data
			} = await this.goodsGroupBuyingCollection.where({
				goods_id: gb.goods_id,
				group_id: gb.group_buying_id,
				state: 1
			}).orderBy("group_id", "asc").limit(100).get();
			if (data.length > 0 && data.length < gb.group_buying) {
				//新增一条同样的，多人拼一条
				let joined = data.map(e => e.user_id);
				joined.push(order.user_id);
				let {
					id
				} = await this.addNewGroupBuying(gb, order, saveOrder, gb.group_buying_id, joined);
				saveOrder.group_buying.joined = joined;
				if (data.length >= gb.group_buying - 1) {
					//最后一个人来拼单了，删除数据，原子性
					let {
						updated
					} = await this.goodsGroupBuyingCollection.where({
						goods_id: gb.goods_id,
						group_id: gb.group_buying_id,
						state: 1
					}).update({
						state: 2
					});
					//state:1拼单中，2拼单成功，3拼单失败，
					//@todo 发送拼单成功通知
					//可能已经被别人修改，修改分组id，自己跟单，也算成功了
					if (updated == gb.group_buying) {
						//这里的逻辑，会造成拼单人员大于设定的数量
						//恭喜，拼单成功，后台可以开始发货，需要增加索引
						//这里是回调后，更新所有拼单人信息，拉平信息
						return {
							group_buying: {
								finish_time: Date.now(), //完成时间
								state: 2,
								joined
							}
						};
					}
					//相当于新增
					saveOrder.group_buying.group_buying_id = order._id;
					//更新自己的分组id
					await this.goodsGroupBuyingCollection.doc(id).update({
						group_id: order._id,
						state: 1,
					})
				}
				return;
			}
		}
		//纯粹的新增
		await this.addNewGroupBuying(gb, order, saveOrder);
	}

	async addNewGroupBuying(gb, order, saveOrder, group_id, joined) {
		if (!group_id) {
			group_id = order._id;
		}
		let res = await this.goodsGroupBuyingCollection.add({
			goods_id: gb.goods_id,
			order_id: order._id,
			group_id,
			state: 1,
			user_id: order.user_id,
			joined: joined ? joined : [order.user_id],
			create_time: Date.now(),
			end_time: Date.now() + 3600 * 24 * 1000 //24小时
		})
		saveOrder.group_buying = {
			group_buying_id: group_id,
			state: 1,
			joined: joined ? joined : [order.user_id]
		};
		return res;
	}

	async groupBuyingProcessCallback(group_buying_id, data) {
		await this.collection.where({
			"group_buying.group_buying_id": group_buying_id
		}).update(data)
	}
}

const {
	Service
} = require('uni-cloud-router')
const {
	getTodayTime,
} = require('../util');
//全局变量，所有人都可以使用
let inviterMap = {};
module.exports = class UserService extends Service {
	constructor(ctx) {
		super(ctx)
		this.usersTable = 'uni-id-users';
		this.balanceTable = 'uni-id-balances';
		this.cashoutTable = 'tian-user-cashouts';
		this.collection = this.db.collection('uni-id-users')
		this.scoreCollection = this.db.collection('uni-id-scores')
		this.balanceCollection = this.db.collection('uni-id-balances')
		this.identityCollection = this.db.collection('tian-identity')
		this.cashoutsCollection = this.db.collection('tian-user-cashouts')
		this.signinDays = 30;
	}
	async addUser(info) {
		return this.collection.add(info)
	}
	/**
	 * 更新用户为未关注公众号
	 * @param {Object} openid
	 * @param {Object} appid
	 * @param {Object} dcloud_appid
	 * @param {Object} data
	 */
	async updateByOpenid(openid, appid, dcloud_appid, data) {
		return this.collection.where({
			wx_openid: {
				[appid]: openid,
			},
			dcloud_appid: dcloud_appid
		}).update(data)
	}
	/**
	 * 根据微信的unionid查询用户
	 * @param {Object} wx_unionid
	 * @param {Object} appid
	 */
	async getUserInfoByUnionid(wx_unionid, dcloud_appid) {
		const {
			data
		} = await this.collection.where({
			wx_unionid: wx_unionid,
			dcloud_appid: dcloud_appid
		}).limit(1).get()
		if (data.length > 0) {
			return data[0]
		}
		return false;
	}
	async getUserInfoByWxOpenid(openid, appid, dcloud_appid) {
		const {
			data
		} = await this.collection.where({
			[`wx_openid.${appid}`]: openid,
			dcloud_appid: dcloud_appid
		}).limit(1).get()
		if (data.length > 0) {
			return data[0]
		}
		return false;
	}
	/**
	 * 验证token是否有效
	 */
	async checkToken(token, needUserInfo = false) {
		if (!token) {
			return {}
		}
		const auth = await this.ctx.uniID.checkToken(token, {
			needPermission: true,
			needUserInfo
		})
		// console.log("check token", token, needUserInfo)
		if (auth.code) {
			// 校验失败，抛出错误信息
			return {};
		}
		auth.todayTime = getTodayTime(0, true);
		this.ctx.auth = auth // 设置当前请求的 auth 对象
	}

	async getCurrentUserInfo(field = []) {
		//最基础几个字段，防止后面没有值
		let defConfig = {
			balance: 0,
			score: 0,
			coupon: 0,
			// member: {}
		}
		if (!this.ctx.auth) {
			return {}
		}
		let info = await this.ctx.uniID.getUserInfo({
			uid: this.ctx.auth.uid,
			field
		})
		if (info.code == 0) {
			return {
				...defConfig,
				...info.userInfo
			};
		}
		return {}
	}

	// 登录记录
	async loginLog(res = {}, params, type = 'login') {
		const now = Date.now()
		const uniIdLogCollection = this.db.collection('uni-id-log')
		let logData = {
			deviceId: params.deviceId || this.ctx.DEVICEID,
			ip: params.ip || this.ctx.CLIENTIP,
			type,
			create_date: now
		};

		Object.assign(logData,
			res.code === 0 ? {
				user_id: res.uid,
				state: 1
			} : {
				state: 0
			})

		return uniIdLogCollection.add(logData)
	}
	/**
	 * 根据渠道号，查询渠道用户信息，包含openid，在使用到的地方，需要增加字段，再修改此方法
	 * @param {Object} code
	 */
	async getChannelUserByCode(code, fields = []) {
		if (!fields) {
			fields = []
		}
		if (!code) {
			return false
		}
		return this.ctx.memorycache("channel_user_" + [code].concat(fields).join("_"), null, 3600, async () => {
			let {
				data
			} = await this.db.collection("uni-id-channel").where({
				id: `${code}`
			}).field({
				rebate_money_rate: 1,
				user_id: 1
			}).get();
			if (data.length > 0) {
				let channel_uid = data[0].user_id;
				if (channel_uid) {
					let user = await this.getInfoById(channel_uid, [
						...fields,
						"nickname", "mobile", "avatar", "wx_openid", "id", "channel_code"
					])
					//渠道返利到零钱，自行提现
					return {
						...user,
						rebate_money_rate: data[0].rebate_money_rate ? data[0].rebate_money_rate : 0
					}
				}
			}
			return false;
		});
	}
	async setPush(uid, data) {
		return await this.ctx.uniID.updateUser({
			uid: uid,
			push: data,
			update_time: Date.now()
		});
	}

	/**
	 * 邀请码设置邀请关系
	 * @param {Object} uid
	 * @param {Object} inviteCode
	 */
	async setInviteByCode(uid, inviteCode) {
		return await this.ctx.uniID.acceptInvite({
			uid,
			inviteCode
		});
	}
	/**
	 * 设置邀请
	 * @param {Object} uid
	 * @param {Object} mobile
	 */
	async setInviteUidByMobile(uid, mobile) {
		const cmd = this.db.command;
		let inviter = inviterMap[mobile];
		if (!inviter) {
			//根据手机号，查询邀请者的邀请码
			let par = await this.collection.where({
				mobile,
			}).field({
				inviter_uid: 1,
				_id: 1
			}).limit(1).get();
			if (par.data.length == 0 || !par.data[0].inviter_uid) {
				return {
					code: -1,
					message: "邀请码无效"
				}
			}
			//写入到全局，方便下次直接使用
			inviterMap[mobile] = inviter = par.data[0];
		}
		//邀请人uid，按层级从下往上排列的uid数组，即第一个是直接上级
		//邀请者的上级,这里强制限制只能存在2级邀请,inviter_uid数组，存在1-2个id
		let myInviters = [inviter._id];
		if (inviter.inviter_uid && inviter.inviter_uid.length > 0) {
			myInviters.push(inviter.inviter_uid[0])
		}
		let res = await this.collection.doc(uid).update({
			inviter_uid: myInviters,
			invite_time: Date.now(),
			update_time: Date.now()
		})
		return {
			code: 0,
			message: "绑定成功"
		};
	}
	/**
	 * 查询我的团队信息
	 * @param {Object} uid
	 */
	async getInviteInfo(uid) {
		const cmd = this.db.command;
		let info = await this.collection.where({
			_id: uid
		}).field({
			inviter_uid: 1, //邀请者列表
			teamSignin: 1, //我的团队日签到统计
			signin: 1,
			score_log: 1,
			statistics: 1
		}).get();
		if (info.data.length == 0 || !info.data[0].inviter_uid || info.data[0].inviter_uid.length == 0) {
			return false;
		}
		info = info.data[0];
		//所有上级，通过二维码邀请，可以看到多级邀请者,这里只取2级
		let inviter_uid = info.inviter_uid;
		//除去重复的邀请人
		if (inviter_uid && inviter_uid.length > 1) {
			let extIds = [];
			inviter_uid.map(id => {
				if (extIds.indexOf(id) == -1) {
					extIds.push(id);
				}
			})
			inviter_uid = extIds;
		}
		let inviters = inviter_uid;
		//直接上级(第一个用户)
		let last_invite = inviters[0];
		inviters = await this.getMyInviterById(inviters);

		let today = getTodayTime(0, 1);
		let before30day = getTodayTime(this.signinDays * -1, 1);
		//直接推荐
		let zhiRes = await this.collection.where({
			"inviter_uid.0": uid
		}).count()
		//间接推荐
		let jianRes = await this.collection.where({
			"inviter_uid.1": uid
		}).count()
		let todayRate = "0.00";
		let monthRate = "0.00";
		let total = zhiRes.total + jianRes.total;
		//今日邀请
		let todayRes = await this.collection.where({
			inviter_uid: uid,
			invite_time: cmd.gt(today)
		}).count();
		let todayZhiRes = await this.collection.where({
			"inviter_uid.0": uid,
			invite_time: cmd.gt(today)
		}).count();
		//昨日邀请
		let yestodayRes = await this.collection.where({
			inviter_uid: uid,
			invite_time: cmd.gt(getTodayTime(-1, 1)).and(cmd.lt(today)),
		}).count();
		let yestodayZhiRes = await this.collection.where({
			"inviter_uid.0": uid,
			invite_time: cmd.gt(getTodayTime(-1, 1)).and(cmd.lt(today)),
		}).count();
		//近7日邀请
		let weekRes = await this.collection.where({
			inviter_uid: uid,
			invite_time: cmd.gt(getTodayTime(-7, 1))
		}).count();
		let weekZhiRes = await this.collection.where({
			"inviter_uid.0": uid,
			invite_time: cmd.gt(getTodayTime(-7, 1))
		}).count();
		//近30日邀请
		let monthRes = await this.collection.where({
			inviter_uid: uid,
			invite_time: cmd.gt(before30day)
		}).count();
		let monthZhiRes = await this.collection.where({
			"inviter_uid.0": uid,
			invite_time: cmd.gt(before30day)
		}).count();
		this.build30DaysRate(info, today, before30day, getTodayTime(-1, 1), getTodayTime(-7, 1));
		if (total > 0) {
			//计算今日签到率
			if (info.teamSignin && info.teamSignin[today]) {
				todayRate = (info.teamSignin[today] / total * 100).toFixed(2);
			}
			info.statistics = {
				invite_all_total: total, //总的邀请人数
				invite_total: zhiRes.total, //直推人数
				today_rate: todayRate, //今日签到率

				today_total: todayRes.total,
				yestoday_total: yestodayRes.total,
				week_total: weekRes.total,
				month_total: monthRes.total,

				today_zhi_total: todayZhiRes.total,
				yestoday_zhi_total: yestodayZhiRes.total,
				week_zhi_total: weekZhiRes.total,
				month_zhi_total: monthZhiRes.total,

				today,
				month: before30day
			};
			//临时存一下，方便上级统计
			await this.collection.doc(uid).update({
				statistics: info.statistics
			})
		}
		return {
			...info,
			legend: {
				todaySignRate: "今日签到率",
				todaySign: "今日签到",
				monthSignRate: "近30日签到率"
			},
			last_invite,
			todayRate,
			monthRate,
			total: total,
			zhijie: zhiRes.total,
			todayTotal: todayRes.total,
			monthTotal: monthRes.total,
			inviters
		}
	}

	/**
	 * 分页获取接受邀请的用户清单
	 * @param {Object} uid
	 * @param {string} time today|yestoday|week|month
	 * @param {Object} level 0所有，1第一级，2第二级
	 * @param {Object} page
	 * @param {Object} limit
	 */
	async getInviteUser(uid, time, level, page, limit, config) {
		let condition = {};
		if (time) {
			condition = this.getTimeCondition(time)
		}
		const cmd = this.db.command;
		if (level > 0) {
			condition["inviter_uid." + (level - 1)] = uid;
		} else {
			//所有下级
			condition["inviter_uid"] = uid;
		}

		//signin ,只保留最近40条记录的日期列表
		let {
			data
		} = await this.collection.where(condition).field({
			invite_time: 1,
			nickname: 1,
			signin: 1,
			mobile: 1,
			avatar: 1,
			score_log: 1,
			statistics: 1,
		}).orderBy("statistics.invite_all_total", "desc").skip((page - 1) * limit).limit(limit).get();
		//计算签到率,当天是否签到
		let today = getTodayTime(0, 1);
		let before30day = getTodayTime(this.signinDays * -1, 1);
		data.forEach(usr => {
			this.build30DaysRate(usr, today, before30day);
		})
		return data;
	}

	getTimeCondition(t) {
		let today = getTodayTime(0, 1)
		const cmd = this.db.command;
		let days = {
			today: {
				invite_time: cmd.gt(today)
			},
			yestoday: {
				invite_time: cmd.gt(getTodayTime(-1, 1)).and(cmd.lt(today))
			},
			week: {
				invite_time: cmd.gt(getTodayTime(-7, 1))
			},
			month: {
				invite_time: cmd.gt(getTodayTime(-30, 1))
			}
		}
		return days[t]
	}

	build30DaysRate(usr, today, before30day, yestoday, weekday) {
		if (!usr.signin) {
			usr.signin = [];
		}
		//今日签到
		usr.todaySignin = usr.signin.indexOf(today) != -1;
		//提取签到有效时间
		usr.signin = usr.signin.filter(t => t > before30day);
		//签到比例
		usr.signinRate = parseInt(usr.signin.length / this.signinDays * 10000) / 100;
		usr.signinLength = usr.signin.length;
		delete usr.signin;

		//score_log,积分获得情况
		usr.scores = {
			today: 0,
			yestoday: 0,
			week: 0,
			month: 0,
		};
		if (usr.score_log) {
			usr.scores.today = usr.score_log[today] ? usr.score_log[today] : 0
			if (yestoday) {
				usr.scores.yestoday = usr.score_log[yestoday] ? usr.score_log[yestoday] : 0
			}
			if (weekday) {
				for (let key in usr.score_log) {
					if (key >= weekday) {
						usr.scores.week += usr.score_log[key];
					}
				}
			}
			for (let key in usr.score_log) {
				if (key >= before30day) {
					usr.scores.month += usr.score_log[key];
				}
			}
		}
	}
	async editScoreCashout(uid, {
		money,
		day,
		amount
	}) {
		const cmd = this.db.command;
		return await this.collection.doc(uid).update({
			score_cashout: {
				day,
				money: cmd.inc(money),
				amount: cmd.inc(amount)
			}
		});
	}
	async update(uid, data, pushData) {
		const cmd = this.db.command;
		if (pushData) {
			for (let key in pushData) {
				data[key] = cmd.push(pushData[key])
			}
		}
		return this.collection.doc(uid).update(data);
	}
	async edit(uid, data, filter = []) {
		let save_data = {
			update_time: Date.now()
		}
		if (filter.length > 0) {
			//过滤data
			for (let key in data) {
				if (filter.indexOf(key) != -1) {
					save_data[key] = data[key]
				}
			}
		} else {
			save_data = data;
		}
		return await this.ctx.uniID.updateUser({
			uid,
			...save_data
		})
	}

	async deleteUser(uid) {
		return await this.collection.doc(uid).remove();
	}

	/**
	 * 更新用户积分，以及积分日志
	 */
	async editScore(uid, amount, comment, level = 0, log = {}) {
		if (amount == 0) {
			//0积分，不做任何操作
			return 0;
		}
		let today = getTodayTime(0, 1);
		const cmd = this.db.command;
		let updateData = {
			score: cmd.inc(amount),
			// update_time: Date.now()
		};
		let condition = {
			_id: uid
		}
		if (amount > 0) {
			//当日获得积分总计
			updateData["score_log"] = {
				[today]: cmd.inc(amount)
			}
		} else {
			//永远是负数
			updateData["score_consume_log"] = {
				[today]: cmd.inc(amount)
			}
			condition["score"] = cmd.gte(amount * -1);
		}
		let {
			updated
		} = await this.collection.where(condition).update(updateData);
		if (!updated) {
			console.log("增加用户积分，可惜用户不存在1")
			return 0;
		}
		//查询出最后的积分
		let {
			data
		} = await this.collection.doc(uid).field({
			score: 1,
			nickname: 1,
			avatar: 1,
			my_invite_code: 1,
			mobile: 1,
			inviter_uid: 1
		}).get();
		if (data.length == 0) {
			console.log("增加用户积分，可惜用户不存在")
			return 0;
		}
		let info = data[0];
		let balance = info.score;
		await this.scoreCollection.add({
			user_id: uid,
			user: info, //冗余存储，避免后台关联查询
			log, //冗余存储，增加积分的来源信息
			score: amount,
			type: amount > 0 ? 1 : 2,
			balance,
			comment,
			create_date: Date.now()
		})

		let {
			reward_level,
			reward_rates
		} = this.ctx.getConfigs.config("user.score");
		let reward = 0;
		console.log("editScore", level, reward_level,
			reward_rates)
		//直推邀请人获得奖励
		if (amount > 0 && level < reward_level && info.inviter_uid && info.inviter_uid.length > 0 &&
			reward_rates.length >
			0) {
			let parentAmount = reward_rates[level] * amount;
			if (level == 0) {
				let nickname = info.nickname ? info.nickname : "好友"
				comment = `${nickname}${comment}奖励`
			}
			level++;
			let rewardData = await this.editScore(info.inviter_uid[0], parentAmount, comment, level, log);
			if (rewardData) {
				reward = rewardData.score;
			}
		}
		return {
			score: amount + reward,
			balance
		};
	}

	async getScoreLogByTaskLogId(id) {
		let {
			data
		} = await this.scoreCollection.where({
			"log.task._id": id
		}).limit(1).get();
		if (data.length == 0) {
			return false;
		}
		return data[0]
	}

	/**
	 * 记录当前用户的签到记录，最近30天
	 * @param {Object} uid
	 */
	async editSignin(uid) {
		let today = getTodayTime(0, 1);
		const cmd = this.db.command;
		//更新自己的签到数据
		await this.collection.doc(uid).update({
			signin: cmd.push({
				each: [today],
				slice: -30,
			}),
			update_time: Date.now()
		})
		//更新团队的签到统计 实时查询邀请者，缓存中的邀请信息，很有可能不准确
		let info = await this.getCurrentUserInfo(["inviter_uid"]);
		if (info.inviter_uid) {
			//更新团队统计，多余数据，另外开定时器，每天清理
			await this.collection.where({
				_id: cmd.in(info.inviter_uid)
			}).update({
				teamSignin: {
					[today]: cmd.inc(1)
				}
			})
		}
	}


	/**
	 * 修改余额 
	 * @param {Object} uid
	 * @param {Object} amount
	 * @param {Object} comment
	 */
	async editBalance(uid, amount, comment, level = 0, log = {}, callback = false) {
		console.log("开始editBalance");
		const cmd = this.db.command;
		//开启事务，保证扣除余额与日志一致
		const transaction = await this.db.startTransaction();
		try {
			//2021-11-04腾讯云不支持事务中使用updateAndReturn
			/* let {
				updated,
				doc: info
			} = await transaction.collection(this.usersTable).doc(uid).updateAndReturn({
				balance: cmd.inc(amount)
			}); */
			let {
				updated
			} = await transaction.collection(this.usersTable).doc(uid).update({
				balance: cmd.inc(amount)
			});
			//2021-11-04事务中doc查询返回data是对象，普通云函数doc查询返回的data是数组
			let {
				data: info
			} = await transaction.collection(this.usersTable).doc(uid).get();
			// console.log("userData", info)
			let balance = info.balance;
			//减少余额
			if (amount < 0 && balance < 0) {
				console.log("余额不足")
				await transaction.rollback(-100);
				return {
					code: -1,
					message: "余额不足"
				};
			}
			console.log("支付后余额", balance)
			let {
				id
			} = await transaction.collection(this.balanceTable).add({
				user_id: uid,
				amount: amount,
				type: amount > 0 ? 1 : 2,
				balance,
				comment,
				log, //冗余存储，来源信息
				create_date: Date.now()
			})
			console.log("结束扣款");
			let payInfo = {
				code: 0,
				balance,
				userInfo: {
					_id: info._id,
					balance: info.balance,
					avatar: info.avatar,
					nickname: info.nickname,
				},
				transaction_id: id, //交易单号
			}
			if (callback) {
				//如果存在中途回调，必须有返回值
				let cResult = await callback(transaction, payInfo);
				if (!cResult) {
					await transaction.rollback(-100);
					return {
						code: -1,
						message: "处理失败"
					};
				}
			}
			console.log("结束editBalance1");
			await transaction.commit();
			console.log("结束editBalance2");
			return payInfo;
		} catch (e) {
			try {
				console.log(e);
				await transaction.rollback(-100);
			} catch (e2) {
				console.log("回滚事务失败");
				console.log(e2);
			}
			return {
				code: -1,
				message: "系统错误"
			};
		}
	}

	async getInviterInfoByMobiles(mobiles) {
		const cmd = this.db.command;
		const {
			data
		} = await this.collection.where({
			mobile: cmd.in(mobiles)
		}).field({
			mobile,
			inviter_uid: 1
		});
		return data;
	}


	/**
	 * 生成唯一id
	 * @param {Object} key
	 * @param {Int} inc 递增数字,默认1
	 * @param {Int} start 开始号码
	 */
	async genIdentityId(key, inc, start = 10000) {
		const cmd = this.db.command;
		//生成用户id----开始-----
		inc = inc ? +inc : 1;
		let res = await this.identityCollection.where({
			key
		}).updateAndReturn({
			value: cmd.inc(inc)
		});
		if (res.updated == 0) {
			let value = start;
			await this.identityCollection.add({
				key,
				value
			});
			return value;
		}
		//立马查询出来，可能值是对的
		/* let res2 = await this.identityCollection.where({
			key
		}).field({
			value: 1
		}).limit(1).get();
		return res2.data[0].value; */
		//生成用户id----结束-----
		return res.doc.value;

	}

	/**
	 * 检测邀请码是否有效，否则重新生成
	 * @param {Object} data
	 */
	async updateUserMyInviteCode(data) {
		let uid = data.uid ? data.uid : data._id;
		if (!uid) {
			return false;
		}
		if (!data.my_invite_code || data.my_invite_code == data.mobile) {
			//重新生成邀请码
			let my_invite_code = await this.genIdentityId("uni-id-users", 1);
			data.my_invite_code = my_invite_code;
			await this.ctx.uniID.updateUser({
				uid: uid,
				my_invite_code: `${my_invite_code}`
			});
		}
	}

	async getInfoById(id, fields = []) {
		let field = {}
		if (fields.length == 0) {
			fields = ["nickname", "mobile", "avatar"];
		}
		for (let s of fields) {
			field[s] = 1;
		}
		let {
			data
		} = await this.collection.doc(id).field(field).get();
		if (data.length == 0) {
			console.log("用户信息不存在", id)
			return false;
		}
		return data[0];
	}

	/**
	 * 根据用户id，查询邀请信息
	 * @param {Object} id
	 */
	async getMyInviters(id) {
		// 2022-01-01，增加推广渠道信息
		let userInfo = await this.getInfoById(id, ["nickname", "mobile", "avatar", "inviter_uid",
			"channel_code"
		]);
		if (!userInfo) {
			return {
				userInfo: {},
				inviters: [],
				channel: {}
			};
		}
		let inviters = await this.getMyInviterById(userInfo.inviter_uid);
		let channel = {};
		if (userInfo.channel_code) {
			channel = await this.getChannelUserByCode(userInfo.channel_code)
		}
		//设置佣金比例
		inviters.forEach((inviter, index) => {
			inviter.state = 0; //返利状态，0未结算，1已结算
			inviter.score = 0;
			inviter.money = 0;
		})
		return {
			userInfo,
			inviters,
			channel
		}
	}

	async getMyInviterById(inviters) {
		if (!inviters || inviters.length == 0) {
			return [];
		}
		//系统邀请码
		let sysCode = this.ctx.getConfigs.config("user.inviteCode");
		//邀请者称呼
		let inviterCall = this.ctx.getConfigs.config("user.inviter_call");
		const cmd = this.db.command;
		//先邀请的，肯定在最上面
		let {
			data: inviterData
		} = await this.collection.where({
			_id: cmd.in(inviters),
			my_invite_code: cmd.nin(sysCode)
		}).field({
			avatar: 1,
			nickname: 1,
			mobile: 1,
			invite_time: 1
		}).get();
		//按照id，来显示
		let usrMap = {}
		if (inviterData.length > 0) {
			inviterData.map(usr => {
				usrMap[usr._id] = usr;
			})
		}
		return inviters.map((id, index) => {
			//限制输出的邀请层级
			if (usrMap[id] && inviterCall[index]) {
				return {
					...usrMap[id],
					callname: inviterCall[index]
				}
			}
			return false;
		}).filter(e => e);
	}

	/**
	 * 根据手机号查询用户
	 * @param {Object} mobile
	 * @param {Array} fields
	 */
	async getInfoByMobile(mobile, fields = []) {
		let field = {
			dcloud_appid: 1
		}
		if (fields.length == 0) {
			fields = ["nickname", "mobile", "avatar"];
		}
		for (let s of fields) {
			field[s] = 1;
		}
		let {
			data
		} = await this.collection.where({
			mobile: `${mobile}`,
		}).field(field).limit(1).get();
		data = this.getCurrentAppUser(data);
		if (data.length == 0) {
			console.log("用户信息不存在", mobile)
			return false;
		}
		return data[0];
	}

	getCurrentAppUser(userList) {
		const dcloudAppid = this.ctx.context.APPID
		return userList.filter(item => {
			// 空数组不允许登录
			return item.dcloud_appid === undefined || item.dcloud_appid === null || item.dcloud_appid
				.indexOf(dcloudAppid) > -1
		})
	}

	async getMobileWithWxCrypt(data) {
		return await this.ctx.uniID.wxBizDataCrypt(data);
	}

	async bindMobileWithWxCrypt(data, uid) {
		let res = await this.ctx.uniID.wxBizDataCrypt(data)
		console.log(res)
		if (res.code == 0) {
			//判断系统里面是否已经存在手机号，需要合并手机号
			let mobile = res.phoneNumber;
			let {
				data: infoData
			} = await this.collection.where({
				mobile,
			}).field({
				inviter_uid: 1,
				wx_openid: 1,
				avatar: 1,
				gender: 1,
				nickname: 1,
			}).limit(1).get();
			if (infoData.length == 0) {
				//解密成功，更新手机号
				return await this.ctx.uniID.updateUser({
					uid,
					mobile_confirmed: 1,
					mobile
				})
			} else if (infoData[0]._id == uid) {
				return res;
			} else {
				let userInfo = infoData[0];
				let platform = this.ctx.context.PLATFORM;
				if (userInfo.wx_openid && userInfo.wx_openid[platform]) {
					//此手机号已经绑定微信
					return {
						code: -1,
						message: "此手机号已绑定其他微信"
					}
				}
				//@todo 合并账户

			}
		}
		return res;
	}

	/**
	 * 用户绑定微信
	 * @param {Object} code
	 * @param {Object} uid
	 */
	async bindWeixinByCode(code, uid) {
		console.log("bindWeixinByCode code:", code, uid)
		const res = await this.ctx.uniID.bindWeixin({
			uid: uid,
			code: code
		})
		console.log("bindWeixinByCode", res)
		return res;
	}
	async bindWeixinByInfo(info, uid) {
		console.log("bindWeixinByInfo:", info, uid)
		//一个微信允许绑定多个账户，但是一个用户只能绑定一个微信
		let userInfo = await this.getInfoById(uid, ["wx_openid", "wx_unionid"]);
		if (userInfo.wx_openid && userInfo.wx_openid["app-plus"] == info.openid) {
			return {
				code: -1,
				message: "已绑定微信"
			}
		} else if (userInfo.wx_unionid && userInfo.wx_unionid != info.unionid) {
			return {
				code: -2,
				message: "绑定主体不一致"
			}
		}
		const cmd = this.db.command;
		return await this.collection.doc(uid).update({
			wx_unionid: info.unionid,
			wx_openid: {
				"app-plus": info.openid
			},
			weixin: info
		});
	}
	async getWeixinUserInfo({
		access_token,
		openid
	}) {
		//https://api.weixin.qq.com/sns/userinfo?
		//access_token=46_SYnmMHbU_vFzfUx2mtHjQeVTBTTEobEE6CSTH2E37zxzFWPm-TC_UX_paIMwqgyx2Uhj2SHvU1mrFlKgtojXgdboQdltyGS1fcgl5sGuPl4
		//&openid=ofWg95y9_tuLMhFqVjbf9IY4htnk
		const res = await uniCloud.httpclient.request("https://api.weixin.qq.com/sns/userinfo", {
			method: 'GET',
			data: {
				access_token,
				openid
			},
			contentType: 'json', // 指定以application/json发送data内的数据
			dataType: 'json' // 指定返回值为json格式，自动进行parse
		});
		console.log("getWeixinUserInfo", res.data)
		return res.data;
	}
	/**
	 * 账户提现
	 * @param {Object} amount
	 * @param {Object} user_id
	 * @param {Object} payInfo
	 */
	async cashout(amount, mode, user_id, payInfo, info) {
		return await this.cashoutsCollection.add({
			user_id,
			amount,
			status: 0,
			mode,
			process_time: Date.now(), //执行定时器时间
			platform: this.ctx.context.PLATFORM,
			user: info,
			balance: payInfo.balance,
			payInfo,
			update_time: Date.now(),
			create_time: Date.now(),
		})
	}
	/**
	 * 账户提现
	 * @param {Object} amount
	 * @param {Object} user_id
	 * @param {Object} payInfo
	 */
	async addCashout(amount, mode, user_id, payInfo, info, order, transaction) {
		console.log("addCashout");
		let platform = this.ctx.context.PLATFORM;
		//判断微信是否在对应的微信平台申请提现，否则默认第一个平台
		if (mode == "wxpay") {
			let plts = Object.keys(info.wx_openid);
			if (plts.indexOf(platform) == -1) {
				platform = plts[0];
			}
		}
		return await transaction.collection(this.cashoutTable).add({
			outTradeNo: order.outTradeNo,
			user_id,
			amount,
			status: 0, //审核中，1审核通过，2拒绝，3通过不付款
			mode,
			process_time: Date.now(), //执行定时器时间
			platform,
			user: info,
			balance: payInfo.balance,
			payInfo,
			update_time: Date.now(),
			create_time: Date.now(),
		})
	}

	async getCashoutById(id) {
		let {
			data
		} = await this.cashoutsCollection.doc(id).get();
		// console.log("getCashoutById", data)
		if (data.length > 0) {
			return data[0]
		}
		return false
	}
	async cashoutSave(id, data) {
		return await this.cashoutsCollection.doc(id).update({
			...data,
			update_time: Date.now(),
		})
	}
	/**
	 * 查询未付款成功的提现
	 */
	async getUnpayCashout(limit = 10) {
		const cmd = this.db.command;
		let {
			data
		} = await this.cashoutsCollection.where({
			status: 1,
			process_time: cmd.lte(Date.now()),
			payment: cmd.exists(false)
		}).limit(limit).get();
		return data;
	}
}

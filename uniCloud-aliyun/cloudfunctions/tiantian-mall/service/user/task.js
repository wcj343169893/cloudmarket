const {
	Service
} = require('uni-cloud-router')
const {
	getTodayTime,
	getNowHours,
	getDateByTime
} = require('../util');
let taskList = {};
module.exports = class TaskService extends Service {
	constructor(ctx) {
		super(ctx)
		this.collection = this.db.collection('uni-id-task')
		this.taskLogCollection = this.db.collection('uni-id-task-log')
	}
	/**
	 * 获取所有任务，并判断用户是否已经完成
	 * @param {Object} uid
	 */
	async getAll(uid) {
		const cmd = this.db.command;
		let res = await this.collection.where({
			enable: true
		}).orderBy("sort", "asc").get();
		if (res.data.length == 0) {
			//没有任务
			return false;
		}
		let tasks = res.data;
		let logs = [];
		if (uid) {
			logs = await this.taskLogCollection.where({
				user_id: uid,
				create_date: cmd.gt(getTodayTime(0, 1))
			}).field({
				task_id: 1,
				bounty: 1,
				result: 1,
				amount: 1,
				middle_getout: 1,
				create_date: 1,
				hour_times: 1
			}).orderBy("create_date", "desc").get();
		}
		//服务器小时数，与本地相差8小时
		let hour = getNowHours();
		if (logs.data.length > 0) {
			//每天每人只有一条
			let logMap = {}
			logs.data.map(log => {
				logMap[log.task_id] = {
					...log,
					task_id: undefined
				};
			})
			tasks.forEach(task => {
				task.log = {};
				task.isLimited = false;
				let dayLimit = task.max_per_day;
				let hourLimit = task.max_per_hour;
				if (logMap[task._id]) {
					task.log = logMap[task._id];
					//是否限流
					task.isLimited = task.log.amount > task.max_per_day ||
						(task.log.hour_times && task.log.hour_times[hour] > task.max_per_hour);
					//剩余数量
					dayLimit = task.max_per_day - task.log.amount;

					if (task.log.hour_times && task.log.hour_times[hour]) {
						hourLimit = task.max_per_hour - task.log.hour_times[hour];
					}
				}
				//取最小
				if (dayLimit > hourLimit) {
					dayLimit = hourLimit;
				}
				task.dayLimit = dayLimit;
				//最多可获得数量
				task.hour = hour;
				this.checkTaskAmount(task)
			})
		} else {
			tasks.forEach(task => {
				task.hour = hour;
				task.dayLimit = task.max_per_hour;
				this.checkTaskAmount(task)
			})
		}
		return tasks;
	}

	async save(uid, task_id) {
		const cmd = this.db.command;
		let task = await this.getTaskById(task_id);
		if (!task) {
			//任务不存在
			return false;
		}
		//保存日志
		let logs = await this.taskLogCollection.where({
			user_id: uid,
			task_id,
			create_date: cmd.gt(getTodayTime(0, 1))
		}).field({
			task_id: 1,
			bounty: 1,
			result: 1,
			amount: 1,
			hour_times: 1
		}).get();
		let log;
		let hour = getNowHours();
		if (logs.data.length == 0) {
			//一次即可获得积分
			log = {
				user_id: uid,
				task_id,
				amount: 1,
				result: task.per_amount == 1,
				create_date: Date.now(),
				bounty: 0,
				luck: false,
				hour_times: {
					[hour]: 1
				}
			};
			//一次就获得积分
			if (log.result) {
				log.bounty = task.bounty;
			}
			//新增
			let addResult = await this.taskLogCollection.add(log);
			log._id = addResult.id;
			log.getScore = log.result;
		} else {
			log = logs.data[0];
			//多次情况，获得积分
			//判断本小时内，是否存在可用次数，否则可以重复领取,先判断今天总次数，再判断每小时
			if (log.amount >= task.max_per_day) {
				return {
					code: -1,
					message: "超出当日最大次数"
				};
			} else if (log.hour_times[hour] >= task.max_per_hour) {
				return {
					code: -2,
					message: "超出每小时最大次数"
				};
			}

			log.amount = log.amount + 1;
			log.result = log.result || log.amount >= task.per_amount;
			//每次完成次数的倍数
			log.getScore = log.amount % task.per_amount == 0;
			let saveData = {
				amount: cmd.inc(1), //总次数
				result: log.result,
			}
			//获得积分,更新总数
			if (log.getScore) {
				//多次获得积分
				saveData.bounty = cmd.inc(task.bounty);
				//页面输出
				log.bounty += task.bounty
			}
			//每小时统计
			saveData.hour_times = {
				[hour]: cmd.inc(1)
			};
			if (!log.hour_times[hour]) {
				log.hour_times[hour] = 1
			} else {
				log.hour_times[hour] += 1;
			}
			//更新次数
			await this.taskLogCollection.doc(log._id).update(saveData)
		}
		log.task = task;
		//是否需要更多动作
		log.needMore = log.amount < task.per_amount;
		return log;
	}

	/**
	 * 更新任务日志获取积分数量
	 * @param {Object} id
	 * @param {Object} bounty
	 */
	async updateTodayLogBounty(uid, task_id, bounty) {
		const cmd = this.db.command;
		//查询今天的日志
		let {
			data
		} = await this.taskLogCollection.where({
			user_id: uid,
			task_id,
			create_date: cmd.gt(getTodayTime(0, 1))
		}).limit(1).get();
		if (data.length == 0) {
			console.log("任务日志更新失败", uid, task_id, bounty)
			return false;
		}
		let log = data[0];
		await this.taskLogCollection.doc(log._id).update({
			bounty: cmd.inc(bounty)
		})
		log.bounty += bounty;
		//返回日志
		return log;
	}

	/**
	 * 更新任务为已抽奖
	 * @param {Object} id
	 */
	async updateLuck(id) {
		return await this.taskLogCollection.doc(id).update({
			luck: true,
			luck_time: Date.now()
		})
	}

	async getTaskLogById(id) {
		let {
			data
		} = await this.taskLogCollection.where({
			_id: id
		}).get();
		if (data.length == 0) {
			return false;
		}
		return data[0]
	}

	/**
	 * 获取任务信息，全局变量，大家共用，存在缓存，开启后可能会有问题
	 * @param {Object} id
	 */
	async getTaskById(id) {
		if (taskList[id]) {
			return taskList[id];
		}
		let res = await this.collection.where({
			enable: true,
			_id: id
		}).orderBy("sort", "asc").limit(1).get();
		if (res.data.length == 0) {
			//没有任务
			return false;
		}
		// taskList[id] = res.data[0];
		return res.data[0];
	}

	/**
	 * 查询连续签到记录
	 * @param {Object} uid
	 * @param {Object} task_id
	 * @param {Object} day
	 */
	async getContinuityHistoryLogCount(uid, task_id, day) {
		const cmd = this.db.command;
		let {
			data
		} = await this.taskLogCollection.where({
			user_id: uid,
			task_id,
			result: true,
			luck: false, //是否抽奖
			create_date: cmd.lt(getTodayTime(0, 1)) //今天之前的签到
		}).field({
			create_date: 1
		}).orderBy("create_date", "desc").limit(Math.abs(day)).get();
		let total = 0;
		if (data.length == 0) {
			return 0
		}
		data.map((log, index) => {
			if (log.create_date >= getTodayTime((index + 1) * -1, 1)) {
				//只要断了，就不会大于那一天的0点
				total = index + 1;
			}
		})
		//最长连续签到天数
		return total;
	}

	/**
	 * 计算任务可获得多少积分
	 * @param {Object} task
	 */
	checkTaskAmount(task) {
		//最大获得积分数量
		if (task.bounty > 0) {
			let unitScore = Math.floor(task.max_per_day / task.per_amount) * task.bounty;
			task.max_get_amount = unitScore;
			if (task.multiple && task.multiple > 0) {
				//积分翻倍
				task.max_get_amount = (task.multiple + 1) * unitScore;
			}
		} else {
			task.max_get_amount = Math.floor(task.max_per_day / task.per_amount) * task.multiple;
		}
	}

	async getTaskByOpenUrl(open_url, uid) {
		const cmd = this.db.command;
		//查询任务信息
		let tastResult = await this.collection.where({
			open_url,
			enable: true
		}).orderBy("sort", "asc").limit(1).get();
		if (tastResult.data.length > 0) {
			let task = tastResult.data[0];
			//今天的任务日志
			let logs = await this.taskLogCollection.where({
				user_id: uid,
				task_id: task._id,
				create_date: cmd.gt(getTodayTime(0, 1))
			}).field({
				task_id: 1,
				bounty: 1,
				result: 1,
				amount: 1,
				create_date: 1,
				hour_times: 1
			}).orderBy("create_date", "desc").get();
			if (logs.data.length == 0) {
				task.log = {}
			} else {
				task.log = logs.data[0]
			}
			return task;
		}
		return false;
	}
}

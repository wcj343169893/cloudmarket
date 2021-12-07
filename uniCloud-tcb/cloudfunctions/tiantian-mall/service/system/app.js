const {
	Service
} = require('uni-cloud-router')
const {
	getTodayTime,
} = require('../util');
module.exports = class AppService extends Service {
	constructor(ctx) {
		super(ctx)
		this.userCollection = this.db.collection('uni-id-users')
		this.pageCollection = this.db.collection('tian-pages')
		this.scoreDayStatisticsCollection = this.db.collection('uni-id-score-day-statistics')
	}

	/**
	 * 查询首页配置，支持不同地区分站
	 * @param {Object} app_id
	 * @param {Object} platforms
	 */
	async getHomePage(app_id, platforms, isDebug = false, ctxData = {}) {
		let keys = [app_id, platforms];
		let city = false;
		if (ctxData && ctxData.city && ctxData.city.code) {
			keys.push(ctxData.city.code)
			city = `${ctxData.city.code}`;
		}
		//内存缓存
		return this.ctx.memorycache(keys.join("_"), null, isDebug ? 60 : 3600, async () => {
			const cmd = this.db.command;
			let condition = {
				state: 1,
				app_id,
				platforms,
				component: cmd.in(['tian-tab-pages', 'tian-pages'])
			};
			if (city) {
				condition = cmd.or({
					city: cmd.exists(false), //全国配置
					state: 1,
					app_id,
					platforms,
					component: cmd.in(['tian-tab-pages', 'tian-pages'])
				}, {
					city,
					state: 1,
					app_id,
					platforms,
					component: cmd.in(['tian-tab-pages', 'tian-pages'])
				})
			}
			let {
				data
			} = await this.pageCollection.where(condition).field({
				title: 1,
				city: 1,
				configs: 1, //页面配置
				begin_time: 1,
				component: 1,
			}).orderBy("begin_time", "desc").limit(500).get();
			// console.log("查询到页面配置", data)
			if (data.length > 0) {
				//永久生效或者小于当前时间
				let enablePages = data.filter(e => !e.begin_time || e.begin_time < Date.now()).map(
					e => {
						if (!e.begin_time) {
							e.begin_time = 0;
						}
						if (!e.city) {
							e.city = 0;
						} else {
							e.city = parseInt(e.city);
						}
						return e;
					});
				if (city) {
					//优先过滤city对应的数据
					let cityPages = enablePages.filter(e => e.city > 0);
					if (cityPages.length > 0) {
						console.log("找到城市页面", city)
						enablePages = cityPages;
					}
				}
				//按显示时间倒序排序
				enablePages.sort((a, b) => {
					return b.begin_time - a.begin_time;
				})
				if (enablePages.length > 0) {
					data = enablePages;
				}
				// console.log("enablePages", enablePages)
				let info = data[0];
				let page = {
					home: {
						parent_id: info._id,
						...info,
						children: await this.getPageInfoByPid(info._id, city)
					}
				}
				return page
			}
			return false;
		}, async () => {
			let notice = `这里是首页默认配置，单个页面支持多app和多平台，但是必须从后台配置正确才能显示，操作步骤如下：
					1.运行云服务器安装向导，上传所有云函数、初始化db_init、上传所有schema文件,【如果已经自动安装，请忽略】
					2.安装后端程序
						https://ext.dcloud.net.cn/plugin?name=cqsort-tiantianmall-admin
					3.系统管理==>升级中心==>新增应用==>AppID填写【前端应用】manifest.json里的uniapp应用标志【重要】
					4.页面管理==>页面信息==>新增：
						组件类型（单页面），
						页面标题（天天优选），【前端应用】
						是否显示（是），
						排序（100），
						应用（选择步骤2的app）【重要】，
						平台（应用、H5和微信小程序）【重要】
						==>保存并返回
					5.页面管理==>页面信息==>排版：
						选择左侧组件
						配置对应的选项
						==>保存配置
					如有疑问，请加QQ群：298724327，群公告有前后端安装视频教程
					`;
			return {
				home: {
					component: "tian-pages",
					title: "请按步骤配置首页",
					parent_id: "615e5334817bc500012e7e68",
					install_notice: notice
				}
			}
		})
	}

	/**
	 * 根据上级id，查询页面信息
	 * @param {Object} pid
	 */
	async getPageInfoByPid(pid, city) {
		let {
			data
		} = await this.pageCollection.where({
			state: 1,
			parent_id: pid
		}).orderBy("posid", "asc").limit(100).get();
		if (city) {
			return data.map(e => {
				e.city = city
				return e;
			})
		}
		return data;
	}

	/**
	 * 获取最新分红
	 * @param {Object} day
	 */
	async getNewMoney(day) {
		const cmd = this.db.command;
		let {
			data
		} = await this.scoreDayStatisticsCollection.where({
			open_time: cmd.lt(Date.now()),
			day: cmd.gt(day),
			money: cmd.gt(0),
			status: 1,
		}).orderBy("day", "asc").get();
		return data;
	}

	/**
	 * 系统每日积分获取统计
	 * @param {Object} amount
	 * @param {Object} day
	 */
	async setScoreDayStatistics(amount, field = "value", day = 0) {
		amount = parseFloat(amount);
		if (amount > 0) {
			if (!day) {
				day = getTodayTime(0, true);
			}
			const cmd = this.db.command;
			const {
				updated
			} = await this.scoreDayStatisticsCollection.where({
				day
			}).update({
				[field]: cmd.inc(amount)
			});
			if (!updated) {
				//需要新增
				await this.scoreDayStatisticsCollection.add({
					day,
					[field]: amount
				});
			}
		}
	}

	/**
	 *  修复积分总计，比较耗费资源
	 */
	async repair(id, day) {
		const cmd = this.db.command;
		const $ = cmd.aggregate;
		let {
			data
		} = await this.userCollection.aggregate().match({
			["score_log." + day]: cmd.gt(0)
		}).group({
			_id: null,
			totalScore: $.sum(`$score_log.${day}`)
		}).end();
		if (data.length > 0) {
			console.log(data[0]);
			await this.scoreDayStatisticsCollection.doc(id).update({
				"value": data[0].totalScore
			})
		}
		return data;
	}
}

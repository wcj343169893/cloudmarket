'use strict';
const db = uniCloud.database();
const cmd = db.command;
const videoCollection = db.collection("cloud_videos");
const {
	getDate
} = require('base-common');
const modules = {
	async statistics(shop) {
		shop["videoTypes"] = [];
		let conditions = this.getConditions(shop.id);
		for (let key in conditions) {
			let number = await this.getVideoStatisticsByCondition(conditions[key].condition);
			shop["videoTypes"].push({
				name: conditions[key].name,
				state: key,
				number: number
			});
		}
	},
	async getVideoStatisticsByCondition(condition) {
		let res = await videoCollection.where(condition).count();
		return res.total;
	},
	/**
	 * 审核视频
	 * @param {Object} data
	 */
	async verify(data) {
		const {
			id,
			shopid,
			operator,
			state
		} = data;
		return await videoCollection.where({
			_id: id,
			shopid
		}).update({
			operator,
			verifyTime: Date.now(),
			state: Number(state)
		});
	},
	/**
	 * 发表视频，后台添加，直接通过
	 * @param {Object} data
	 */
	async save(data, context) {
		const {
			userInfo
		} = context
		//状态：0待审核，1发布，-1下架
		Object.assign(data, {
			state: 1,
			created: Date.now(),
			statistics: {
				play: 0,
				like: 0
			},
			user: {
				_id: userInfo._id,
				nickname: userInfo.nickname,
				avatar: userInfo.avatar,
			}
		})
		return await videoCollection.add(data);
	},
	/**
	 * 分页查询
	 * @param {Object} data
	 */
	async list(data) {
		const {
			page,
			limit,
			uid,
			vuid,
			extIds,
			shopid,
			state
		} = data;
		let conditions = {
			shopid
		}
		let conditionsMap = this.getConditions(shopid);
		if (state && conditionsMap[state]) {
			conditions = conditionsMap[state].condition;
		}
		if (vuid) {
			conditions.uid = vuid;
		}
		if (extIds) {
			conditions._id = cmd.nin(extIds)
		}
		let res = await videoCollection.where(conditions).skip((page - 1) * limit).limit(limit).field({
			goods: 1,
			title: 1,
			poster: 1,
			url: 1,
			duration: 1,
			width: 1,
			height: 1,
			user: 1,
			state: 1,
			statistics: 1,
		}).orderBy("created", "desc").get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	},
	getConditions(shopid) {
		//获取今日和昨日的时间戳
		const {
			todayTime,
			yestertodayTime
		} = this.getDayTime();
		let statistics = {
			all: {
				name: "全部",
				condition: {
					shopid: shopid,
					_id: cmd.exists(true)
				}
			},
			yestertoday: {
				name: "昨日新增",
				condition: {
					shopid: shopid,
					created: cmd.gte(yestertodayTime).lt(todayTime)
				}
			},
			today: {
				name: "今日新增",
				condition: {
					shopid: shopid,
					created: cmd.gte(todayTime)
				}
			},
			verify: {
				name: "待审核",
				condition: {
					shopid: shopid,
					state: 0
				}
			}
		};
		return statistics;
	},
	getDayTime() {
		let date = getDate();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);
		let todayTime = date.getTime();
		date.setDate(date.getDate() - 1);
		let yestertodayTime = date.getTime();
		return {
			todayTime,
			yestertodayTime
		};
	}
}

module.exports = modules

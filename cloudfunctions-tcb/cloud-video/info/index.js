'use strict';
const db = uniCloud.database();
const cmd = db.command;
const videoCollection = db.collection("cloud_videos");
const model = {
	/**
	 * 视频广场，分页查询
	 * @param {Object} data
	 */
	async square(data) {
		const {
			page,
			limit,
			uid,
			state
		} = data;
		let conditions = {
			state: 1
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
			statistics: 1,
			likes: 1
		}).orderBy("created", "desc").get();
		if (res.data.length == 0) {
			return false;
		}
		res.data.forEach(video => {
			video.isLike = video.likes && video.likes.indexOf(uid) != -1;
			video.likes = undefined;
		})
		return res.data;
	},
	/**
	 * 播放视频
	 * @param {Object} data
	 */
	async play(data) {
		const {
			uid,
			id
		} = data;
		return await videoCollection.doc(id).update({
			statistics: {
				play: cmd.inc(1)
			},
			players: cmd.addToSet(uid)
		});
	},
	async like(data) {
		const {
			uid,
			id
		} = data;
		let res = await videoCollection.where({
			_id: id,
			likes: cmd.in([uid])
		}).field({
			_id: 1
		}).get();
		//判断之前是否已经喜欢
		if (res.data.length == 0) {
			await videoCollection.doc(id).update({
				statistics: {
					like: cmd.inc(1)
				},
				likes: cmd.addToSet(uid)
			});
			return {
				isLike: true
			}
		}
		//移除喜欢者
		await videoCollection.doc(id).update({
			statistics: {
				like: cmd.inc(-1)
			},
			likes: cmd.pull(uid)
		});
		return {
			isLike: false
		}
	},
	/**
	 * 查询自己发布的视频
	 * @param {Object} data
	 */
	async list(data) {},
	/**
	 * 发表视频，需要后台审核
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
};
module.exports = model

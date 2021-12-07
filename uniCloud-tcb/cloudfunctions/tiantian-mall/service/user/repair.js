const {
	Service
} = require('uni-cloud-router')
module.exports = class RepairService extends Service {
	constructor(ctx) {
		super(ctx)
		this.collection = this.db.collection('uni-id-users')
	}
	/**
	 * 修复下级邀请关系
	 * @param {Object} id
	 */
	async invite(id) {
		let info = await this.service.user.user.getInfoById(id, ["inviter_uid"]);
		if (!info.inviter_uid) {
			info.inviter_uid = []
		}
		info.inviter_uid.unshift(info._id);
		return await this.collection.where({
			"inviter_uid.0": id
		}).update({
			inviter_uid: info.inviter_uid
		})
	}

	/**
	 * 修复上级关系
	 * @param {Object} id
	 */
	async recommend(id) {
		return await this.getInvitersById(id);
	}

	async getInvitersById(id) {
		if (!id) {
			return [];
		}
		console.log("开始查找", id);
		let info = await this.service.user.user.getInfoById(id, ["inviter_uid", "inviter_uid_repair"]);
		//最上面一层没有邀请人
		if (!info || !info.inviter_uid) {
			return [id];
		}
		if (info.inviter_uid_repair) {
			console.log("已修复")
			//已修复上级
			info.inviter_uid.unshift(info._id);
			return info.inviter_uid;
		}
		if (info.inviter_uid[0] == id) {
			//错误数据，自己绑定了自己
			return [];
		}
		let pids = await this.getInvitersById(info.inviter_uid[0]);
		//自身更新为pids
		if (pids.length != info.inviter_uid.length) {
			await this.collection.doc(id).update({
				inviter_uid: pids,
				inviter_uid_repair: true
			});
			console.log(id, pids);
		}
		pids.unshift(id);
		return pids;
	}
}

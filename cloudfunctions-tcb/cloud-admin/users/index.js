'use strict';
const db = uniCloud.database();
const cmd = db.command;
const usersCollection = db.collection("uni-id-users");
const modules = {
	async list(data) {
		const {
			page,
			limit,
			key,
			sort
		} = data;
		let condition = {
			_id: cmd.exists(true)
		};
		if (key && key.trim().length > 0) {
			condition = cmd.or({
				nickname: new RegExp(key)
			}, {
				mobile: new RegExp(key)
			});
		}
		let direct = "desc",
			field = "register_date";
		switch (sort) {
			case 1:
				break;
			case 2:
				field = "last_login_date";
				break;
			case 3:
				field = "balance";
				break;
			case 4:
				field = "balance";
				direct="asc";
				break;
			case 5:
				break;
			default:
				break;
		}
		const result = await usersCollection.where(condition).skip((page - 1) * limit).limit(limit).orderBy(field, direct).get();
		if (result.data.length == 0) {
			return false;
		}
		return result.data;
	}
}

module.exports = modules

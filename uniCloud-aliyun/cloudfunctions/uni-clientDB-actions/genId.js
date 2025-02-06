// 开发文档：https://uniapp.dcloud.io/uniCloud/clientdb?id=action
const {
	genIdentityId
} = require("base-common");
const keyMap = {
	shop_apply: "shops"
}
module.exports = {
	before: async (state, event) => {
		let key = state.collection.replace("cloud_", "");
		key = keyMap[key] || key;
		state.newData.id = await genIdentityId(key);
	},
	after: async (state, event, error, result) => {
		if (error) {
			throw error
		}
		return result
	}
}
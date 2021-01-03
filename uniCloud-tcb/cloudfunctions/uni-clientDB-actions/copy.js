// 开发文档：https://uniapp.dcloud.io/uniCloud/clientdb?id=action
const db = uniCloud.database();
module.exports = {
	before: async (state, event) => {

	},
	after: async (state, event, error, result) => {
		if (error) {
			throw error
		}
		if (result.data && result.data.length > 0) {
			let data = {
				...result.data[0],
				_id: undefined
			};
			//累加排序
			if (data.sort) {
				data.sort++;
			}
			await db.collection(state.collection).add(data)
		}
		return result
	}
}

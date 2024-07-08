// 开发文档：https://uniapp.dcloud.io/uniCloud/clientdb?id=action
const db = uniCloud.database();
module.exports = {
	before: async (state, event) => {

	},
	after: async (state, event, error, result) => {
		if (error) {
			throw error
		}
		if (result.id) {
			let par = state.newData;
			//生成增删改权限
			let arr = {
				"LIST": "列表",
				"ADD": "新增",
				"EDIT": "修改",
				"DELETE": "删除"
			};
			let suffix = "管理";
			let name = par.permission_name;
			if (endsWith(par.permission_name, suffix)) {
				name = par.permission_name.substr(0, name.length - suffix.length);
			}
			let dataArr = [];
			for (let key in arr) {
				let actName = arr[key];
				let data = {
					permission_id: `${par.permission_id}_${key}`,
					permission_name: `${actName}${name}`,
					parent_id: result.id,
					comment: ""
				}
				dataArr.push(data);
			}
			await db.collection(state.collection).add(dataArr)
			console.log(state.newData)
			console.log(dataArr)
		}
		//console.log(state.newData)
		//{"permission_id":"nnn","permission_name":"nnnn","comment":"ggg","parent_id":"","create_date":1609576896408},
		return result
	}
}
const endsWith = (str, suffix) => {
	return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

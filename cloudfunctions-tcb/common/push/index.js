//《多厂商推送透传消息带通知》
'use strict';
const modules = {
	unipush: require("./unipush")
};
const model = {
	/**
	 * @param {Object} data
	 */
	async toApp(data) {
		return modules["unipush"].toApp(data);
	},
	async toSingle(data) {
		return modules["unipush"].toSingle(data);
	}
}
module.exports = model;

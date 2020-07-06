'use strict';
const checkInfo = async function(data) {
	let mobile = data.mobile;
	let code = data.code;
	//正常情况需要结合发送短信验证一下，暂时全部通过
	return {
		"mobile": mobile
	};
}
module.exports = {
	checkInfo: checkInfo,
	ifNotExists: "new"
}

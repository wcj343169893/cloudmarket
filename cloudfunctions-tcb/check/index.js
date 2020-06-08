'use strict';
const auth = uniCloud.auth()
exports.main = async (event, context) => {
	let userInfo = await auth.getUserInfo()
	return {
		userInfo
	}
};

'use strict';
const modules = {
	detail: require('./detail'),
	search: require('./search'),
	visite: require('./visite'),
	miaosha: require('./miaosha'),
};
const auth = uniCloud.auth();
exports.main = async (event, context) => {
	let {
		customUserId
	} = await auth.getUserInfo();
	let action = event.action;
	const model = modules[action];
	return await model.main(event, context, +customUserId);
};

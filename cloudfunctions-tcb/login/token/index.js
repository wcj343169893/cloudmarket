'use strict';
const NodeRSA = require('node-rsa');
const configs = require("../config.json");
const cmd = uniCloud.database().command;
const checkInfo = async function(data) {
	let token = data.token;
	//解密token
	let key = new NodeRSA(configs["privateKey"]);
	//这一步很关键：encryptionScheme — padding scheme for encrypt/decrypt. Can be 'pkcs1_oaep' or 'pkcs1'. Default 'pkcs1_oaep'.
	key.setOptions({
		encryptionScheme: 'pkcs1'
	});
	let conditions = false;
	try {
		conditions = JSON.parse(key.decrypt(token, 'utf8'));
	} catch (e) {
		//TODO handle the exception
		console.log("token自动登录解密失败");
	}
	if (!conditions) {
		data.message = "自动登录解密失败";
		return false;
	}
	//在后面查询用户信息的时候，增加token验证，防止伪造
	return {
		...conditions,
		"tokenExpire": cmd.gt(new Date().getTime()),
		"token": token
	};
}
module.exports = {
	checkInfo: checkInfo,
	ifNotExists: "quit"
}

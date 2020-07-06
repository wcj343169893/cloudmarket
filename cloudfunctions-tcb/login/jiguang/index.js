'use strict';
const NodeRSA = require('node-rsa');
//极光配置，公钥需要设置到极光后台，app包名需要对应上，否则无法验证
const config = require('../config.json');
const checkInfo = async function(data) {
	//只有app端支持极光
	let configs = config["app-plus"]["oauth"]["jiguang"];
	let token = data.token;
	//Authorization 在网上可以生成
	const result = await uniCloud.httpclient.request(configs["url"], {
		method: 'POST',
		headers: {
			"Authorization": configs["Authorization"]
		},
		data: {
			loginToken: token
		},
		contentType: "json",
		dataType: 'json'
	});
	if (result.data.code == 8000) {
		//console.log('result', result);
		console.log('encrypted:', result.data.phone);
		//私钥和公钥要配对才能解开
		let key = new NodeRSA(configs["privateKey"]);
		//这一步很关键：encryptionScheme — padding scheme for encrypt/decrypt. Can be 'pkcs1_oaep' or 'pkcs1'. Default 'pkcs1_oaep'.
		key.setOptions({
			encryptionScheme: 'pkcs1'
		});
		let mobileName = key.decrypt(result.data.phone, 'utf8');
		if (!mobileName) {
			data.message = "手机号解码错误";
			return false;
		}
		console.log(mobileName);
		//临时输出
		return {
			"mobile": mobileName
		};
	}
	console.log(result.data);
	data.message = result.data.content;
	return false;
}

module.exports = {
	checkInfo: checkInfo,
	ifNotExists: "new"
}

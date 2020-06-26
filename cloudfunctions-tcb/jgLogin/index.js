'use strict';
const NodeRSA = require('node-rsa');
const db = uniCloud.database();
const {
	loginWithPhone
} = require('login');

exports.main = async (event, context) => {
	let token = event.token;
	//极光后台需要此公钥
	let publicKey = `-----BEGIN PUBLIC KEY-----` +
		`MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCINOLJ1Tv2um/q570FeoU1V6Z1pauHXKIwl3pS+cJbCw1CjBIi3fU5+Qu+3fl6x5aA84IUZYCXYbSRHET0SM3fbrkU47JFm1Mhd3xMMLQSwfa3mciYrPO6l6oNaichd0m+sSY74RV3ISeWKKAFFk0E4aUjax+a7OJEvISZ4xYKbQIDAQAB` +
		`-----END PUBLIC KEY-----`;
	let privateKey = `-----BEGIN PRIVATE KEY-----` +
		`MIICdgIBADANBgkqhkiG9w0BAQEFAASCAmAwggJcAgEAAoGBAIg04snVO/a6b+rnvQV6hTVXpnWlq4dcojCXelL5wlsLDUKMEiLd9Tn5C77d+XrHloDzghRlgJdhtJEcRPRIzd9uuRTjskWbUyF3fEwwtBLB9reZyJis87qXqg1qJyF3Sb6xJjvhFXchJ5YooAUWTQThpSNrH5rs4kS8hJnjFgptAgMBAAECgYEAgkXi65wxIAitZoWC+qx2n9BXe4qbBnqI/eTDsH0FcUKeyhlid0rHc01J+KIiLVacEnXU4mE6no9qvqfFI8hGbpoBOSiPjlR6hc8WRlfSI6OQwhMQGBIu52LBwBe8KpR7wAYi086WOqgE0UnYFSvvlMj9O6mBTJ850e7z7kPvnoECQQDAcqCgaajW4ourgdmbb5dsuReLftNE4F370zOkoUsa6c4Si96DrBpHWhPB03PGl1l0V8BG3aaDxKrl3Ll+br3xAkEAtS+tKdpjCMWGdV7SKLGSCrRDB1xfqYHYxnClgVmOYT/1k/9GaiMzaZTyhAkjkkLcyP+juYUIFe/YlWRtNrdIPQJAQQE3IpguEM+bMAZ/c5KBCpeGzXa8dEJ5XIudoRleXivlkLwwIDfs9HcHv2vmaolLDRJq/0T1bwLqWxRwj7VmcQJAGRx5eHJ/BUkzAHNa1y79GaSwIYYI8BpB7AbSuWGrHQlbRN69aJpmVrzA+9G0b2H67ZSYoW6xlzC9qL7ZcBro1QJAKV0lrNUrbGJEwyy8ML1FXDHWa0OWF088N+A+jtO4dgJ/R7oN5YTDLb1jaa6EpifVMAuTyqmvc6m5sUWXHHsROg==` +
		`-----END PRIVATE KEY-----`;
	const result = await uniCloud.httpclient.request("https://api.verification.jpush.cn/v1/web/loginTokenVerify", {
		method: 'POST',
		headers: {
			"Authorization": "Basic ZDM1NTI4OThjYjQxMDk4ODExNTg5ZGM2OjNmZTRlNWMxOTcxZGQyY2ZjM2FiOWEzMQ=="
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
		
		let key = new NodeRSA(privateKey);
		//这一步很关键：encryptionScheme — padding scheme for encrypt/decrypt. Can be 'pkcs1_oaep' or 'pkcs1'. Default 'pkcs1_oaep'.
		key.setOptions({
			encryptionScheme: 'pkcs1'
		});
		let mobileName = key.decrypt(result.data.phone, 'utf8');
		console.log(mobileName);
		let data = await loginWithPhone(mobileName);
		//临时输出
		return {
			"code": 200,
			"message": "操作成功",
			"data": data
		};
	}
	return {
		"code": 404,
		"message": result.data.content
	};
};
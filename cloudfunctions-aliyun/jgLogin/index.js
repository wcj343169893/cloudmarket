'use strict';
const NodeRSA = require('node-rsa');
const db = uniCloud.database();
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
		
		//成功获得手机号：13332903310
		const usersCollection = db.collection("users");
		const fields = {
			balance: 1,
			count: 1,
			coupons: 1,
			score: 1,
			nickname: 1,
			portrait: 1,
			id: 1,
			invite: 1,
			birthday: 1,
		};
		//检测是否已经存在
		let time = new Date().toISOString();
		let user = await db.collection("users").where({
			mobile: mobileName
		}).field(fields).limit(1).get();
		let data = {};
		if (user.affectedDocs < 1) {
			const cmd = db.command;
			data = {
				mobile: mobileName,
				nickname: getNickName(),
				portrait: "/static/missing-face.png",
				balance: 0,
				coupons: 0,
				score: 0,
				regist: time,
				lastLogin: time,
			};
			//生成用户id----开始-----
			const identity = db.collection("identity");
			//获取用户id
			await identity.where({
				"key":"users"
			}).update({
				value:cmd.inc(1)
			});
			//立马查询出来，可能值是对的
			let res2 = await identity.where({
				"key":"users"
			}).field({
				value:1
			}).get();
			data["id"] = res2.data[0].value;
			//生成用户id----结束-----
			//新增
			let result = await usersCollection.add(data);
			data["_id"] = result.id;
		} else {
			data = user.data[0];
		}
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

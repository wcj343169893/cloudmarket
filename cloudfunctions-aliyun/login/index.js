'use strict';
const cryptoJS = require('crypto-js');
const md5=require('md5-node');
exports.main = async (event, context) => {
	let token = event.token;
	//应用对应的APPKEY
	let appKey = "MxqI3HJV";

	//组装请求参数
	let params = {
		appId: "5AvWkYQj", //应用对应的闪验appId
		token: token, //SDK返回的token
		//clientIp: "", //可以不传 ，如不传不用拼接到签名中
		//outId: "", //可以不传 ，如不传不用拼接到签名中
		encryptType: "0" //可以不传 ，如不传默认：0 AES解密
	};

	//拼接请求字符串
	let content = "";
	let keys = Object.keys(params).sort();
	for (let i = 0; i < keys.length; i++) {
		content += keys[i] + params[keys[i]];
	}

	//生成签名
	params["sign"] = cryptoJS.enc.Hex.stringify(cryptoJS.HmacSHA256(content, appKey));
	console.log(params);
	const result = await uniCloud.httpclient.request("https://api.253.com/open/flashsdk/mobile-query", {
		method: 'POST',
		data: params,
		dataType: 'json'
	});
	let mobileName;
	let res=result.data;
	console.log(res);
	if (res.code == "200000") {
		mobileName = res.data.mobileName;
		//AES解密
		var key = md5(appKey);
		mobileName = aesDecrypt(mobileName, key.substring(0, 16), key.substring(16));
		console.log("手机号：",mobileName);
		//成功获得手机号：13332903310
		//临时输出
		return {
			"code": 200,
			"message": "操作成功",
			"data": mobileName
		};
	}else{
		return {
			"code": 404,
			"message": res.message+" "+res.code
		};
	}
};
//AES解密 
var aesDecrypt = function(content, keys, ivs) {
	var key = cryptoJS.enc.Utf8.parse(keys);
	var iv = cryptoJS.enc.Utf8.parse(ivs);
	var encryptedHexStr = cryptoJS.enc.Hex.parse(content);
	var srcs = cryptoJS.enc.Base64.stringify(encryptedHexStr);
	var decrypt = cryptoJS.AES.decrypt(srcs, key, {
		iv: iv,
		mode: cryptoJS.mode.CBC,
		padding: cryptoJS.pad.Pkcs7
	});
	var decryptedStr = decrypt.toString(cryptoJS.enc.Utf8);
	return decryptedStr.toString();
}

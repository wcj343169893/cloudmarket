/**
 * 获得支付宝配置
 */
const getAlipayConfig = function() {
	return {
		appId: '1234567890',
		privateKey: 'MI.........................sp',
		alipayPublicKey: 'MIIBIjA................B', // 使用支付时需传递此值做返回结果验签
	};
}
/**
 * 获得微信支付配置
 */
const getWxPayConfig = function() {
	return {
		appId: 'wxa8e200000000000',
		mchId: '15295600000',
		key: 'aaaaaaaaaaaaaaa',
		//pfx: fs.readFileSync('/path/to/your/pfxfile'), // p12文件路径，使用微信退款时需要，需要注意的是阿里云目前不支持以相对路径读取文件，请使用绝对路径的形式
	};
}

module.exports = {
	getAlipayConfig,
	getWxPayConfig
}

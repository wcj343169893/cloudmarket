const crypto = require('crypto');

/**
 * 判断对象
 * @param {any} obj 判断参数
 * @returns 是否对象
 */
function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

/**
 * 加密
 * @param {String} algorithm 加密算法：md5/sha1
 * @param {String} content 加密数据
 * @param {String} encoding 编码方式
 * @returns 加密后的数据
 */
function encrypt (algorithm, content, encoding = 'utf8') {
	return crypto.createHash(algorithm).update(content, encoding).digest('hex');
}

module.exports = {
	isPlainObject,
	
	/**
	 * 判断函数
	 * @param {Object} fn 判断参数
	 * @returns 是否函数
	 */
	isFn (fn) {
	  return typeof fn === 'function'
	},

	/**
	 * 获取克隆数据
	 * @param {Object} obj 克隆数据
	 * @returns 克隆后的数据
	 */
	clone (obj) {
	  return JSON.parse(JSON.stringify(obj))
	},

	/**
	 * 解密数据（退款通知等）
	 * @param {String} encryptedData 加密数据
	 * @param {String} key 密钥（md5(key)）
	 * @param {String} iv 偏移量
	 * @returns 解密数据
	 */
	decryptData (encryptedData, key, iv = '') {
	  // 解密
	  const decipher = crypto.createDecipheriv('aes-256-ecb', key, iv)
	  // 设置自动 padding 为 true，删除填充补位
	  decipher.setAutoPadding(true)
	  let decoded = decipher.update(encryptedData, 'base64', 'utf8')
	  decoded += decipher.final('utf8')
	  return decoded
	},

	encrypt,
	
	/**
	 * md5加密
	 * @param {String} content 加密数据
	 * @param {String} encoding 编码方式
	 * @returns 加密数据
	 */
	md5 (content, encoding = 'utf8') {
	  return encrypt('md5', content, encoding);
	},

	/**
	 * sha1加密
	 * @param {String} content 加密数据
	 * @param {String} encoding 编码方式
	 * @returns 加密数据
	 */
	sha1 (content, encoding = 'utf8') {
	  return encrypt('sha1', content, encoding);
	},

	/**
	 * sha256加密
	 * @param {String} str 加密数据
	 * @param {String} key 密钥
	 * @param {String} encoding 编码方式
	 * @returns 加密数据
	 */
	sha256 (str, key, encoding = 'utf8') {
	  return crypto
		.createHmac('sha256', key)
		.update(str, encoding)
		.digest('hex')
	},

	/**
	 * 获取签名数据
	 * @param {Object} obj 签名对象
	 * @param {String} sperator 链接对象分隔符（obj1&obj2）
	 * @param {String} joinStr 链接key和value分隔符（key=value）
	 * @returns 返回签名数据
	 */
	getSignStr (obj, sperator = '&', joinStr = '=') {
	  return Object.keys(obj)
		.filter(key => key !== 'sign' && obj[key] !== undefined && obj[key] !== '')
		.sort()
		.map(key => key + joinStr + (isPlainObject(obj[key]) ? JSON.stringify(obj[key]) : obj[key]))
		.join(sperator)
	},

	/**
	 * 获取随机字符串
	 * @param {Number} length 长度
	 * @returns 随机字符串
	 */
	getNonceStr (length = 16) {
	  let str = ''
	  while (str.length < length) {
		str += Math.random().toString(32).substring(2)
	  }
	  return str.substring(0, length)
	},

	/**
	 * 判断XML
	 * @param {String} str 判断字符串
	 * @returns 是否XML
	 */
	isXml (str) {
	  const reg = /^(<\?xml.*\?>)?(\r?\n)*<xml>(.|\r?\n)*<\/xml>$/i
	  return reg.test(str.trim())
	},

	/**
	 * 对象转换XML（只可在微信支付时使用，不支持嵌套）
	 * @param {Object} obj 对象
	 * @param {String} rootName 根名
	 * @returns XML数据
	 */
	toXml (obj, rootName = 'xml') {
	  const content = Object.keys(obj).map(item => {
		if (isPlainObject(obj[item])) {
		  return `<${item}><![CDATA[${JSON.stringify(obj[item])}]]></${item}>`
		} else {
		  return `<${item}><![CDATA[${obj[item]}]]></${item}>`
		}
	  })
	  return `<${rootName}>${content.join('')}</${rootName}>`
	},

	/**
	 * XML转换对象（只可在微信支付时使用，不支持嵌套）
	 * @param {Object} xml XML数据
	 * @returns 对象
	 */
	toJson (xml) {
	  const xmlReg = /<(?:xml|root).*?>([\s|\S]*)<\/(?:xml|root)>/
	  const str = xmlReg.exec(xml)[1]
	  const obj = {}
	  const nodeReg = /<(.*?)>(?:<!\[CDATA\[){0,1}(.*?)(?:\]\]>){0,1}<\/.*?>/g
	  let matches = null
	  // eslint-disable-next-line no-cond-assign
	  while ((matches = nodeReg.exec(str))) {
		obj[matches[1]] = matches[2]
	  }
	  return obj
	},
	
	/**
	 * Url参数转换对象
	 * @param {String} url Url参数(?a=1&b=2 或 a=1&b=2)
	 * @returns 对象({a: 1, b: 2})
	 */
	urlToJson (url) {
		let obj = {};
		let urlString = url.substring(url.indexOf("?") + 1);
		let urlArray = urlString.split("&");
		for (let i = 0; i < urlArray.length; i++) {
			let urlItem = urlArray[i];
			let item = urlItem.split("=");
			obj[item[0]] = item[1];
		}
		return obj; 
	},

	/**
	 * 对象转换地址
	 * @param {Object} obj 对象
	 * @param {String} sperator 链接对象分隔符（obj1&obj2）
	 * @param {String} joinStr 链接key和value分隔符（key=value）
	 * @returns XML数据
	 */
	jsonToUrl(obj, sperator = '&', joinStr = '=') {
		return Object.keys(obj).map(item => item = item + joinStr + obj[item]).join(sperator);
	},
	
	/**
	 * 时间格式化
	 * @param {Date|Number|String} dateString 时间
	 * @param {String} format 格式化
	 * @returns 格式化后的时间
	 */
	dateFormat (dateString, format = "YYYY-MM-dd HH:mm:ss") {
		let ret, date
	
		switch (Object.prototype.toString.call(dateString)) {
			case '[object Date]':
			case '[object Number]':
				date = new Date(dateString);
				break;
			default:
				// 转换字符串形式
				dateString = '' + (dateString || '')
				// 有些日期接口返回带有.0。
				dateString = dateString.indexOf(".") > -1 ? dateString.substring(0, dateString.indexOf(".")) : dateString
				// 解决IOS上无法从dateStr parse 到Date类型问题
				dateString = ReplaceAll(dateString, '-', '/')
				// 转换日期形式
				date = dateString ? new Date(dateString) : new Date()
				break;
		}
	
		const opt = {
			"Y+": date.getFullYear().toString(), // 年
			"y+": date.getFullYear().toString(), // 年
			"M+": (date.getMonth() + 1).toString(), // 月
			"D+": date.getDate().toString(), // 日
			"d+": date.getDate().toString(), // 日
			"H+": date.getHours().toString(), // 时
			"h+": date.getHours().toString(), // 时
			"m+": date.getMinutes().toString(), // 分
			"S+": date.getSeconds().toString(), // 秒
			"s+": date.getSeconds().toString() // 秒
			// 有其他格式化字符需求可以继续添加，必须转化成字符串
		}
		for (let k in opt) {
			ret = new RegExp("(" + k + ")").exec(format)
			if (ret) {
				format = format.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
			}
		}
		return format
	},
	
}
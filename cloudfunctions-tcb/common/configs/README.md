## 配置文件说明
### 各个平台微信、支付宝配置 [unipay 官方说明](https://uniapp.dcloud.io/uniCloud/unipay)
#### 支付参数配置 
1. 支持平台：APP端app-plus、微信小程序mp-weixin、支付宝小程序mp-alipay、网页版h5
2. 支付方式开启办法：单个平台如果不配置支付方式，则用户在这个平台下支付的时候，不会显示此支付方式
3. 专业术语说明：  

|	字段	|	说明	|
|--	|--	|
|payment|固定写法，目的是为了将来兼容oauth等其他配置，与官方命名风格一致|
|alipay|支付宝支付|  
|wxpay|微信支付 |  
|balance|余额支付|  
|delivery|货到付款|  
|uniPay| unipay内置方法，cloud-payment内动态调用  |  
|name|退款等功能需要只显示微信或者支付宝|  
|payName|前端显示的支付方式名称，例如：余额可以改成佣金|  
|pfx|微信支付商户 API 证书，主要用于退款,下载后，保存到cert目录下，这里只填写证书名称，例如:abcdef.p12|  



#### 支付成功后，通知回调地址
1. url示例：http://www.mydomain.com/market_notify/app-plus/alipay/mall  
2. 组成分析：域名部分(domain)/通知PATH部分(notify-floder)/访问平台/支付方式/订单类型  
3. 开启办法： 开启云函数 ``cloud-payment``的 ``云函数URL化``，填写path部分

### 极光一键登录 app-plus.oauth.jiguang  [官方文档](https://docs.jiguang.cn//jverification/server/rest_api/)  
极光认证整合了三大运营商的网关认证能力，为开发者提供了一键登录和号码认证功能，优化用户注册/登录、号码验证的体验，提高安全性，仅支持app登录
 
|字段	|说明	|  备注|  
|--	|--	|-- |    
|url	|解密手机号请求地址，不需要改	| 防止官方地址更变|   
|Authorization	|base64转换过的 "appKey:masterSecret"（中间有个冒号）[官方文档](https://docs.jiguang.cn//jverification/server/rest_api/rest_api_summary/)|  |  
|publicKey	|RSA公钥，填入极光后台|写在这里为了将来验证是否配对	|    
|privateKey	|RSA私钥解密手机号，[官方文档](https://docs.jiguang.cn//jverification/server/rest_api/loginTokenVerify_api/)	|  |  

### uni短信模板 service.sms.templateId  [官方文档](https://uniapp.dcloud.io/uniCloud/send-sms)
从HBuilderX 2.8.1起，uniCloud内置了短信发送API。给开发者提供更方便、更便宜的短信发送能力。该服务类似小程序的模板消息，在一个固定模板格式的文字里自定义某些字段，而不是所有文字都可以随便写。后续视需求提供自定义短信模板功能。使用本功能需要在DCloud开发者中心开通并充值，教程参考短信服务开通指南因涉及费用，为保障安全，本能力应该在云函数中调用，而不是在前端调用   
报备模板的方式：
1. 如果尚未添加签名，请在在开发者中心-[签名配置](https://dev.dcloud.net.cn/uniSms/sign)内添加签名
2. 在开发者中心-[模板配置](https://dev.dcloud.net.cn/uniSms/tmp)内申请自定义模板 

### 消息推送（集成个推unipush）push.default [UniPush使用指南](https://ask.dcloud.net.cn/article/35622)
UniPush是DCloud联合个推公司推出的集成型统一推送服务，内建了苹果、华为、小米、OPPO、VIVO、魅族、谷歌FCM等手机厂商的系统级推送和个推等第三方推送。  
这里参考了插件[推送sdk之unipush的uniCloud版【V2】](https://ext.dcloud.net.cn/plugin?id=1680)，经过深度修改后，可扩展其他推送方式，可直接向店铺管理员发送消息。  
push.default 为默认app配置，假如涉及到多个客户端，例如：骑手端push.rider、供应商push.supplier，每个配置不同，在登录的时候，自动写入用户表的push属性中，在推送的时候，找到对应的clientid，如果用户退出登录，将移除设备信息，防止收到不必要的信息。  

|字段	|说明	|
|--	|--	|
|AppID	|由IGetui管理页面生成，是您的应用与SDK通信的标识之一，每个应用都对应一个唯一的AppID。	|
|AppKey	|预先分配的第三方应用对应的Key，是您的应用与SDK通信的标识之一。	|
|AppSecret	|第三方客户端个推集成鉴权码，用于验证第三方合法性。在客户端集成SDK时需要提供。	|
|MasterSecret	|个推服务端API鉴权码，用于验证调用方合法性。在调用个推服务端API时需要提供。（请妥善保管，避免通道被盗用）。	|
|packageName	|应用包名	|


### 返回消息模板 templates
主要在cloud-payment中，处理返回值，达到国际化效果，大括号中的变量可以去掉，但不能更改为其他字符串，否则无法识别参数  

|字段	|说明	|
|--	|--	|
|payment	|支付相关	|
|order	|订单相关	|
|system	|系统	|


```
{
	"domain": "http://www.mydomain.com",//设置URL的域名部分
	"notify-floder": "market_notify",//设置URL的PATH部分，！！！注意这里没有前面的斜杠！！！
	"app-plus": {
		"payment": {
			"alipay": {
				//https://uniapp.dcloud.io/uniCloud/unipay?id=%e6%94%af%e4%bb%98%e5%ae%9d%e6%94%af%e4%bb%98
				"uniPay": "initAlipay",
				"name": "支付宝",
				"appId": "201916540934089",//当前应用在对应支付平台的 appId
				"mchId": "15295677371",//商户号
				"privateKey": "MIIEvgIBADANBgkqhki",//私钥
				"alipayPublicKey": "MIIBIjANBgkqhkiG"//公钥
			},
			"wxpay": {
				//https://uniapp.dcloud.io/uniCloud/unipay?id=%e5%be%ae%e4%bf%a1%e6%94%af%e4%bb%98
				"uniPay": "initWeixin",
				"name": "微信",
				"appId": "weixin appid",//当前应用在对应支付平台的 appId
				"mchId": "15295677371",//商户号
				"key": "f750595974cd90718a452242",//支付商户 md5 key
				"pfx": ""//微信支付商户 API 证书，主要用于退款,这里只填写名称，例如：abcdef.p12
			},
			"balance": {
				"uniPay": "initBalance",
				"name": "余额"
			},
			"delivery": {
				"uniPay": "initDelivery",
				"name": "货到付款"
			}
		},
		"oauth": {
			//极光一键登录
			"jiguang": {
				"url": "https://api.verification.jpush.cn/v1/web/loginTokenVerify",//请求地址，不需要改
				"Authorization": "Basic ZDM1ZGM2OjNmZTRlNWMxOTcxZGQyY2ZjM2FiOWEzMQ==",//认证加密
				"publicKey": "-----BEGIN PUBLIC KEY-----MIGDAQAB-----END PUBLIC KEY-----",
				"privateKey": "-----BEGIN PRIVATE KEY-----+jtO4dgJ/R7==-----END PRIVATE KEY-----"
			}
		}
	},
	"mp-weixin": {
		"payment": {
			"wxpay": {
				"uniPay": "initWeixin",
				"name": "微信",
				"appId": "wx399393ad0d5e4d31",
				"mchId": "1576725141",
				"key": "xQHSfantYNGFZ6pwDLuesv4qGRmWNBnZ",
				"pfx": ""
			},
			"balance": {
				"uniPay": "initBalance",
				"name": "余额"
			},
			"delivery": {
				"uniPay": "initDelivery",
				"name": "货到付款"
			}
		}
	},
	"mp-alipay": {
		"payment": {
			"alipay": {
				"uniPay": "initAlipay",
				"name": "支付宝",
				"appId": "alipay appid",
				"privateKey": "alipay privateKey",
				"alipayPublicKey": "alipay publicKey"
			},
			"balance": {
				"uniPay": "initBalance",
				"name": "余额"
			}
		}
	},
	"h5": {
		"payment": {
			"balance": {
				"uniPay": "initBalance",
				"name": "余额"
			},
			"delivery": {
				"uniPay": "initDelivery",
				"name": "货到付款"
			}
		}
	},
	//优化后，可能会去掉
	"printer": {
		"yilianyun": {
			"clientId": "1053604898",
			"clientSecret": "99817dd9d3f7d0b29c5981ccedd2b214"
		}
	},
	"service": {
		"sms": {
			"templateId": {
				"login": "10190"//登录短信模板id
			}
		}
	},
	"push": {
		"default": {
			"appId": "N5wQHWUKnv8POOTCnGtFU8",
			"appkey": "t318VmJI2p84991gl61VY4",
			"appSecret": "wF9SqqDvk3ANRMoMtrbPm1",
			"mastersecret": "udzQP1wLwWAQEeozJgYZ15",
			"packageName": "com.gengyun"
		}
	},
	"templates": {
		"payment": {
			"error": "支付方式错误",
			"notExist": "支付方式不存在",
			"refundSuccessContent": "退款将退回至您的{payName}账户，请注意查收。",
			"balance": "可用余额￥{balance}",
			"balanceNotEnough": "余额不足",
			"balanceNotEnoughNotice": "余额不足，请选择其他支付方式"
		},
		"order": {
			"timeOut": "订单已超时",
			"canceled": "订单已取消",
			"paid": "订单已支付",
			"notExist": "订单不存在",
			"depositPaid": "已支付定金",
			"depositBody": "定金：{body}",
			"finalBody": "尾款：{body}",
			"refundSuccess": "退款成功",
			"refundSuccessCycle": "您的退款已受理完成，到账周期可查看退款明细。"
		},
		"system": {
			"error": "系统错误，请联系店主",
			"notfund": "暂无数据",
			"success": "操作成功"
		}
	}
}
```
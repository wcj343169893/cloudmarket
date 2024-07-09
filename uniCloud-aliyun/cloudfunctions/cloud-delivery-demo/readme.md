### 正确的返回值
```
{"data":{"iv":"qSM6JGyTAiiK+RIa","data":"MblqdaOPhhwnTfQbe+8qkkx5PWYzThDao82yoFr2NFMuUIToaCsXA4+K+koWljnOdNGrKapUtaTTTC9SdzF2GYriy+uUW2oyQjrXH7hJ0piyb3G05HRY9ba3wOmR+QSt8G9xW7nCmlDBFaueuql5XYe6iOpjT5WO6w==","authtag":"l6VijpcjB9peBYjtRDodgg=="},"status":200,"headers":{"connection":"keep-alive","content-type":"text/plain","date":"Tue, 09 Jul 2024 06:31:28 GMT","wechatmp-appid":"wxcfb12cd3b92a58ed","wechatmp-timestamp":"1720506688","wechatmp-serial":"16f007dfff8e99fb4c179efe246eb710","wechatmp-signature":"R4Mo6RXyYDRkSzwyX/7l5ndkwv4pG+CVxMmeamKWDJ3d96enff7z1B0JtsHd3JHPRhICatpNed0VTEm2FQvqbZ60zL9iYD8z6P1Y4S+V3+u/CpiWcFsO7801lQyvikcjb5m0mRIDj7GCfbDbtOlpiMWH1NgLcRUXx4Ap3tVkjrISjtDpWoEvyCBZywi5hBZAxf5AAkuxFEikDswzTKiMmlpIXTHFSgjri0vziA5WbZqim4cn90rQhe2Yzlo7MemCnIG51vL9iII9LP7iRn8WIGfebK1VZHh6LNLzbBP57djsX+BQMLHTpajzEHclzLJxgoG+4B15XlsXE8gJQx7yZw==","content-length":"236"},"res":{"status":200,"statusCode":200,"statusMessage":"OK","headers":{"connection":"keep-alive","content-type":"text/plain","date":"Tue, 09 Jul 2024 06:31:28 GMT","wechatmp-appid":"wxcfb12cd3b92a58ed","wechatmp-timestamp":"1720506688","wechatmp-serial":"16f007dfff8e99fb4c179efe246eb710","wechatmp-signature":"R4Mo6RXyYDRkSzwyX/7l5ndkwv4pG+CVxMmeamKWDJ3d96enff7z1B0JtsHd3JHPRhICatpNed0VTEm2FQvqbZ60zL9iYD8z6P1Y4S+V3+u/CpiWcFsO7801lQyvikcjb5m0mRIDj7GCfbDbtOlpiMWH1NgLcRUXx4Ap3tVkjrISjtDpWoEvyCBZywi5hBZAxf5AAkuxFEikDswzTKiMmlpIXTHFSgjri0vziA5WbZqim4cn90rQhe2Yzlo7MemCnIG51vL9iII9LP7iRn8WIGfebK1VZHh6LNLzbBP57djsX+BQMLHTpajzEHclzLJxgoG+4B15XlsXE8gJQx7yZw==","content-length":"236"},"size":236,"aborted":false,"rt":1295,"keepAliveSocket":false,"data":{"iv":"qSM6JGyTAiiK+RIa","data":"MblqdaOPhhwnTfQbe+8qkkx5PWYzThDao82yoFr2NFMuUIToaCsXA4+K+koWljnOdNGrKapUtaTTTC9SdzF2GYriy+uUW2oyQjrXH7hJ0piyb3G05HRY9ba3wOmR+QSt8G9xW7nCmlDBFaueuql5XYe6iOpjT5WO6w==","authtag":"l6VijpcjB9peBYjtRDodgg=="},"requestUrls":["https://api.weixin.qq.com/cgi-bin/express/intracity/apply?access_token=82_EmYtJKiiwxX8g-rm62btG7fetczsWlYypBZwOESXVNQhARElD22pFpOx3uYDCgjumphsFg3y-xjEsthg4psTJjaP4stBwGV60aAG5LB2HXcu32BLtqoWsiTRdCIUBFgAAAKRV"],"timing":null,"remoteAddress":"183.2.143.222","remotePort":443,"socketHandledRequests":1,"socketHandledResponses":1}}
```
### 解密结果
```
{"errcode":0,"errmsg":"ok","_n":"a20505031aa5c9e301e0cd8a481870c7","_appid":"wxcfb12cd3b92a58ed","_timestamp":1720506688}
```

### 创建店铺成功
```
{
	"errcode": 0,
	"errmsg": "ok",
	"wx_store_id": "4000000000013832002",
	"appid": "wxcfb12cd3b92a58ed",
	"out_store_id": "10000",
	"_n": "a20505031aa5c9e301e0cd8a481870c7",
	"_appid": "wxcfb12cd3b92a58ed",
	"_timestamp": 1720510989
}
```

### 获取门店列表
```
{
	"errcode": 0,
	"errmsg": "ok",
	"appid": "wxcfb12cd3b92a58ed",
	"store_list": [{
		"wx_store_id": "4000000000013832002",
		"out_store_id": "10000",
		"city_id": 500000,
		"address_info": {
			"province": "重庆市",
			"city": "重庆市",
			"area": "南川区",
			"street": "",
			"house": "西街佳苑6-6号",
			"lat": 29.139011,
			"lng": 107.008728,
			"phone": "18883380303"
		},
		"order_pattern": 1,
		"service_trans_prefer": ""
	}],
	"_n": "a20505031aa5c9e301e0cd8a481870c7",
	"_appid": "wxcfb12cd3b92a58ed",
	"_timestamp": 1720511173
}
```
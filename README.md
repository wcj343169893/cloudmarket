## 云上商城 
身边的线上生活超市，根据当前定位，就近匹配仓库，类似现有的app，如：盒马鲜生，美团买菜，叮咚买菜，朴朴超市，永辉买菜，平价买菜。  
目前已完成**客户用户使用界面**，**手机版店铺管理**，其他功能正在紧张开发中，后续会完善PC店铺管理，骑手端，供应商端  

### 咨询与售后
* 交流QQ群：298724327  
* 如您已购买本产品，请联系作者加入售后群，联系作者QQ：343169893   

### 柔然科技承接软件定制开发
* 联系人：文经理
* QQ：343169893

### 自动导入步骤
1. 点击购买或者试用
2. 选择绑定服务空间，支持阿里云和腾讯云
3. 勾选``立即部署本插件的云函数到服务空间,立即根据本插件包含的db_init.json初始化服务空间的数据库``,点击直接部署服务空间，如果提示有存在模块，覆盖并重新部署，然后泡一杯茶，静静等待  
4. 导入到HBuilderX
5. 查看云端函数是否与本地一直，如果不同，则把没有的上传  
6. 查看数据库是否与db_init.json一致  

### 手动导入步骤
1. 右键执行`db_init.json`导入测试数据。如果多次导入，会提示集合冲突或者id冲突，需要全部删除，再导入  
2. 上传所有云函数，如果存在报错，请删掉云端所有云函数，先一个个上传公共函数，再上传普通函数，因为普通函数在上传后，会安装公共函数，如果找不到，就安装失败了  

### 非必要步骤
1. 一键登录：本项目引入了[极光一键登录](https://ext.dcloud.net.cn/plugin?id=1356)，0元购买后才能使用，然后到官网申请对于的key，再修改manifest.json，app原生插件-->选择云端插件，再打自定义基座。  
2. 支付功能：/cloudfunctions/common/configs/config.json，配置微信和支付宝参数，[文档](https://uniapp.dcloud.io/uniCloud/unipay)  
3. 推送：/cloudfunctions/unipush/index.js，[文档](https://uniapp.dcloud.io/api/plugins/push)  
4. 小程序配置：/cloudfunctions/common/configs/config.json

### 基本功能
1. 首页广告（优先当前店铺，再是全局），推荐分类，秒杀商品，最新商品，定位管理，商品搜索
2. 分类页，所有分类和商品联动
3. 购物车，增减购物车商品数量，清空，结算，支持微信、支付宝、余额付款
4. 我的，个人信息修改，头像修改，订单列表，商品浏览记录，地址管理，退出登录
5. 商品详细信息，加入购物车，立即购买，提前预定
6. 店铺商品管理，新增、修改、上架、下架、删除、清理
7. 店铺订单管理

### 系统图标
用了2个ttf图标文件，用[百度字体编辑器](http://fontstore.baidu.com/static/editor/index.html)可以查看和编辑字体，用法  
```<text class="yticon icon-dingwei"></text>```  
**yticon.ttf**主要用在pages.json，定义顶部操作图标  
![yticon.ttf](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/1c6deb20-cc7f-11ea-b997-9918a5dda011.jpg) 
**yticon2.ttf**主要用在App.vue 文字图标  
[预览字体](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/872f2160-d6e1-11ea-81ea-f115fe74321c.html)
### 抢先预览
uniCloud 有资源限制，如果获取不到数据属正常现象，稍后重试即可  

#### Android版本
![Android版本](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/6c427d90-e1f7-11ea-9dfb-6da8e309e0d8.png)

#### H5预览
![扫码体验](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/c2f3e1d0-cc7e-11ea-8bd0-2998ac5bbf7e.png)   

#### 微信小程序体验
![万德福超市](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/3d402b60-d7a6-11ea-9dfb-6da8e309e0d8.jpg)

#### IOS暂时没有开发者账号，没有发布

### 参考项目和包含插件
[uni-id](https://ext.dcloud.net.cn/plugin?id=2116)  
[uniPay](https://ext.dcloud.net.cn/plugin?id=1835)  
[极光认证官方SDK](https://ext.dcloud.net.cn/plugin?id=1356)  
[日期时间选择 DateTime](https://ext.dcloud.net.cn/plugin?id=1496)  
[搜索框组件](https://ext.dcloud.net.cn/plugin?id=94)  
[mix-mall 电商项目模版](https://ext.dcloud.net.cn/plugin?id=200)  
[国云商城](https://ext.dcloud.net.cn/plugin?id=2413)  

### 更新日志
#### 下次更新
* 增加商品海报
* 用户申请退款，商家审核退款

#### 1.0.3.17
* 增加打印机，支持：易联云wifi打印机，k4机型

#### 1.0.3.16
* **重大更改**，店铺增加``配送方式deliveryTypes[1配送到家deliveryHome，2自提selfRaising]``，放弃字段deliverySupportType，修改原订单deliveryType类型为字符串，必须删除原数据，否则无法保存  
* 独立支付模块cloud-payment，支持多种支付方式或者多种支付类型，舍弃原cloud-mall下的payment模块，舍弃cloud-payment-notify

#### 1.0.3.15
* 修改极光自动登录bug
* 增加商品条码

#### 1.0.3.14
更新db  

#### 1.0.3.13
* 接入uni-id
* 重构云函数结构，增加权限验证  

#### 1.0.3.12
* 增加文档管理，优化app必要文档
```
	app_service:"APP服务协议",
	app_goods_charge:"APP退换货原则",
	app_user_private:"APP隐私政策",
```
* 增加预计送货到达时间
* 店铺增加免费送货距离，超过之后按每公里增加费用
* 店铺支持自提，提货码,店铺增加字段deliverySupportType支持的配送方式，
* 首页新品增加加入购物车

#### 1.0.3.11
* 增加商品副标题，优化db_init.json
* 增加商品秒杀管理
* 增加店铺首页广告图管理,支持跳转网站，商品详细页
* 店铺增加起送费，配送费，配送范围delivery等

#### 1.0.3.10
* 增加限时抢购购物车，增加云函数判断商品限购
* 增加商品图文介绍,图片地址之间用分号隔开，在商品详情页面，再分割显示
* 增加商品分类管理

#### 1.0.3.9
* 合并功能有关联的云函数，例如goods，login，
* 优化支付流程，payInfo，payment，paymentNotify
* 增加价格小数点处理过滤器

#### 1.0.3.8
* 增加商品预售
* 优化首页，分类页，商品详情页价格显示
* 增加每日首次启动自动检测升级，设置页面手动检测，参考插件：[云函数实现App的升级检查](https://ext.dcloud.net.cn/plugin?id=2226)

#### 1.0.3.7
* 优化后台云函数结构，由一个函数作为入口，有利于提高访问效率、用户登录权限验证，操作权限验证，统一处理公共参数，例如：shopid，page，limit，operator，[官方优化建议](https://uniapp.dcloud.io/uniCloud/faq?id=%e4%ba%91%e5%87%bd%e6%95%b0%e8%ae%bf%e9%97%ae%e6%97%b6%e5%bf%ab%e6%97%b6%e6%85%a2%e6%80%8e%e4%b9%88%e5%9b%9e%e4%ba%8b%ef%bc%9f)，后台函数理论上不会出现高并发情况。  
* 增加商品上下架功能，新增goods字段```isSold:1```,1在售，0下架。新增删除goods表，goods_deletes   
	```
	//单独一个云函数执行一次，批量更新字段值为上线状态
	return await db.collection('goods').where({
		_id:cmd.exists(true)
	}).update({
		isSold:1
	});
	```
* 增加店铺商品管理，新增、修改、上架、下架、删除、清理
* 只有10000用户才有管理店铺权限，登录后，--->我的-->我的门店

#### 1.0.3.6
* APP增加手机号+验证码登录，在自动登录检测失败情况下。
* 增加login公共函数，优化jgLogin自动登录和login手机号+验证码登录，同时调用此函数。
* 修改首页定位信息，兼容百度地图

#### 1.0.3.5
增加首次下单店铺为用户邀请者(settlement)，为将来给邀请者分成做准备  
店铺shops增加店主uid字段  
降低全局shopId权重，在商品详情，购物车，订单详情，单独传递店铺id，为将来多店铺做准备  
**重要，微信个人用户申请的小程序，无法上架**，如需体验，请下载app

```
1: 小程序服务提供的内容涉及电商模式（如：含购物车或涉及订单按钮，含立即购买流程等），属于个人小程序未开放内容，建议选择申请企业主体小程序。
```
小程序首页图  
![首页预览图](https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/apk/微信图片_20200622181329.jpg)
#### 1.0.3.4
默认可以直接使用腾讯自定义登录，cloud.js实际上没什么用处，但是云函数，只能init初始化后再使用。
增加微信小程序兼容，页面与APP端有一定的差别，打开小程序，默认注册新用户，只是没有获取用户的详细信息，使用说明：
1. 申请小程序 appId和secret
2. 填入micLogin
3. 修改manifest.json填入小程序appId

#### 1.0.3.3
优化首页文件图标，用[百度字体编辑器](http://fontstore.baidu.com/static/editor/index.html)，很方便
#### 1.0.3.2
增加markdown说明文档打开页面（首页：最快2小时送达  0起送费。。。）,新增集合`documents`，字段`{_id,title,content}`,  
增加app内打开http网址，（首页：新人专属福利,跳转到[我的博客](https://www.cjblog.org)）,  
去掉有问题的云认证退出方法`auth.signOut()`
#### 1.0.3 
增加首页和分类页商品搜索，
shops集合需增加数组字段
```
 "searchGoodsKeywords": [
    "车厘子",
    "杏子",
    "葡萄"
  ],
```
#### 1.0.2 
 基本完成用户端界面和功能
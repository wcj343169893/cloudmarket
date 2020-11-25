## 云上商城 
身边的线上生活超市，根据当前定位，就近匹配仓库，类似现有的app：盒马鲜生，美团买菜，叮咚买菜，朴朴超市，永辉买菜，平价买菜。  
目前已完成**客户用户使用界面**，**手机版店铺管理**，其他功能正在紧张开发中，后续会完善PC店铺管理，骑手端，供应商端  

### 咨询与售后
* 交流QQ群：298724327  
* 如您已购买本产品，请联系作者加入售后群，联系作者QQ：343169893   

### 柔然科技承接软件定制开发
* 联系人：文经理
* QQ：343169893

### 自动导入步骤
1. 点击购买或者试用
2. 选择绑定服务空间，支持阿里云和**腾讯云**(强烈推荐)
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
3. 推送：/cloudfunctions/common/configs/config.json push节点，[文档](https://uniapp.dcloud.io/api/plugins/push)  
4. 小程序配置：/manifest.json
5. 开启自动取消过期订单定时器，cloud-cron-cancel-orders，增加定时器触发``[{"name":"cancelOrderTrigger","type":"timer","config":"12 * * * * * *"}]``,每分钟执行一次
6. 支付通知,开启cloud-payment **云函数URL化**，设置跳转路径为``market_notify``,与configs配置里面``notify-floder``一致，再复制**设置URL的PATH部分**到configs配置domain
7. 手动导入1000多条商品，在云函数 ``cloud-database`` 右键，上传并执行，将导入数据到 123457店铺
8. 短信配置，/cloudfunctions/common/uni-id/config.json 修改service.sms，填上name、key和secret，在/cloudfunctions/common/configs/config.json中填写登录模板id


### 小程序配置
1. request合法域名
```
https://api.bspapp.com;https://apis.map.qq.com;https://cos.ap-shanghai.myqcloud.com;https://tcb-api.tencentcloudapi.com;https://at.alicdn.com;https://cdn.cjblog.org;
```
2. uploadFile合法域名
```
https://api.bspapp.com;https://cos.ap-shanghai.myqcloud.com
```
3. 腾讯地图key，在[key管理](https://lbs.qq.com/dev/console/key/manage)，添加新秘钥，启用产品：微信小程序，填写自己的小程序key，启用webServiceApi，其他不用填写，直接保存，然后填写到``/config.json``中


### 配置文件说明
详见云函数目录下，[/cloudfunctions/common/config/README.md](https://github.com/wcj343169893/cloudmarket/blob/master/cloudfunctions-tcb/common/configs/README.md)

### 基本功能
#### 客户端 
1. 首页广告（优先当前店铺，再是全局），分类banner广告，推荐分类，秒杀商品，最新商品，定位管理，商品搜索
2. 分类页，所有分类和商品联动
3. 购物车，增减购物车商品数量，清空，结算，支持微信、支付宝、余额付款
4. 我的，个人信息修改，头像修改，订单列表，商品浏览记录，地址管理，退出登录
5. 商品详细信息，加入购物车，立即购买，提前预定
6. 统一下单模块cloud_payment
7. 接入第三方配送平台一城飞客，支持：达达，美团、蜂鸟、顺丰、京东、闪送、UU跑腿
8. 极光一键登录 

#### 移动端后台（运营人员）
1. 商品管理，新增、修改、上架、下架、删除、清理
2. 订单管理，发货，打印小票（支付飞蛾云和易联云），线下提货
3. 用户管理，手动充值
4. 分类管理
5. 店铺经营数据统计（开发中）
6. 营销管理，秒杀活动
7. 广告管理
8. 文档管理
9. 店铺设置，基本信息，配送方式，打印机，页面参数，评论标签

### 系统图标
用了3个ttf图标文件，用[百度字体编辑器](http://fontstore.baidu.com/static/editor/index.html)可以查看和编辑字体，用法  
```<text class="yticon icon-dingwei"></text>```  
**yticon.ttf**主要用在pages.json，定义顶部操作图标  
**yticon2.ttf**主要用在App.vue 文字图标  
[预览字体](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/872f2160-d6e1-11ea-81ea-f115fe74321c.html)  
[手机淘宝图标库](http://market.cjblog.org/font_2174075_cl718eoy90k/demo_index.html)
```<text class="taobaofont icon-activity"></text>```  



### 抢先预览
uniCloud 有资源限制，如果获取不到数据属正常现象，稍后重试即可  

#### Android版本
![Android版本](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/7dfbf1b0-0c81-11eb-9dfb-6da8e309e0d8.png)

#### H5预览
![扫码体验](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/c2f3e1d0-cc7e-11ea-8bd0-2998ac5bbf7e.png)   

#### 微信小程序管理后台，审核通过后微信没有通知，请间隔10分钟左右再次扫码或者联系群主
![管理后台体验](https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/apk/oXpHq0ASLsN6cYLKaTIYG1dlnGAM.jpg)  

#### 微信小程序-万德福超市
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
#### 日后更新
* 商家pc后台
* 供应商报价

#### 2.1.3
* 增加团长佣金
* 完成自提点提货

#### 2.1.2
* 增加云函数工具类
* 修改已删除订单统计
* 增加自提点商品导出，结合pc后台

#### 2.1.1
* 升级uni-id,调整验证码表名（这个调整导致了与旧版不兼容），如果要使用此版本需要在数据库中创建opendb-verify-codes表（建议直接选择opendb内uni-id下的opendb-verify-codes表，会自动创建索引以及表结构）
* 优化店铺订单统计

#### 2.1.0
* 增加自提点，添加表``cloud_self_raising_points``
* 店铺增加待收货订单，优化退款中和已退款订单
* 增加自提点20%

#### 2.0.18
* 增加扫码修改商品

#### 2.0.17
* 优化用户界面
* 店铺设置剩余支付时间
* 优化自提订单联系人和电话
* 修复商品管理bug
* 优化会员卡申请
* 优化读取支付配置
* 优化商品退款审核

#### 2.0.16
* 优化会员卡，小程序分享

#### 2.0.15
* 增加商城全局class
* 增加上下架店铺所有商品
* 增加超市会员卡，设置/cloudfunctions/common/configs/config.json，配置user.autoSetId:false，/config.js vipCard.enable:true
* 自提订单增加姓名和手机号
* 优化店铺文档，商品，订单

#### 2.0.14
* 增加云函数计算配送距离，不需要可以不调用，
* 修改附近地址列表为腾讯sdk，
* 增加配置用户id是否自动生成，完善专题创建(45%)，
* 商品列表支持多选

#### 2.0.13
* 订单增加下单用户昵称，头像
* 引入[手机淘宝图标库](http://market.cjblog.org/font_2174075_cl718eoy90k/demo_index.html) [原地址](https://www.iconfont.cn/collections/detail?spm=a313x.7781069.1998910419.d9df05512&cid=33)
* 新增专题团购表``cloud_goods_special_activities``，商品自动增加相应字段，方便查询
~~~
 "special": {
    "beginTime": 1588313782526,
    "endTime": 1687980992114,
	"title":"标题",
    "id": "5e75bd15b1e432104d1dbbce"
  },
~~~
* 增加店铺预览（全站切换站点），点我的门店-->店铺图标 进行切换

#### 2.0.12
* 增加小程序首页位置显示
* 优化店铺管理首页

#### 2.0.11
* 修改打印bug，
* 提取腾讯地图计算距离key

#### 2.0.10
* 骑手端，接入第三方配送平台[一城飞客](http://www.canqu.com.cn/)，支持：达达，美团、蜂鸟、顺丰、京东、闪送、UU跑腿
* 优化token快到期之前，自动刷新问题
* 修改店铺统计bug 
* 增加小程序分享给朋友，带店铺id

#### 2.0.9
* 增加新店铺``cloud-databases``，增加12个分类，1571种商品，文档，广告
* 修改支付模板bug

#### 2.0.8
* 优化小程序端商家后台

#### 2.0.7
* 增加店铺统计表``cloud_shop_statistics``
* 增加店铺今日实时数据统计

#### 2.0.6
* 增加配置文件说明
* 增加支付模块国际化消息
* 增加小程序用户中心授权获取当前用户信息
* 修复店铺推送，只要是管理者，都可以接收

#### 2.0.5
* 增加首页banner广告位，规范广告打开方式
* 升级uni-id，修改首页bug

#### 2.0.4
* 增加云函数初始化配置，最低hb支持2.9.3
* 修复cloud-mall中，引入payment问题

#### 2.0.3
* 修复配送费计算bug
* 增加新订单消息推送（店主使用Android登录）

#### 2.0.2
* 增加登录短信模板id，必须提前报备，[报备地址](https://dev.dcloud.net.cn/uniSms/tmp)
* 解决微信支付outTradeNo重复问题
* 分离预定订单定金处理，支持排除哪些支付方式，预防薅羊毛
* 修复极光一键登录，短信登录
* 优化cloud-payment支付模块，更好的支持多种支付方式，多种订单类型，灵活选择支付方式

#### 2.0.1
* 增加表``cloud_goods_comments``
* 完善商品评论

#### 2.0
* 完善分类页面
* 增加首页推荐
* 修复商品页预定价格
* 增加店铺分类图标裁剪

#### 1.0.3.30
* 增加分类下架，所属商品一并下架，``{isCategoryShow:1}``
* 优化预定订单退款，增加微信登录
* 团购商品，如果未开始，不允许下单，但可以加入购物车，如果在结束之后未下架，用户按原价购买
* 增加商家端退款历史记录

#### 1.0.3.29
* 完善订单退款流程，增加退款到账户定时器，支持各种类型order的退款，``cloud-payment`` 增加定时器触发``[{"name":"refund","type":"timer","config":"18 1/10 * * * * *"}]``，处理资金到账
* 增加账户余额日志

#### 1.0.3.28
* 增加首页配置，写入店铺信息中，可修改标题和显示数量，如果数量为0，则不显示
```
"page": {
    "home": {
      "limits": {
        "miaosha": 2,
        "newest": 10,
        "tuangou": 3,
        "yuding": 4,
		"ads":5,
		"category":10
      },
      "titles": {
        "miaosha": "秒杀抢购",
        "newest": "鲜货排行",
        "tuangou": "社区团购",
        "yuding": "提前预定"
      }
    }
  },
```
* 用户申请退款，商家审核退款

#### 1.0.3.27
* 增加货到付款支付类型
* 兼容uni-id 邀请裂变
* 优化分类点击主要分类错误的bug
* 增加后台商品搜索，用户搜索，订单搜索，文档搜索

#### 1.0.3.26
* 用户管理

#### 1.0.3.25
* 优化社区团购
* 优化购物车

#### 1.0.3.24
* 社区团购
* 优化首页秒杀

#### 1.0.3.23
* 商品分类增加是否显示 ``"isShow":1,``
* 增加打印机类型表``cloud_printer_types``，支持易联云k4和飞蛾云

#### 1.0.3.22
* 增加手动输码验证自提订单
* 增加复制商品
* 修改订单bug

#### 1.0.3.21
* 增加手动输码验证自提订单
* 增加复制商品

#### 1.0.3.21
* 增加店铺配送参数
* 优化用户订单详情，首页商品

#### 1.0.3.20
* 优化分享邀请

#### 1.0.3.19
* 移除历史残留目录
* 优化首页登录后操作

#### 1.0.3.18
* 优化app自动升级，小程序商品页分享，小程序头像修改，店铺订单打印小票

#### 1.0.3.17
* 增加打印机，支持：易联云wifi打印机，k4机型
* 优化文件上传，兼容阿里和腾讯
* 解决公共函数依赖问题：如果依赖没有修改，不重新安装，解决办法：删除云端所有函数，重新上传

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
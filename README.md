## 云上商城 
云上商城是结合uniapp+unicloud+uni-id前后端一体的多商户电商系统，支持发布成APP、h5、小程序，系统根据用户当前定位或者收货地址，匹配最近的一个店铺，为用户提供最方便的服务，类似现有的app，如：盒马鲜生，美团买菜，叮咚买菜，朴朴超市，永辉买菜，平价买菜。


### 支持行业
• 社区团购  
• 国际电商  
• 生鲜电商  
• 连锁便利店、餐饮店  


### 体验商城前端+移动端后台
[点此进入app发行页面](https://m3w.cn/xbb)，体验h5，app，微信小程序，包含移动端管理  

![管理后台](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-d73fd249-2f15-4133-9d70-e4017004b14c/22b63100-92b4-494e-b521-e1fc94c5433e.jpg?x-oss-process=image/resize,m_fill,w_200,h_200) 

### pc后台
[http://xbb.cqsort.com/admin/](http://xbb.cqsort.com/admin/)  
测试账户：shop_manager  
测试密码：123456  
已经完全开源，详见后台插件-[商城后台管理系统](https://ext.dcloud.net.cn/plugin?id=4400)  

### 咨询与售后
* 交流QQ群1：298724327（已满员）  
* 交流QQ群2：201826223
* 如您已购买本产品，请联系作者QQ：343169893   

### 柔然科技承接软件定制开发
* 联系人：文经理
* QQ：343169893
* [柔然科技官网](http://www.cqsort.com/)


## 安装使用 
##### 试用安装步骤：  
1. 插件市场点击“导入插件并试用”
2. 绑定一个云空间
3. “跳过”在线部署，继续导入HBuilderx
4. 在导入后的项目中，uniCloud目录右键，选择“云服务空间初始化向导”，再次绑定试用的云空间
5. 勾选云函数、公共模块、db_init.json后，再“开始部署”，等待自动完成  在自动部署过程中，可能存在一些红色的错误提示，可以再次尝试这个自动安装向导，如果都不能成功，请加群找群主协助解决
6. 登录测试账号：16612345678，密码：123456

##### 源码安装步骤：  
1. 插件市场点击“导入源码授权版插件”
2. 在导入后的项目中，uniCloud目录右键，选择“云服务空间初始化向导”，再次绑定试用的云空间
3. 勾选云函数、公共模块、db_init.json后，再“开始部署”，等待自动完成  在自动部署过程中，可能存在一些红色的错误提示，可以再次尝试这个自动安装向导，如果都不能成功，请加群找群主协助解决
4. 登录测试账号：16612345678，密码：123456




#### 微信小程序：  
##### 安装视频：  
https://v.qq.com/x/page/n3224rpjd2w.html  
https://v.qq.com/x/page/t3224pz1q7g.html 
##### 安装步骤
1. 首先完成“使用安装”或者“源码安装”
2. 修改manifest文件，微信小程序配置appid
3. 修改后台登录参数unicloud/cloudfunctions/common/uni-config-center/uni-id/config.json中，配置mp-weixin/oauth/weixin的appid和[appsecret](https://mp.weixin.qq.com/wxamp/devprofile/get_profile)，**修改后请上传**
4. 修改支付参数unicloud/cloudfunctions/common/configs/config.json，配置mp-weixin/payment/wxpay的appId（当前小程序appid）、mchId（微信支付商户号）、key（微信支付v2版的apikey）和pfx（微信支付v2版的证书，.p12文件），此节点下的balance或者delivery可以删除，需要注意标准JSON格式，不然配置不生效，**修改后请上传**
5. 修改微信小程序后台“开发管理”--“服务器域名”，填写下方链接，  
request合法域名
```
https://api.bspapp.com;https://apis.map.qq.com;https://cos.ap-shanghai.myqcloud.com;https://tcb-api.tencentcloudapi.com;https://at.alicdn.com;https://api.next.bspapp.com;  
```
uploadFile合法域名，阿里云正式版还需要填写“总览”里面的云存储上传域名
```
https://api.bspapp.com;https://cos.ap-shanghai.myqcloud.com;https://bsppub.oss-cn-shanghai.aliyuncs.com/;https://file-unirlhsrdn-mp-75aexxx-d2c1-4670-b6f6-377990c3f4d8.oss-cn-zhangjiakou.aliyuncs.com  
```
download合法域名，阿里云正式版还需要填写“总览”里面的云存储下载域名
```
https://api.bspapp.com;https://cos.ap-shanghai.myqcloud.com;https://bsppub.oss-cn-shanghai.aliyuncs.com/;https://mp-75aexxx-d2c1-4670-b6f6-377990c3f4d8.cdn.bspapp.com  
```
如果依然报跨域问题，就把报错的域名一并加上  
6. 到微信后台[申请小程序接口](https://mp.weixin.qq.com/wxamp/categoryapi/index)，“wx.chooseLocation”，“wx.getFuzzyLocation”
7. “运行”或者“发布”到微信开发者工具，如果不能成功打开，请按“控制台”指示，安装或者配置开发者工具


#### H5
1. 由于地图在h5中存在跨域问题，需要引入vue-jsonp前端插件，npm i vue-jsonp，如果安装失败，可以下载[此文件](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-d73fd249-2f15-4133-9d70-e4017004b14c/572a63bb-8a90-4249-a209-5af4aa6a15a3.rar)，node_modules解压到项目根目录
2. 完成“使用安装”或者“源码安装”

#### 安卓APP
1. 首先完成“使用安装”或者“源码安装”
2. 短信登录，到[开发者中心](https://dev.dcloud.net.cn/pages/sms/base)申请短信smsKey和smsSecret，填入到unicloud/cloudfunctions/common/uni-config-center/uni-id/config.json文件的service.sms中
3. 再申请签名和登录模板，签名为自定义名称，模板示例：验证码：${code}，${expMinute}分钟内有效，请勿泄露并尽快验证。

#### 进阶配置
1. uni一键登录，在[https://dev.dcloud.net.cn/](https://dev.dcloud.net.cn/)开通一键登录，并绑定app和服务空间，然后就可以了
2. 微信支付：/cloudfunctions/common/configs/config.json，配置微信和支付宝参数，unipay文档，config配置文档，
3. 微信支付通知,开启cloud-payment 云函数URL化，设置跳转路径为market_notify,与configs配置里面notify-floder一致，再复制设置URL的PATH部分到configs配置domain
4. unipush，到[https://dev.dcloud.net.cn/](https://dev.dcloud.net.cn/)，找到之前创建的应用，开通uniPush，并填入到configs/config中


 
### pc后台安装教程：  
https://v.qq.com/x/page/l3234qid9pf.html  
https://v.qq.com/x/page/i3235gxkkpz.html  

### 产品功能
#### 客户端  
1. 首页广告（优先当前店铺，再是全局），分类banner广告，店铺公告，推荐分类，秒杀商品，最新商品，定位管理，商品搜索，弹窗广告、领券中心
2. 分类页，所有分类和商品联动
3. 购物车，增减购物车商品数量，清空，结算，支持微信、支付宝、余额付款
4. 我的，个人信息修改，头像修改，订单列表，商品浏览记录，地址管理，退出登录、自提点管理、客服中心、账户日志、收入提现、优惠券管理
5. 商品详细信息，加入购物车，立即购买，提前预定，评论
6. 统一下单模块cloud_payment
7. 接入第三方配送平台一城飞客，支持：达达，美团、蜂鸟、顺丰、京东、闪送、UU跑腿
8. 手机号登录、uni一键登录、微信登录  

#### 移动端后台（运营人员）  
1. 商品管理，新增、修改、上架、下架、删除、清理、
2. 提货管理
3. 自提点管理
4. 订单管理，订单发货，线下提货
5. 用户管理，手动充值
6. 提现管理
7. 视频管理
8. 分类管理
9. 店铺经营数据统计（实时数据）
10. 营销管理，秒杀活动、优惠券、专题
11. 广告管理：首页弹窗、首页轮播、首页分类
12. 文档管理
13. 店铺设置，基本信息，页面参数，评论标签、经营货币、评论标签、店铺服务宗旨
14. 配送方式
15. 打印小票（支付飞蛾云和易联云）
16. 开分店

### 系统图标
用了3个ttf图标文件，用[百度字体编辑器](http://fontstore.baidu.com/static/editor/index.html)可以查看和编辑字体，用法  
```<text class="yticon icon-dingwei"></text>```  
**yticon.ttf**主要用在pages.json，定义顶部操作图标  
**yticon2.ttf**主要用在App.vue 文字图标  
[预览字体](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-market/872f2160-d6e1-11ea-81ea-f115fe74321c.html)  
[手机淘宝图标库](http://market.cjblog.org/font_2174075_cl718eoy90k/demo_index.html)  
```<text class="taobaofont icon-activity"></text>```  
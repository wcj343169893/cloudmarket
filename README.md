## 云上商城 
身边的线上生活超市，根据当前定位，就近匹配仓库，类似现有的app，如：盒马鲜生，美团买菜，叮咚买菜，朴朴超市，永辉买菜，平价买菜。  
后续会完善商家端，骑手端，供应商端  
本商城是基于[mix-mall 电商项目模版](https://ext.dcloud.net.cn/plugin?id=200)前端框架二次开发，增加云函数，成为一个完整的app，导入即可使用  
交流QQ群：298724327  

### 导入步骤
1. 免费启用[unicloud](https://uniapp.dcloud.io/uniCloud/README)，并选择腾讯云（里面涉及到geo和云认证，阿里云不支持）,[申请地址](https://unicloud.dcloud.net.cn/home)
2. 导入测试数据：执行`db_init.json`，**重要，重要，重要，**，有可能地理位置索引未导入成功，shops集合需增加地理位置索引，否则报错`unable to find index fo $geoNear query`，	**索引字段：lnglat，非唯一，地理位置**。其他集合自己看情况增加  
3. 上传所有云函数，注意查看上传日志，如果有报错，需要重新上传
4. 云认证：[文档](https://uniapp.dcloud.io/uniCloud/authentication)，官方回复目前云认证有问题，必须这样初始化unicloud，否则无法在服务端获取登录的customid  
	- 去这里[生成云token](https://unicloud.dcloud.net.cn/token),生成并下载，保存到/cloudfunctions-tcb/common/token/ 替换原来的credentials.json文件
	- 修改前端/common/cloud.js，spaceId填写自己当前项目的服务空间id，    
	- 修改云函数/cloudfunctions-tcb/common/token/index.js，spaceId   
5. 一键登录：本项目引入了[极光一键登录](https://ext.dcloud.net.cn/plugin?id=1356)，0元购买后才能使用,然后到官网申请对于的key，再修改manifest.json，app原生插件-->选择云端插件，再打自定义基座。也可以不使用此插件，用原始的登录框，但是要自己完善，  
默认：iOS和H5自动登录，id为10000，Android需要使用极光登录，也可以修改`/pages/public/login.vue`，`onload`方法
6. 支付功能：/cloudfunctions-tcb/common/configs/index.js，配置微信和支付宝参数，[文档](https://uniapp.dcloud.io/uniCloud/unipay)
7. 推送：/cloudfunctions-tcb/unipush/index.js，[文档](https://uniapp.dcloud.io/api/plugins/push)

### 基本功能
1. 首页广告（优先当前店铺，再是全局），推荐分类，秒杀商品，最新商品，定位管理，商品搜索
2. 分类页，所有分类和商品联动
3. 购物车，增减购物车商品数量，清空，结算，支持微信、支付宝、余额付款
4. 我的，个人信息修改，头像修改，订单列表，商品浏览记录，地址管理，退出登录
5. 商品详细信息，加入购物车，立即购买，提前预定

### 抢先预览
uniCloud 有资源限制，如果获取不到数据属正常现象，现在还没找到升级途径，官方公布
```
uniCloud 目前计费系统还未开发完毕，暂时免费。计费系统上线后，收费标准也会低于传统云主机租用费用
```

#### Android版本

![Android版本](https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/apk/apk_qrcode.png)

#### IOS暂时没有开发者账号，没有发布

### 更新日志
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
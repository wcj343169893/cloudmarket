## 云上商城 
身边的线上生活超市，根据当前定位，就近匹配仓库，类似现有的app，如：盒马鲜生，美团买菜，叮咚买菜，朴朴超市，永辉买菜，平价买菜，交流QQ群：298724327

### 导入步骤
1. 启用unicloud，并选择腾讯云（里面涉及到geo和云认证，阿里云不支持）
2. 导入测试数据：执行db_init.json，shops集合增加地理位置索引，否则有问题，索引字段：lnglat，非唯一。其他集合自己看情况增加
3.云认证： 修改/common/cloud.js，spaceId填写自己当前项目的服务空间id，目前云认证有问题，必须这样初始化unicloud，否则无法在服务端获取登录的customid，
修改/cloudfunctions-tcb/common/token/index.js，spaceId,[文档](https://uniapp.dcloud.io/uniCloud/authentication)
4. 一键登录：本项目引入了[极光一键登录](https://ext.dcloud.net.cn/plugin?id=1356)，0元购买后才能使用,然后到官网申请对于的key，再修改manifest.json，app原生插件-->选择云端插件，再打自定义基座。也可以不使用此插件，用原始的登录框，但是要自己完善
5. 支付功能：/cloudfunctions-tcb/common/configs/index.js，配置微信和支付宝参数，[文档](https://uniapp.dcloud.io/uniCloud/unipay)
6. 推送：/cloudfunctions-tcb/unipush/index.js，[文档](https://uniapp.dcloud.io/api/plugins/push)

### 基本功能
1. 首页广告（优先当前店铺，再是全局），推荐分类，秒杀商品，最新商品，定位管理，商品搜索
2. 分类页，所有分类和商品联动
3. 购物车，增减购物车商品数量，清空，结算，支持微信、支付宝、余额付款
4. 我的，个人信息修改，头像修改，订单列表，商品浏览记录，地址管理，退出登录
5. 商品详细信息，加入购物车，立即购买，提前预定

### 抢先预览

#### Android版本

![Android版本](https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/apk/apk_qrcode.png)

#### IOS暂时没有开发者账号，没有发布

### 更新日志
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
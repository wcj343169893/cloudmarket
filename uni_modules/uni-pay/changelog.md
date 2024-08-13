## 2.2.1（2024-06-06）
- 【优化】ios内购验证凭据失败时尝试使用相反的环境配置再次验证
- 【优化】支付宝小程序获取openid报错的提示
## 2.2.0（2024-03-11）
- 【重要】新增微信小程序虚拟支付 [配置参数](https://doc.dcloud.net.cn/uniCloud/uni-pay/uni-app.html#config-wxpay-virtual-mp) 、[代币充值](https://doc.dcloud.net.cn/uniCloud/uni-pay/uni-app.html#short-series-coin) 、[道具直购](https://doc.dcloud.net.cn/uniCloud/uni-pay/uni-app.html#short-series-goods)
## 2.1.5（2024-01-13）
- 【调整】删除 `db_init.json` 文件，使用新的数据库初始化方式（右键database目录-初始化云数据库）
- 【修复】解决了当未传 `out_trade_no` 时，可能会出现商户订单号重复的错误提示问题
## 2.1.4（2023-09-04）
- 【修复】支付宝小程序支付一进入页面获取openid时报签名错误的问题
## 2.1.3（2023-08-16）
- 【修复】ios内购`verifyReceiptFromAppleiap`接口pay_date变量值不是数字类型的bug
- 【优化】`createOrder`新增`fail`事件的触发
- 【优化】示例中 `ref="uniPay"` 改成 `ref="pay"` 以兼容vue3（vue3的ref值不可以是组件名）
## 2.1.2（2023-06-05）
- 【优化】支付宝小程序支付的细节处理
## 2.1.1（2023-05-31）
- 【修复】ios内购不支持自定义异步回调函数的问题
- 【优化】ios内购在丢失username时自动尝试从本地缓存中找回username
## 2.1.0（2023-05-29）
- 【新增】`refund_date` 字段，表示最近一次退款时间（每一次的退款时间可在refund_list内查看）
- 【优化】与java和php服务端通信的加密解密示例 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-pay.html#service-outside)
- 【优化】云对象的`_before`函数中，若为回调通知时，不执行uniId的token校验逻辑（因回调跟uniId插件没有关系，故不执行token校验逻辑）
## 2.0.7（2023-04-13）
- 【优化】appleiap支付的订单调用getOrder接口时做兼容性处理
## 2.0.6（2023-04-12）
- 【优化】当检测到证书错误时，则进行明确提示：支付证书错误
## 2.0.5（2023-03-28）
- 【重要】回调通知时，original_data字段的数据内容调整为http原始请求参数，使之更加符合（原始数据）的含义（原先是处理过后的数据），如果开发者在自己业务中有用到该字段，可能需要进行代码调整。
- 【修复】ios内购`verifyReceiptFromAppleiap`接口可能会报错的问题。
- 【优化】支付回调时自动同步支付方式
- 【调整】默认运行内存调整为512M
## 2.0.4（2023-02-22）
- 【修复】微信支付V3在使用腾讯云空间时会报错的问题
## 2.0.3（2023-01-13）
- 【优化】兼容从阿里云公测版迁移到阿里云正式版空间后，发起支付时可能会提示"请先配置正确的异步回调URL"的问题。
## 2.0.2（2022-12-12）
- 【修复】`createOrder`接口传了`other`参数后可能会报`snake2camelJson is not function`的问题。
## 2.0.1（2022-12-12）
- 【优化】补全package.json内的uni_modules依赖
## 2.0.0（2022-12-05）
- 【重要】uni-pay 2.0，从公共模块升级为包含前端页面、uni-pay-co云对象，让支付更加简单省心 [详情](https://uniapp.dcloud.net.cn/uniCloud/uni-pay.html)
## 1.1.1（2022-09-22）
- 修复 微信支付V3提示 appCert 不存在的bug
- 新增 微信支付V3可以通过证书字符串方式导入证书
## 1.1.0（2022-09-22）
- 新增 微信支付V3接口 [详情](https://uniapp.dcloud.io/uniCloud/unipay?id=微信支付v3)
## 1.0.29（2022-06-14）
- 修复app平台PLATFORM变更引起的支付报错的Bug
## 1.0.28（2022-01-10）
- 支付宝下单接口返回详细错误信息
- 优化发行包体积
## 1.0.27（2021-11-02）
- 新增 苹果应用内购买凭证校验接口 [详情](https://uniapp.dcloud.io/uniCloud/unipay?id=verifyreceipt)
## 1.0.26（2021-11-01）
- 新增 苹果内购凭证校验接口
## 1.0.25（2021-10-18）
- 修复微信子商户id参数错误的Bug
## 1.0.24（2021-09-23）
- 新增 微信外部浏览器支付（H5支付）
## 1.0.23（2021-09-22）
- 修复微信支付部分值被转化为NaN导致无法直接入库的错误
## 1.0.22（2021-08-26）
- 修复 支付宝用户未支付状态下查询订单状态（orderQuery）报错的Bug
## 1.0.21（2021-08-19）
- 修复1.0.18版本引出的微信退款通知验签失败的bug
## 1.0.20（2021-08-04）
- 修复1.0.19版本引出的微信支付签名错误问题
## 1.0.19（2021-08-03）
- 修复timeStamp大小写导致的微信公众号支付失败
## 1.0.18（2021-07-16）
- 通知类型不匹配时返回校验未通过
## 1.0.17（2021-07-16）
- 新增 支付宝退款通知回调 [详情](https://uniapp.dcloud.io/uniCloud/unipay?id=verify-refund-notify)
- 新增 判断通知类型接口 [详情](https://uniapp.dcloud.io/uniCloud/unipay?id=check-notify-type)
## 1.0.16（2021-07-14）
- 修复APP微信支付报签名错误的Bug
## 1.0.15（2021-07-13）
- 修复1.0.14版本引出的微信支付使用pfx时报错的Bug
## 1.0.14（2021-07-12）
- 支持使用微信子商户号，[详情](https://uniapp.dcloud.net.cn/uniCloud/unipay?id=init)，感谢[studytime](https://gitee.com/studytime)
- 修复支付宝支付传入encode后的passbackParams参数导致验签无法通过的Bug
## 1.0.13（2021-03-25）
- 修复 微信退款通知解析报错的Bug
## 1.0.12（2021-02-03）
- 调整为uni_modules目录规范

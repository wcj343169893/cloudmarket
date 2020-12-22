这是App升级检查的云函数实现示例，可用于开启`uniCloud`的`uni-app`项目，也可以用于传统的`mui`或`5+ App`项目。

使用说明：

1. 使用HBuilderX导入本插件到本地`uniCloud`项目中
2. 上传云函数到自己的服务空间
3. 修改`db_init.js`文件，修改appid及当前版本号，在`db_init.json`上右键初始化数据，更多用法参考[db_init.json规范](https://uniapp.dcloud.net.cn/uniCloud/cf-database?id=db)，初始数据示例如下：
```
{
  "uni-app-version": {
    "data": [{
      "_id":"bb83ad495efdddf9002e88e750d7049d",
      "appid": "__UNI__HelloUniApp",
      "name": "Hello uniapp",
      "android": {
        "note": "接入uni统计\n解决微信自定义组件运行失败的Bug",
        "title": "Hello uni-app更新",
        "url": "http://img.cdn.aliyun.dcloud.net.cn/guide/uniapp/HelloUniApp@v2.2.3.apk",
        "version": "2.2.3"
      },
      "ios": {
        "note": "增加权限判断\n实例首页重构为 nvue，提升渲染速度",
        "title": "Hello uni-app更新",
        "url": "https://itunes.apple.com/cn/app/hello-uni-app/id1417078253?mt=8",
        "version": "1.3.4"
      }
    }]
  }
}
```
4. 在开通`uniCloud`服务的前端项目中，调用检查更新，代码示例如下：

```
uniCloud.callFunction({
  name: 'chb-check-update',
  data: {
    appid: plus.runtime.appid
    version: plus.runtime.version
  },
  success(e) {
    if (e.result.isUpdate) {//需要更新
      // 提醒用户更新
      uni.showModal({
        title: '更新提示',
        content: e.result.note ? e.result.note : '是否选择更新',
        success: (ee) => {
          if (ee.confirm) {
            plus.runtime.openURL(e.result.url);
          }
        }
      })
    }
  }
})

```

5. 如果是mui或5+ 项目，也可以通过[云函数URL化](https://uniapp.dcloud.net.cn/uniCloud/http)实现App端的更新检查，客户端的调用代码如下：

```
//升级检查的服务器地址，可在uniCloud后台编辑查看
var server = "https://chb-tcb-01-51c845.service.tcloudbase.com/update"

function update() {
	mui.getJSON(server, {
		"appid": plus.runtime.appid,
		"version": plus.runtime.version
	}, function(data) {
		if (data.isUpdate) {
			plus.nativeUI.confirm(data.note, function(event) {
				if (0 == event.index) {
					plus.runtime.openURL(data.url);
				}
			}, data.title, ["立即更新", "取　　消"]);
		}
	});
}

mui.os.plus && !mui.os.stream && mui.plusReady(update);
```




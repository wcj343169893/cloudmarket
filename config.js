export default {
	qqmapWxKey: 'ZWYBZ-HOSWD-S2X4S-HHPBQ-YKY7Z-5NFK5', //腾讯地图小程序sdk key 配置域名白名单 https://apis.map.qq.com
	vipCard: {
		enable: false, //是否启用会员卡
		edit: false, //是否允许修改会员卡
		bgImage: "https://market-1251014159.cos.ap-beijing.myqcloud.com/vipcard2.jpg", //会员卡背景图
	},
	selfRaising: {
		apply: true, //是否启用团长申请
		distance: 5000 //自提点距离
	},
	appDocument: {
		//这里2个地址的源文件在unpackage/res下的fwxy.md和yszc.md，打开这两个文件，右键点击一键分享，即可自动生成地址，然后复制到这个地方
		app_service: "https://tian.cqsort.com/markdown-share-docs/93a71d4dbcaaff263e2124ed7a41ab76/",
		app_user_private: "https://tian.cqsort.com/markdown-share-docs/dfbd94e4bfac3ab82bf1c7e73e90bb75/",
	}
}

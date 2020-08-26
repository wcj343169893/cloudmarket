'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event);
	let imgs=[];
	goodsList.map(goods=>{
		//console.log(goods.src);
		goods.imgs.map(img=>{
			console.log(img);
		});
		/* if(goods.description && goods.description !=""){
			goods.description.split(";").map(de=>{
				console.log(de);
			});
		} */
	});
	//返回数据给客户端
	return false;
};


let goodsList = [{
	"_id": "99ee0d4152644f368f0001619e9c628e",
	"categories": [{
		"id": 1004,
		"name": "大分类一"
	}, {
		"id": 2002,
		"name": "小分类yi"
	}],
	"price": 127,
	"visite": 1339,
	"id": 10000,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/1.1.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/1.2.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/1.3.jpg"
	],
	"isSold": 1,
	"shopid": 123457,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/1.jpg",
	"stock": 336,
	"monthlySale": 151,
	"originPrice": 0,
	"score": 0.98,
	"description": "",
	"posid": 1,
	"title": "北京北寨红杏5斤包邮正宗平谷金太阳现摘新鲜孕妇水果杏子礼盒装",
	"miaosha": {
		"beginTime": 1589358599810,
		"endTime": 1598889600000,
		"id": "5e75bd15b1e402004d1dbbce",
		"limit": 2,
		"price": "97.79",
		"rate": 77,
		"sales": 56,
		"stock": 44
	},
	"deliveryTags": [],
	"modified": 1597893312783,
	"operator": "9ffb2a485f38964200999b1f07cb7b80",
	"subTitle": ""
}, {
	"_id": "cb1edbd6b6b149548723380ae750ebc7",
	"score": 0.98,
	"skuname": ["食品口味"],
	"id": 10001,
	"onlineTime": 1588401978119,
	"posid": 1,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/3-1.jpg",
	"visite": 255,
	"categories": [{
		"id": 1004,
		"name": "大分类一"
	}, {
		"name": "小分类二",
		"id": 2003
	}],
	"originPrice": 0,
	"price": 22.6,
	"shopid": 123457,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/3-2.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/3-3.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/3-4.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/3-5.jpg"
	],
	"miaosha": {
		"sku_id": 10004,
		"stock": 193,
		"beginTime": 1588313782526,
		"endTime": 1687980992114,
		"id": "5e75bd15b1e402104d1dbbce",
		"limit": 2,
		"price": 17.6,
		"sales": 12
	},
	"stock": 2279,
	"title": "新货新疆葡萄干500g特级超大无核绿葡萄干免洗即食新疆吐鲁番特产",
	"monthlySale": 120,
	"skus": [{
		"sales": 0,
		"stock": 283,
		"id": 10005,
		"name": "绿葡萄干精品大罐装500g",
		"price": 18.5
	}, {
		"id": 10000,
		"name": "三色葡萄干精品大罐装500g",
		"price": 18.8,
		"stock": 105,
		"sales": 0
	}, {
		"id": 10001,
		"name": "绿葡萄干精品大罐装【500gX2罐】",
		"price": 36,
		"sales": 0,
		"stock": 117
	}, {
		"id": 10002,
		"name": "三色加绿色各一罐【500gX2罐】",
		"price": 38,
		"stock": 894,
		"sales": 0
	}, {
		"stock": 687,
		"id": 10003,
		"name": "绿葡萄干精品大罐装【500gX4罐】",
		"price": 68,
		"sales": 18
	}, {
		"stock": 193,
		"id": 10004,
		"name": "绿葡萄干（250gX2袋）",
		"price": 22.6,
		"sales": 8
	}],
	"isSold": 1
}, {
	"_id": "1746c490997e47aaa08f3673cbdc5509",
	"categories": [{
		"id": 1004,
		"name": "大分类一"
	}, {
		"id": 2003,
		"name": "小分类二"
	}],
	"monthlySale": 55,
	"skus": [{
		"id": 10000,
		"name": "10斤",
		"price": 29.9,
		"sales": 1,
		"stock": 743
	}, {
		"id": 10003,
		"name": "20斤",
		"price": 49.9,
		"stock": 880,
		"sales": 0
	}],
	"title": "安徽砀山黄桃10斤新鲜现摘黄心脆甜蜜桃子应当季时令水果整箱包邮",
	"id": 10003,
	"price": 29.9,
	"stock": 2351,
	"visite": 39,
	"manjian": {
		"_id": "444444",
		"condition": "quantity",
		"discount": "money",
		"name": "满2件减5元,满3件减10元",
		"rules": [{
			"amount": 5,
			"condition": 2
		}, {
			"amount": 10,
			"condition": 3
		}],
		"type": "manliangjian"
	},
	"posid": 1,
	"score": 0.98,
	"shopid": 123457,
	"skuname": ["重量"],
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/2-2.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/2-3.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/2-4.jpg"
	],
	"originPrice": 0,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/2-1.jpg",
	"isSold": 1
}, {
	"_id": "c752ff5387f549daba0537fca12097c7",
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/552946761524-2.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/552946761524-3.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/552946761524-4.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/552946761524-5.jpg"
	],
	"skus": [{
		"name": "6.64元/斤【一级品质免洗500g*3袋独立装】共3斤",
		"price": 19.5,
		"sales": 1,
		"stock": 148,
		"id": 10000
	}, {
		"sales": 3,
		"stock": 703,
		"id": 10001,
		"name": "一级品质免洗500g*2袋独立装共2斤",
		"price": 14.9
	}, {
		"id": 10002,
		"name": "5.98元/斤【一级品质免洗500g*5袋独立装】 共5斤",
		"price": 29.9,
		"stock": 371
	}, {
		"id": 10003,
		"name": "5.98元/斤【特级免洗*肉更厚味更甜*共5斤整袋装】",
		"price": 29.9,
		"sales": 0,
		"stock": 979
	}],
	"visite": 59,
	"miaosha": {
		"price": "13.86",
		"sales": 2,
		"sku_id": 10001,
		"stock": 703,
		"beginTime": 1595692800000,
		"endTime": 1601654400000,
		"id": "5e75bd15b1e302004d1dbbce",
		"limit": 2,
		"rate": 93,
		"state": "started"
	},
	"monthlySale": 58,
	"onlineTime": 1588409978119,
	"score": 0.98,
	"shopid": 123457,
	"stock": 2201,
	"originPrice": 0,
	"posid": 1,
	"title": "新疆红枣 特级免洗枣2500g一级优质大",
	"categories": [{
		"id": 1004,
		"name": "大分类一"
	}, {
		"id": 2003,
		"name": "小分类二"
	}],
	"id": 10004,
	"price": 14.9,
	"skuname": ["食品规格"],
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/552946761524-1.jpg",
	"isSold": 1
}, {
	"_id": "f9c2a5db50f148a3b648c9d67951856a",
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": true,
		"goodsCount": 12,
		"id": 2002,
		"name": "柑橘橙柚",
		"pid": 1004
	}],
	"stock": 501,
	"skus": [{
		"id": 10000,
		"name": "配可乐&gt;原味",
		"price": 43.5,
		"sales": 27,
		"stock": 266
	}, {
		"id": 10001,
		"name": "配可乐&gt;草莓味",
		"price": 45.5,
		"sales": 6,
		"stock": 10
	}, {
		"id": 10002,
		"name": "配牛奶&gt;原味",
		"price": 44.5,
		"sales": 1,
		"stock": 189
	}, {
		"id": 10003,
		"name": "配牛奶&gt;草莓味",
		"price": 46.5,
		"sales": 1,
		"stock": 36
	}],
	"visite": 74,
	"skuname": ["规格", "口味"],
	"posid": 0,
	"score": 0.98,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/cheliz.jpg",
	"originPrice": null,
	"id": 10005,
	"title": "四川樱桃汉源套袋黑珍珠大樱桃新鲜汶川车厘子水果包邮",
	"shopid": 123457,
	"price": 43.5,
	"monthlySale": 95,
	"yuding": {
		"sales": 100,
		"sku_ids": [10001, 10003],
		"beginTime": 1593792000000,
		"deduction": 20,
		"endTime": 1594396799000,
		"finalPaymentBeginTime": 1594396800000,
		"finalPaymentEndTime": 1594655999000,
		"price": 1,
		"state": "ended"
	},
	"isSold": 1,
	"default_checked_sku_id": 10000,
	"default_sku_id": 0,
	"description": "",
	"imgs": [],
	"modified": 1597902249016,
	"operator": "9ffb2a485f38964200999b1f07cb7b80",
	"deliveryTags": [],
	"subTitle": "",
	"upc": ""
}, {
	"_id": "f628064da0a14005b7be01cbc3c066fa",
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": true,
		"goodsCount": 5,
		"id": 2005,
		"name": "蒲提浆果",
		"pid": 1004
	}],
	"originPrice": null,
	"skus": [{
		"id": 10000,
		"name": "配可乐&gt;原味",
		"price": 43.5,
		"sales": 19,
		"stock": 922
	}, {
		"id": 10001,
		"name": "配可乐&gt;草莓味",
		"price": 45.5,
		"sales": 3,
		"stock": 818
	}, {
		"id": 10002,
		"name": "配牛奶&gt;原味",
		"price": 43.5,
		"sales": 9,
		"stock": 581
	}, {
		"id": 10003,
		"name": "配牛奶&gt;草莓味",
		"price": 45.5,
		"sales": 3,
		"stock": 415
	}],
	"id": 10006,
	"shopid": 123457,
	"skuname": ["规格", "口味"],
	"stock": 2736,
	"visite": 29,
	"score": 0.98,
	"price": 43.5,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/lizhi.jpg",
	"title": "果园现货 新鲜荔枝当季水果现摘现发顺丰包邮时令应季荔枝大果5斤",
	"monthlySale": 84,
	"posid": 0,
	"isSold": 1,
	"description": "",
	"imgs": [],
	"modified": 1593844487203,
	"operator": 10000
}, {
	"_id": "9c44bc3a70f04f9f9b9547818a7c2ce9",
	"price": 43.5,
	"score": 0.98,
	"skus": [{
		"id": 10000,
		"name": "配可乐&gt;原味",
		"price": 43.5,
		"sales": 4,
		"stock": 657
	}, {
		"id": 10001,
		"name": "配可乐&gt;草莓味",
		"price": 45.5,
		"sales": 8,
		"stock": 669
	}, {
		"id": 10002,
		"name": "配牛奶&gt;原味",
		"price": 43.5,
		"sales": 12,
		"stock": 708
	}, {
		"id": 10003,
		"name": "配牛奶&gt;草莓味",
		"price": 45.5,
		"sales": 17,
		"stock": 78
	}],
	"id": 10007,
	"miaosha": {
		"id": "5e75bd12b1e402004d1dbbce",
		"limit": 2,
		"sku_id": 10003,
		"price": 29.9,
		"stock": 80,
		"beginTime": 1588314082930,
		"endTime": 1598314811039,
		"sales": 21
	},
	"visite": 85,
	"posid": 0,
	"shopid": 123457,
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": false,
		"goodsCount": 5,
		"id": 2005,
		"name": "蒲提浆果",
		"pid": 1004
	}],
	"skuname": ["规格", "口味"],
	"monthlySale": 157,
	"title": "越南进口香玉芒9斤装当季新鲜水果批发整箱包邮大青皮芒果10",
	"stock": 2112,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/mangguo.jpg",
	"originPrice": null,
	"isSold": 1,
	"description": "",
	"imgs": [],
	"modified": 1593692403186,
	"operator": 10000
}, {
	"_id": "b2ed1c2c7df44d2da164aef2ff2c79f9",
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/606186541398-2.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/606186541398-3.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/606186541398-4.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/606186541398-5.jpg"
	],
	"posid": 1,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/images/goods/606186541398-1.jpg",
	"stock": 122,
	"categories": [{
		"id": 1010,
		"name": "方便速食",
		"pid": 0
	}],
	"id": 10008,
	"onlineTime": 1593588641730,
	"originPrice": null,
	"price": 68.8,
	"visite": 25,
	"monthlySale": 53,
	"shopid": 123457,
	"score": 0.98,
	"skuname": ["口味"],
	"skus": [{
		"id": 10000,
		"name": "每日抱抱骏枣夹核桃758g（量贩装）",
		"price": 68.8,
		"sales": 3,
		"stock": 122
	}],
	"title": "【百草味-每日抱抱果758g】新疆特产大红枣夹核桃仁 整箱枣子零食",
	"isSold": 1,
	"operator": 10000,
	"description": "",
	"modified": 1593597744418
}, {
	"_id": "f188d1a95efb0601000f1cc225e072ba",
	"imgs": [],
	"onlineTime": 1593592742635,
	"originPrice": 0,
	"price": 22.9,
	"shopid": 123457,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-06-30/9249580888084141.jpg",
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": false,
		"goodsCount": 5,
		"id": 2003,
		"name": "桃李杏枣",
		"pid": 1004
	}],
	"description": "",
	"stock": 14,
	"title": "荔枝蜜",
	"modified": 1593585557485,
	"operator": 10000,
	"score": 1,
	"id": 10021,
	"isSold": 0,
	"visite": 1,
	"offlineTime": 1593594076532
}, {
	"_id": "f188d1a95efc1c93001b237c4d4fcd99",
	"operator": 10000,
	"price": "18.88",
	"shopid": 123457,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-10/5151027580221903.jpg",
	"title": "酸果Meier",
	"visite": 1,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-01/16218627568213906.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-01/5167812544680674.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-01/7818980911280067.jpg"
	],
	"isSold": 0,
	"originPrice": 0,
	"modified": 1595313415166,
	"onlineTime": 1593594408425,
	"score": 1,
	"skus": [{
		"id": 10000,
		"name": "酸",
		"originPrice": 0,
		"price": "18.88",
		"stock": "100"
	}, {
		"id": 10001,
		"name": "甜",
		"originPrice": 0,
		"price": "18.88",
		"stock": "100"
	}, {
		"originPrice": 0,
		"price": "18.88",
		"stock": "100",
		"id": 10002,
		"name": "苦"
	}, {
		"id": 10003,
		"name": "辣",
		"originPrice": 0,
		"price": 28.88,
		"stock": 100
	}],
	"default_checked_sku_id": 10000,
	"description": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/07598639248628647.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/6354847415366283.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/973077697480514.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/04493203436370319.jpg",
	"default_sku_id": 0,
	"id": 10024,
	"offlineTime": 1593594414589,
	"skuname": ["口味"],
	"stock": 400,
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": true,
		"goodsCount": 5,
		"id": 2003,
		"name": "桃李杏枣",
		"pid": 1004
	}],
	"created": 1593580691122
}, {
	"_id": "a81822d65efdcab9002725f735b9c237",
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": false,
		"goodsCount": 5,
		"id": 2004,
		"name": "苹果梨蕉",
		"pid": 1004
	}],
	"description": "",
	"id": 10026,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/5936208042301494.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/5999436728835204.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/7858003202156504.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/28913194079955584.jpg"
	],
	"originPrice": 0,
	"price": 39.8,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/2248634080465397.jpg",
	"stock": 1204,
	"title": "红美人香蕉新鲜10斤包邮当季水果小香焦红皮芭蕉米蕉应整箱批发5",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593690809784,
	"created": 1593690809784,
	"score": 1,
	"monthlySale": 1,
	"visite": 12,
	"isSold": 1
}, {
	"_id": "f11f525b5efdcb770025003449bdd6f7",
	"categories": [{
		"id": 1013,
		"name": "肉禽蛋",
		"pid": 0
	}],
	"description": "",
	"id": 10027,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/7210192854935076.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/28700494455078085.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/6919281126813253.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/8546083657044494.jpg"
	],
	"originPrice": 0,
	"price": 116,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/25985312644587244.jpg",
	"stock": 135,
	"title": "老母鸡现杀新鲜2650g土鸡农家散养走地鸡谷物喂养清远2整只三黄鸡",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593690999688,
	"created": 1593690999688,
	"score": 1,
	"monthlySale": 0,
	"visite": 6,
	"isSold": 1
}, {
	"_id": "f188d1a95efdcc43002f4ff5248601b0",
	"categories": [{
		"id": 1013,
		"name": "肉禽蛋",
		"pid": 0
	}],
	"description": "",
	"id": 10028,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/3924395551899309.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/1258215925552998.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/9680119282941286.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/20542030947132062.jpg"
	],
	"originPrice": 0,
	"price": 74,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/8444754049337726.jpg",
	"stock": 132,
	"title": "发2只正宗土鸡农家散养2年老母鸡新鲜草鸡笨鸡走地鸡柴鸡整只鸡肉",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593691203194,
	"created": 1593691203194,
	"score": 1,
	"monthlySale": 0,
	"visite": 9,
	"isSold": 1
}, {
	"_id": "9fb344b15efdcc9c002ec5bc68cb7aa5",
	"categories": [{
		"id": 1013,
		"name": "肉禽蛋",
		"pid": 0
	}],
	"description": "",
	"id": 10029,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/4485947130852358.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/023605891787764177.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/05768998750139287.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/785622279243133.jpg"
	],
	"originPrice": 0,
	"price": 129,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/43585207776681567.jpg",
	"stock": 35,
	"title": "放养5年老鸭新鲜整只鸭子肉活体现杀老水鸭农家散养土鸭麻鸭番鸭",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593691292785,
	"created": 1593691292785,
	"score": 1,
	"monthlySale": 0,
	"visite": 12,
	"isSold": 1
}, {
	"_id": "868b77555efdcce300295b023c7418e7",
	"categories": [{
		"id": 1013,
		"name": "肉禽蛋",
		"pid": 0
	}],
	"description": "",
	"id": 10030,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/6858106440667885.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/0535419959232144.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/6131968153315641.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/47519226103238277.jpg"
	],
	"originPrice": 0,
	"price": 228,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/927881490722713.jpg",
	"stock": 99,
	"title": "顺丰空运恒沃红脸番鸭农家散养老鸭子山间散养土鸭新鲜土鸭子整只",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593691363520,
	"created": 1593691363520,
	"score": 1,
	"monthlySale": 0,
	"visite": 17,
	"isSold": 1
}, {
	"_id": "b7d9f2ea5efdcd3800365eda29540482",
	"categories": [{
		"id": 1012,
		"name": "快手菜",
		"pid": 0
	}],
	"description": "",
	"id": 10031,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/30153142465599303.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/8589430190015286.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/7102827228402744.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/19444725800009077.jpg"
	],
	"originPrice": 0,
	"price": 318,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/12255478875992976.jpg",
	"stock": 33,
	"title": "如意三宝年家宴家庭聚餐半成品美食方便菜私房菜套餐家用快手菜",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593691448797,
	"created": 1593691448797,
	"score": 1,
	"monthlySale": 0,
	"visite": 27,
	"isSold": 1
}, {
	"_id": "a81822d65efdce7b002748156ecdf124",
	"categories": [{
		"id": 1012,
		"name": "快手菜",
		"pid": 0
	}],
	"description": "",
	"id": 10032,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/657096207228897.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/04192239510187823.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/5020792553390301.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/5981495958439196.jpg"
	],
	"originPrice": 0,
	"price": 58.8,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/9498219093740484.jpg",
	"stock": 364,
	"title": "喜五福盖浇饭冷冻料理包方便速食商用外卖快餐菜肴包即食10款",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593691771116,
	"created": 1593691771116,
	"score": 1,
	"monthlySale": 1,
	"visite": 15,
	"isSold": 1
}, {
	"_id": "9fb344b15efdcef3002edf820508a67f",
	"categories": [{
		"id": 1012,
		"name": "快手菜",
		"pid": 0
	}],
	"description": "",
	"id": 10033,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/7729705613635199.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/46620540525351284.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/6573362983821329.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/7080970882527362.jpg"
	],
	"originPrice": 0,
	"price": 79.9,
	"skuname": ["套餐"],
	"skus": [{
		"id": 10000,
		"name": "套餐一",
		"originPrice": 0,
		"price": 79.9,
		"stock": 35,
		"sales": 1
	}, {
		"id": 10001,
		"name": "套餐二",
		"originPrice": 0,
		"price": 139.9,
		"stock": 35,
		"sales": 1
	}],
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/28999970630528915.jpg",
	"stock": 70,
	"title": "聪厨家宴套餐湘菜6个菜私房菜半成品美食方便菜聚餐免切洗快手菜",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593691891076,
	"created": 1593691891076,
	"score": 1,
	"monthlySale": 2,
	"visite": 18,
	"isSold": 1
}, {
	"_id": "f11f525b5efdcfb0002525e566a988eb",
	"categories": [{
		"id": 1013,
		"name": "肉禽蛋",
		"pid": 0
	}],
	"description": "",
	"id": 10034,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/607905695939425.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/8476829525892084.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/853124993387353.jpg"
	],
	"originPrice": 0,
	"price": 39.8,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/600794846026596.jpg",
	"stock": 66,
	"title": "正宗土鸡蛋农家散养新鲜纯农村自养天然40枚草鸡蛋柴鸡蛋本笨鸡蛋",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593692080469,
	"created": 1593692080469,
	"score": 1,
	"monthlySale": 2,
	"visite": 11,
	"isSold": 1
}, {
	"_id": "f11f525b5efdd02f002529e7416a84ac",
	"categories": [{
		"id": 1013,
		"name": "肉禽蛋",
		"pid": 0
	}],
	"description": "",
	"id": 10035,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/059348692726301944.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/038640577642871876.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/7028906532060984.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/16889481694805364.jpg"
	],
	"originPrice": 0,
	"price": 100,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/5126982091107218.jpg",
	"stock": 135,
	"title": "新鲜土鸡蛋放养土鸡蛋虫草土鸡蛋正宗农村散养五黑绿皮乌鸡蛋50枚",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593692207156,
	"created": 1593692207156,
	"score": 1,
	"monthlySale": 0,
	"visite": 13,
	"isSold": 1
}, {
	"_id": "868b77555efdd09500297e2b69f368bb",
	"categories": [{
		"id": 1013,
		"name": "肉禽蛋",
		"pid": 0
	}],
	"description": "",
	"id": 10036,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/5245989526539636.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/2338166483979801.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/7975531697337199.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-02/11006437797939495.jpg"
	],
	"originPrice": 0,
	"price": 75,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-02/012658146458155883.jpg",
	"stock": 66,
	"title": "初土记土鸡蛋农场散养硒有鸡蛋柴鸡蛋无菌蛋新鲜鸡蛋30枚礼盒顺丰",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593692309641,
	"created": 1593692309641,
	"score": 1,
	"monthlySale": 0,
	"visite": 23,
	"isSold": 1
}, {
	"_id": "a81822d65efe61c50030b2f22166150f",
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": false,
		"goodsCount": 5,
		"id": 2003,
		"name": "桃李杏枣",
		"pid": 1004
	}],
	"description": "",
	"id": 10037,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-03/1379628157423738.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-03/833987062565326.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-03/44969101715078463.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-03/7650331601507265.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-03/33433744829128065.jpg"
	],
	"originPrice": 0,
	"price": 22,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-03/9945017155703366.jpg",
	"stock": 1000,
	"title": "apjtm",
	"operator": 10000,
	"shopid": 123458,
	"onlineTime": 1593729477391,
	"created": 1593729477391,
	"score": 1,
	"monthlySale": 0,
	"visite": 1,
	"isSold": 1
}, {
	"_id": "b7d9f2ea5efc1c1a001f3b8544d6acda",
	"id": 10023,
	"categories": [{
		"id": 1009,
		"name": "米面豆制品",
		"pid": 0
	}],
	"description": "",
	"score": 1,
	"title": "酸果Meier",
	"created": 1593580570787,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-01/5157232807960583.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-01/20613994817007342.jpg"
	],
	"modified": 1593583822972,
	"operator": 10000,
	"originPrice": 0,
	"shopid": 123457,
	"skuname": ["颜色"],
	"skus": [{
		"id": 10000,
		"name": "红色",
		"originPrice": 0,
		"price": 22.95,
		"stock": 1000
	}, {
		"id": 10001,
		"name": "白色",
		"originPrice": 0,
		"price": 33.95,
		"stock": 1000
	}, {
		"id": 10002,
		"name": "绿色",
		"originPrice": 0,
		"price": 42.95,
		"stock": 1000
	}],
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-01/37518203945845796.jpg",
	"stock": 3000,
	"visite": 1,
	"onlineTime": 1593847266064,
	"price": 12.33,
	"isSold": 0,
	"offlineTime": 1593592846948,
	"deleteOperator": 10000,
	"revertOperator": 10000,
	"revertTime": 1593847266064
}, {
	"_id": "f188d1a95f002855005678a722de9f83",
	"categories": [{
		"id": 1004,
		"name": "水果",
		"pid": 0
	}, {
		"checked": true,
		"goodsCount": 12,
		"id": 2002,
		"name": "柑橘橙柚",
		"pid": 1004
	}],
	"description": "",
	"id": 10039,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/7367310443436768.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/6710076119047128.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/578660322075573.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/14967188009900378.jpg"
	],
	"originPrice": 0,
	"price": 39.8,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-04/40080428010563707.jpg",
	"stock": 3,
	"title": "广西小台农芒果10斤新鲜水果无丝小核热带应季青整箱批发当季包邮",
	"yuding": {
		"state": "started",
		"beginTime": 1593878400000,
		"deduction": 10,
		"endTime": 1601481599000,
		"finalPaymentBeginTime": 1601481600000,
		"finalPaymentEndTime": 1602345599000,
		"price": 1
	},
	"operator": "9ffb2a485f38964200999b1f07cb7b80",
	"shopid": 123457,
	"onlineTime": 1593847312528,
	"created": 1593845845106,
	"score": 1,
	"monthlySale": 9,
	"visite": 75,
	"isSold": 1,
	"modified": 1597902231757,
	"offlineTime": 1593846835325,
	"deleteOperator": 10000,
	"revertOperator": 10000,
	"revertTime": 1593847312528,
	"subTitle": "小明都说好",
	"deliveryTags": [],
	"upc": "6901028316989"
}, {
	"_id": "868b77555f005179004c72bc67a83493",
	"categories": [{
		"id": 1007,
		"name": "水产海鲜",
		"pid": 0
	}, {
		"checked": true,
		"goodsCount": 0,
		"id": 10047,
		"name": "龙虾",
		"pid": 1007
	}],
	"description": "",
	"id": 10040,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/5356030129021998.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/4945912943265075.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/25740288351647134.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/6370264534067686.jpg"
	],
	"originPrice": 0,
	"price": 239,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-04/6586700496492762.jpg",
	"stock": 2,
	"title": "龙虾波士顿大龙虾鲜活特大波龙奥龙波斯顿海鲜水产活虾500-600g*2",
	"operator": 10000,
	"shopid": 123457,
	"onlineTime": 1593856377689,
	"created": 1593856377689,
	"score": 1,
	"monthlySale": 3,
	"visite": 36,
	"isSold": 1,
	"deliveryTags": [],
	"modified": 1596885318550,
	"subTitle": "",
	"miaosha": {
		"beginTime": 1596816000000,
		"endTime": 1597161600000,
		"limit": 1,
		"price": 29.9,
		"rate": 12,
		"sku_id": 0,
		"stock": 86,
		"sales": -1
	}
}, {
	"_id": "b7d9f2ea5f00760e006618fb7c18de05",
	"categories": [{
		"id": 1006,
		"name": "土货",
		"pid": 0
	}, {
		"checked": true,
		"goodsCount": 12,
		"id": 4002,
		"name": "腊肉",
		"pid": 1006
	}],
	"default_checked_sku_id": 10001,
	"default_sku_id": 0,
	"description": "",
	"id": 10041,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/7333699421284027.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/6485853452234038.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-04/019065788001724426.jpg"
	],
	"originPrice": 0,
	"price": 39.5,
	"skuname": ["口味"],
	"skus": [{
		"id": 10000,
		"name": "招牌腊肉",
		"originPrice": 0,
		"price": 39.9,
		"sales": 0,
		"stock": 50
	}, {
		"id": 10001,
		"name": "风味腊肉",
		"originPrice": 0,
		"price": 39.5,
		"sales": 1,
		"stock": 49
	}, {
		"id": 10002,
		"name": "腊肠400克",
		"originPrice": 0,
		"price": 39.8,
		"sales": 1,
		"stock": 49
	}],
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-04/6918289634747045.jpg",
	"stock": 148,
	"title": "杨大爷招牌腊肉四川特产后腿五花腊肉农家自制烟熏香味腊肠老咸肉",
	"operator": "9ffb2a485f38964200999b1f07cb7b80",
	"shopid": 123457,
	"onlineTime": 1593865742891,
	"created": 1593865742891,
	"score": 1,
	"monthlySale": 2,
	"visite": 44,
	"isSold": 1,
	"modified": 1598068138787,
	"deliveryTags": [],
	"subTitle": "",
	"upc": "6922868290840"
}, {
	"_id": "1503f3385f129cf2002c6316705acea1",
	"categories": [{
		"id": 1011,
		"name": "饮酒零食",
		"pid": 0
	}],
	"description": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/09831715229727622.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/6291845992946198.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/13017929123453964.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/20312752925525246.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/5215873546496722.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/5335643562893808.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/8654583975223232.jpg;https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-21/28905182004377994.jpg",
	"id": 10042,
	"imgs": ["https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-18/7620968048129177.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-18/9375678378338136.jpg",
		"https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_imgs/2020-07-18/6959788083812396.jpg"
	],
	"originPrice": 0,
	"price": 18.8,
	"src": "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods_face/2020-07-18/1077456655328407.jpg",
	"stock": 523,
	"title": "滋食网红日本式小圆饼植物油饼干天日盐零食奶盐味办公室茶点",
	"operator": "9ffb2a485f38964200999b1f07cb7b80",
	"shopid": 123457,
	"onlineTime": 1595055346202,
	"created": 1595055346202,
	"score": 1,
	"monthlySale": 5,
	"visite": 55,
	"isSold": 1,
	"modified": 1598067970225,
	"miaosha": {
		"beginTime": 1597766400000,
		"endTime": 1597942800000,
		"limit": 0,
		"price": 14.85,
		"rate": 79,
		"sku_id": 0,
		"stock": 66,
		"state": "ended",
		"sales": -16
	},
	"deliveryTags": [],
	"subTitle": "",
	"upc": "6901028316989"
}];

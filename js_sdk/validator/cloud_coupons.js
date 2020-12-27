// 表单校验规则由 DB-Schema 生成，不建议直接修改校验规则，而建议通过 DB-Schema 生成, 详情: https://uniapp.dcloud.net.cn/uniCloud/schema



export default {
	"beginTime": {
		"rules": [{
			"format": "int"
		}],
		"label": "开始时间戳"
	},
	"endTime": {
		"rules": [{
			"format": "int"
		}],
		"label": "结束时间戳"
	},
	"goods": {
		"rules": [{
			"format": "array"
		}],
		"label": "商品列表"
	},
	"category": {
		"rules": [{
			"format": "array"
		}],
		"label": "分类列表"
	},
	"limit": {
		"rules": [{
			"format": "int"
		}],
		"defaultValue": 1,
		"label": "限制领取张数"
	},
	"stock": {
		"rules": [{
			"format": "int"
		}],
		"defaultValue": 100,
		"label": "总库存"
	},
	"manjine": {
		"rules": [{
			"format": "object"
		}],
		"label": "金额满减"
	},
	"memo": {
		"rules": [{
			"format": "string"
		}],
		"label": "说明"
	},
	"price": {
		"rules": [{
			"format": "double"
		}],
		"defaultValue": 1,
		"label": "优惠金额"
	},
	"shopid": {
		"rules": [{
			"format": "int"
		}],
		"label": "店铺id"
	},
	"state": {
		"rules": [{
				"format": "int"
			},
			{
				"range": [{
						"text": "草稿箱",
						"value": 0
					},
					{
						"text": "已发布",
						"value": 1
					},
					{
						"text": "已停用",
						"value": 2
					}
				]
			}
		],
		"defaultValue": 0,
		"label": "状态"
	},
	"title": {
		"rules": [{
			"format": "string"
		}],
		"label": "标题"
	},
	"today": {
		"rules": [{
			"format": "bool"
		}],
		"label": "是否当日可用"
	},
	"type": {
		"rules": [{
				"format": "int"
			},
			{
				"range": [{
						"text": "商品券",
						"value": 1
					},
					{
						"text": "分类券",
						"value": 2
					},
					{
						"text": "店铺券",
						"value": 3
					}
				]
			}
		],
		"label": "类型"
	},
	"style": {
		"rules": [{
				"format": "string"
			},
			{
				"range": [{
						"text": "满金额减",
						"value": "manjine"
					},
					{
						"text": "满数量减",
						"value": "manshuliang"
					}
				]
			}
		],
		"label": "类型"
	}
}

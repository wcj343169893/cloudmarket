'use strict';
const db = uniCloud.database();
const cmd = db.command;
const goodsCollection = db.collection("cloud_goods");
const commentCollection = db.collection('cloud_goods_comments');
const goodsVisiteCollection = db.collection('cloud_goods_visites');
const cartCollection = db.collection('cloud_carts');
const models = {
	//查询商品详情
	async detail(data) {
		const {
			id,
			uid
		} = data;
		let fields = {
			"id": 1,
			"title": 1,
			"subTitle": 1,
			"stock": 1,
			"visite": 1,
			"src": 1,
			"shopid": 1,
			"imgs": 1, //轮播图
			"score": 1,
			"price": 1,
			"skuname": 1,
			"skus": 1,
			"default_checked_sku_id": 1,
			"originPrice": 1,
			"monthlySale": 1,
			"categories": 1,
			"miaosha": 1,
			"manjian": 1,
			"share": 1,
			saleType: 1,
			tuangou: 1,
			starStatics: 1,
			commentTagStatics: 1,
			commentCount: 1,
			comment: 1,
			guarantee_period: 1,
			storage_condition: 1,
			net_weight: 1,
			service_purpose: 1,
			"description": 1,
			"yuding": 1
		};
		let goods = await goodsCollection.where({
			id: +id
		}).field(fields).limit(1).get();
		if (goods.data.length == 0) {
			data.message = "商品不存在";
			return false;
		}
		data = goods.data[0];
		//承诺服务
		data["service"] = [
			"7天无理由退换货",
			"假一赔十",
		];
		if(data.service_purpose){
			data.service=data.service_purpose.split(";");
			delete data.service_purpose;
		}
		//当前用户
		data.visitor = uid;
		if (uid) {
			//延时处理---同步更新浏览记录
			await saveGoodsVisiter(data, uid);
			//favorite  是否收藏
			//查询已加入购物车信息amount
			//await getGoodsCart(data,uid);
		}
		return data;
	},
	//分页查询所有秒杀商品
	async miaosha(data) {
		const {
			page,
			limit,
			shopid
		} = data;
		let time = new Date().getTime();
		//正在秒杀商品5条,必须是有库存的秒杀
		let result = await goodsCollection.where({
			shopid: shopid,
			isCategoryShow: 1,
			isSold: 1,
			"miaosha.stock": cmd.gt(0),
			"miaosha.beginTime": cmd.lt(time + 24 * 3600 * 1000),
			"miaosha.endTime": cmd.gt(time),
		}).field({
			_id: 0,
			id: 1,
			src: 1,
			title: 1,
			subTitle: 1,
			isSold: 1,
			miaosha: 1,
			price: 1,
			stock: 1
		}).skip((page - 1) * limit).limit(limit).orderBy("miaosha.beginTime", "desc").get();
		return result.data;
	},
	async tuangou(data) {
		const {
			page,
			limit,
			shopid
		} = data;
		let time = new Date().getTime();
		//正在秒杀商品5条,必须是有库存的秒杀
		let result = await goodsCollection.where({
			shopid: shopid,
			isCategoryShow: 1,
			isSold: 1,
			tuangou: cmd.exists(true),
			"tuangou.beginTime": cmd.lt(time + 24 * 3600 * 1000),
			"tuangou.endTime": cmd.gt(time),
		}).field({
			_id: 0,
			id: 1,
			src: 1,
			title: 1,
			subTitle: 1,
			isSold: 1,
			tuangou: 1,
			banner: 1,
			monthlySale: 1,
			price: 1,
			stock: 1
		}).skip((page - 1) * limit).limit(limit).orderBy("tuangou.beginTime", "asc").get();
		return result.data;
	},
	//按关键词搜索商品
	async search(data) {
		const {
			page,
			limit,
			shopid,
			key
		} = data;
		if (!key || key == "" || key.trim() == "") {
			data.message = "搜索词不能为空";
			return false;
		}
		let result = await goodsCollection.where({
			shopid: shopid,
			isCategoryShow: 1,
			isSold: 1,
			title: new RegExp(key)
		}).field({
			_id: 0,
			id: 1,
			src: 1,
			title: 1,
			subTitle: 1,
			miaosha: 1,
			yuding: 1,
			tuangou: 1,
			price: 1,
			stock: 1
		}).skip((page - 1) * limit).limit(limit).orderBy("id", "desc").get();
		return result.data;
	},
	/**
	 * 根据分类id,推荐，分页查询商品
	 * @param {Object} data
	 */
	async getByCid(data) {
		const {
			page,
			limit,
			cateid,
			isRecommend,
			shopid,
			sort,
			order
		} = data;
		let condition = {
			shopid: shopid,
			isCategoryShow: 1,
			'categories.id': cateid,
			isSold: 1,
		};
		if (isRecommend) {
			condition["isRecommend"] = true;
		}
		let orderBy = ["monthlySale", "desc"];
		if (sort) {
			//前端自定义排序
			orderBy = [sort, order];
		}
		console.log(condition);
		let result = await goodsCollection.where(condition).field({
			_id: 0,
			id: 1,
			title: 1,
			subTitle: 1,
			stock: 1,
			src: 1,
			isSold: 1,
			score: 1,
			price: 1,
			default_checked_sku_id: 1, //多规格默认选中
			skuname: 1,
			skus: 1,
			originPrice: 1,
			monthlySale: 1,
			categories: 1,
			miaosha: 1,
			yuding: 1,
			manjian: 1,
			tuangou: 1,
		}).skip((page - 1) * limit).limit(limit).orderBy(...orderBy).get();
		return result.data;
	},
	//用户的商品浏览记录
	async visite(data) {
		const {
			uid
		} = data;
		//商品浏览记录，每人每件商品只存在一条
		let result = await goodsVisiteCollection.where({
			uid: uid
		}).field({
			_id: 0,
			title: 1,
			subTitle: 1,
			price: 1,
			visite: 1,
			goods_id: 1,
			src: 1,
			shopid: 1
		}).orderBy("time", "desc").limit(10).get();
		return result.data;
	},
	/**
	 * 分页查询商品评价
	 * @param {Object} data
	 */
	async comment(data) {
		const {
			page,
			limit,
			shopid,
			goodsid
		} = data;
		let result = await commentCollection.where({
			shopid: shopid,
			goods_id: goodsid,
		}).skip((page - 1) * limit).limit(limit).orderBy("created", "desc").get();
		if (result.data.length == 0) {
			return false;
		}
		return result.data;
	},
	/**
	 * 定时器，1.下架过期的团购
	 */
	async timer() {
		let time = new Date().getTime();
		let result = await goodsCollection.where({
			isSold: 1,
			tuangou: cmd.exists(true),
			"tuangou.endTime": cmd.lt(time),
		}).update({
			isSold: 0,
		});
		console.log("过期团购自动下架", result)
	}
}
/**
 * 保存用户商品的浏览记录
 */
const saveGoodsVisiter = async (item, uid) => {
	//商品浏览记录，每人每件商品只存在一条
	let time = new Date().getTime();
	console.log("item.id", item.id, time);
	//增加浏览记录,必须存在uid
	let visite = await goodsVisiteCollection.where({
		uid: uid,
		goods_id: item.id
	}).field({
		goods_id: 1,
		time: 1
	}).limit(1).get();
	console.log("visite.data.length", visite.data.length);
	if (visite.data.length < 1) {
		//新增浏览记录
		let visave = await goodsVisiteCollection.add({
			uid: uid,
			goods_id: item.id,
			title: item.title,
			shopid: item.shopid,
			price: item.price,
			src: item.src,
			time: time
		});
		console.log("visave", visave);

		//增加浏览量
		let incResult = await goodsCollection.doc(item._id).update({
			visite: cmd.inc(1)
		});
		console.log("incResult", incResult);
	} else {
		//console.log(visite.data[0]);
		//更新浏览时间
		let updateVisite = await goodsVisiteCollection.doc(visite.data[0]._id).update({
			src: item.src,
			title: item.title,
			price: item.price,
			time: time
		});
		console.log("updateVisite", updateVisite);
	}
}
/**
 * 查询用户商品的购物车信息
 */
const getGoodsCart = async (data, uid) => {
	let carts = await cartCollection.where({
		shopid: data.shopid,
		goods_id: data.id,
		uid: uid
	}).field({
		"_id": 0,
		"sku_id": 1,
		"amount": 1
	}).get();
	if (carts.data.length > 0) {
		data["cart"] = {};
		//处理成规格对于数量
		carts.data.map(c => {
			if (c.sku_id) {
				data["cart"][c.sku_id] = c.amount;
			} else {
				data["cart"]["0"] = c.amount;
			}
		});
	} else {
		data["cart"] = {};
	}
}

module.exports = models;

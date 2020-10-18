//全局变量，是否正在跳转中，防止双击跳转两个页面
var isRedirect = false;
/**
 * 订单状态
 * @param {Object} ele
 */
const getOrderStateExp = function(item) {
	let stateTip = '',
		state = item.state,
		stateTipColor = '#303133',
		stateContent = "";
	switch (+state) {
		case 0:
			stateTip = '待付款';
			stateContent = "订单未支付，去付款";
			stateTipColor = '#fa436a';
			if (item.yuding) {
				if (item.yuding.state == 1) {
					stateContent = "订单已支付定金，等待付尾款";
				}
			}
			break;
		case 1:
			stateTip = '待拣货';
			stateContent = "订单已支付，等待商家完成分拣";
			break;
		case 2:
			if (item.deliveryType == "selfRaising") {
				stateTip = '待提货';
				stateContent = "订单已完成分拣，请前往提货";
			} else {
				stateTip = '正在配送中';
				stateContent = "订单已完成分拣，正在配送中";
			}
			break;
		case 3:
			stateTip = '已完成';
			stateContent = "感谢您的信任，祝您生活愉快";
			break;
		case 4:
			stateTip = '已评价';
			stateContent = "感谢您的信任，祝您生活愉快";
			break;
		case -1:
			stateTip = '已关闭';
			stateTipColor = '#909399';
			if (item.cancelStyle == "auto") {
				stateContent = "订单未支付，已自动取消";
			} else {
				stateContent = "订单未支付，已手动取消";
			}
			break;

			//更多自定义
	}
	//退款中
	if (item.isRefunding > 0) {
		stateTip = '退款中';
		stateTipColor = '#fa436a';
		stateContent = "订单退款中，请耐心等待审核";
	}else if (item.refundAmount > 0 && item.refundAmount==item.cartCount) {
		stateTip = '已退款';
		stateTipColor = '#fa436a';
		stateContent = "订单已退款";
		item.isRefundAll=true;
	}
	return {
		stateTip,
		stateTipColor,
		stateContent,
	};
}
/**
 * 获取订单类型和名称
 */
const getOrderTypes = function() {
	return {
		'all': "全部",
		'unpaid': "待付款", //改价格
		'payup': "待发货",
		//'delivered': '已发货',
		//'received': '已收货',
		'estimated': '已评价',
		'refunded': '退款/售后'
	};
}
/**
 * 获取后台商品查询类型
 */
const getGoodsTypes = function() {
	return {
		online: '在售',
		baokuan: '爆款',
		recommend: '推荐',
		miaosha: '正在秒杀',
		tuangou: '团购',
		yuding: '预售',
		shouqin: '即将售罄',
		offline: '已下架',
		delete: '已删除'
	};
}

/**
 * 更新购物车总数量
 * @param int gnumber 
 */
const updateCartNumber = function(gnumber) {
	if (gnumber < 1) {
		uni.removeTabBarBadge({
			index: 2
		})
	} else if (gnumber > 999) {
		uni.setTabBarBadge({
			index: 2,
			text: "999+"
		});
	} else {
		uni.setTabBarBadge({
			index: 2,
			text: gnumber + ""
		});
	}
	console.log("cart_sum_count", gnumber)
	uni.setStorage({
		key: "cart_sum_count",
		data: gnumber
	})
};
/**
 * 获得购物车数量
 */
const getCartSumNumber = function() {
	let data = uni.getStorageSync("cart_sum_count");
	console.log("getCartSumNumber", data)
	if (data < 1) {
		data = 0;
	}
	return data;
}
/**
 * 递增购物车数量
 * @param {Object} number
 */
const incrCartNumber = function(number) {
	console.log("incrCartNumber", number)
	let data = getCartSumNumber();
	data += number;
	updateCartNumber(data);
	return data;
}
/**
 * 更新商品的标签,秒杀，满减
 * @param Object goods 商品信息
 * @param int isPrecise 是否精确，true:精确到规格
 */
const updateGoodsTags = function(goods, isPrecise) {
	let tags = [];
	//最大单品加入99件
	goods.limit = goods.limit || goods.stock < 100 ? goods.stock : 99;
	//是否存在多规格
	goods["hasSku"] = false;
	if (goods.skus && goods.skus.length > 0) {
		goods["hasSku"] = true;
		goods.skus.forEach(sku => {
			//多规格限购
			sku.limit = sku.limit || sku.stock < 100 ? sku.stock : 99;
		});
	} else {
		//默认id=0
		goods.sku_id = 0;
	}
	//console.log("updateGoodsTags");
	let time = new Date().getTime();
	if (goods.miaosha) {
		if (goods.miaosha.beginTime > time + 24 * 3600 * 1000) {
			//秒杀提前1天显示，这里不显示
			delete goods.miaosha;
		} else if (goods.miaosha.beginTime > time) {
			goods.miaosha.isBegin = false;
			//秒杀必须是有效的
			if (!isPrecise) {
				tags.push({
					type: "info",
					text: "未开始"
				});
			}
		} else if (time < goods.miaosha.endTime && goods.miaosha.stock > 0) {
			goods.miaosha.isBegin = true;
			goods.miaosha.isEnd = false;
			if (!isPrecise) {
				tags.push({
					type: "warning",
					text: "抢购中"
				});
			}
			//如果是多规格商品
			if (goods.hasSku) {
				let index = goods.skus.findIndex(sku => sku.id == goods.miaosha.sku_id);
				if (index != -1) {
					goods.miaosha.skuIndex = index;
					let sku = goods.skus[index];
					goods.miaosha.originPrice = sku.price;
					if (isPrecise) {
						sku.tags = [{
							type: "warning",
							text: "抢购中"
						}];
					} else {
						Object.assign(goods.skus[index], {
							originPrice: sku.price,
							price: goods.miaosha.price,
						});
					}
					if (goods.price > sku.price) {
						goods.originPrice = sku.originPrice;
						//商品外面显示价格
						goods.price = sku.price;
					}
					//限量
					sku.limit = goods.miaosha.limit > 0 ? goods.miaosha.limit : goods.miaosha.stock;
					//型号信息
					goods.miaosha.skuInfo = sku;
				}
			} else {
				if (isPrecise) {
					tags.push({
						type: "warning",
						text: "抢购中"
					});
				}
				goods.originPrice = goods.price;
				goods.price = goods.miaosha.price;
				//限量
				goods.limit = goods.miaosha.limit > 0 ? goods.miaosha.limit : goods.miaosha.stock;
			}
			//console.log("goods.miaosha",goods)
		} else {
			goods.miaosha.isBegin = true;
			goods.miaosha.isEnd = true;
		}
	} else if (goods.yuding) {
		if (goods.yuding.endTime > time) {
			//console.log(goods.yuding)
			if(!goods.yuding.originPrice){
				goods.yuding.originPrice = goods.price;
			}else{
				goods.price = goods.yuding.originPrice;
			}
			if (!isPrecise) {
				//更新商品价格
				goods.price = parseFloat((goods.price + goods.yuding.price - goods.yuding.deduction).toFixed(2));
			}
			goods.yuding.isBegin = goods.yuding.beginTime < time;
			if (goods.yuding.isBegin) {
				tags.push({
					type: "warning",
					text: "预售进行中"
				});
			} else {
				tags.push({
					type: "info",
					text: "预售"
				});
			}
		} else {
			delete goods.yuding;
		}
	} else if (goods.tuangou) {
		if(goods.tuangou.endTime < time){
			//团购已结束
			delete goods.tuangou;
		}else{
			tags.push({
				type: "info",
				text: "团购"
			});
			if (goods.price > goods.tuangou.price) {
				goods.originPrice = goods.price;
				goods.price = goods.tuangou.price;
			}
		}
	}
	if (goods.manjian) {}
	goods["tags"] = tags;
};
//获取用户定位信息
const getUserLocation = function(state) {
	//获取用户位置信息，首页需要，
	//顺序1：收货地址，2：当前定位，3：ip定位
	if (state.latitude > 0) {
		return;
	}
	address({
		type: "default"
	}).then(res => {

	});
}
/**
 * 时间格式化,dateFormat('yyyy-MM-dd hh:mm:ss')}
 * @param {Object} value
 * @param {String} fmt yyyy-MM-dd hh:mm:ss
 */
const dateFormat = function(value, fmt) {
	let getDate;
	if (value) {
		getDate = new Date(value);
	} else {
		//当前时间
		getDate = new Date();
	}
	let o = {
		'M+': getDate.getMonth() + 1,
		'd+': getDate.getDate(),
		'h+': getDate.getHours(),
		'm+': getDate.getMinutes(),
		's+': getDate.getSeconds(),
		'q+': Math.floor((getDate.getMonth() + 3) / 3),
		'S': getDate.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substr(4 - RegExp.$1.length))
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
		}
	}
	return fmt;
}
let countDownTimerMap = {};
/**
 * 关闭定时器
 * @param {Object} id
 */
const clearCountDownTimer = function(id) {
	if (id && countDownTimerMap[id]) {
		//删除指定
		clearInterval(countDownTimerMap[id]);
	} else {
		//删除所有
		for (let tid in countDownTimerMap) {
			clearInterval(countDownTimerMap[tid]);
		}
	}
}
/**
 * 倒计时,用于秒杀未开始或者已开始
 * @param {Object} item，包含输入的时间 startTime，输出的小时，分，秒
 * @param int endTime 最后时间
 * @param function callback 回调方法
 */
const miaoshaCountDown = function(item, endTime, callback) {
	let startTime = parseInt(item.startTime / 1000);
	let lastTime = parseInt(endTime / 1000);
	/* if(startTime >= lastTime){
		if(callback){
			callback();
		}
		return false;
	} */
	let timerId = item.id;
	if (item.subId) {
		timerId = item.id + "_" + item.subId;
	}
	if (countDownTimerMap[timerId]) {
		clearInterval(countDownTimerMap[timerId]);
	}
	console.log("timerId", timerId)
	let tick = function() {
		let n1 = lastTime - startTime;
		//这里判断很关键，如果写1，在1秒之内，会重复调用
		if (n1 < 0) {
			return true;
		}
		let hour = parseInt(n1 / 3600);
		let minute = parseInt((n1 - hour * 3600) / 60);
		let second = parseInt(n1 % 60);

		item.hour = number2String(hour);
		item.minute = number2String(minute);
		item.second = number2String(second);
		startTime++;
		//console.log(item.minute,item.second);
		return false;
	}
	let number2String = function(n) {
		return ("00" + n).substr(("" + n).length);
	}
	let timePromise = new Promise((resolve, reject) => {
		let t1 = tick();
		countDownTimerMap[timerId] = setInterval(function() {
			t1 = tick();
			if (t1) {
				clearInterval(countDownTimerMap[timerId]);
				resolve();
			}
		}, 1000);
	});
	timePromise.then(res => {
		console.log("miaoshaCountDown finish")
		if (callback) {
			callback();
		}
	})
}

//登录提示框
const showLoginDialog = function() {
	uni.showModal({
		title: "温馨提示",
		content: '您还未登录，请登录后再操作',
		cancelText: '再逛逛',
		confirmText: '去登录',
		success: (res) => {
			if (res.confirm) {
				navToLoginPage();
			}
		}
	});
}
//跳转登录
const navToLoginPage = function(id, sid) {
	uni.navigateTo({
		url: `/pages/public/login`
	});
}

const getMicUserInfo = function() {
	let provider = "weixin";
	uni.login({
		provider: provider,
		scopes: "auth_user",
		success: function(loginRes) {
			console.log("getMicUserInfo loginRes", loginRes);
			//https://developers.weixin.qq.com/community/develop/doc/0000a26e1aca6012e896a517556c01，
			//此接口即将废弃
			uni.getUserInfo({
				provider: provider,
				success: (res) => {
					console.log("uni.getUserInfo", res)
				}
			})
		}
	});
}

/**
 * 小程序检测登录和登录
 * @param {Object} type
 */
const navMicLogin = function(type) {
	const {
		client,
		auth
	} = require("./cloud.js")

	uni.getProvider({
		service: 'oauth',
		success(res) {
			console.log("res.provider", res.provider)
			uni.login({
				provider: res.provider[0],
				success: function(loginRes) {
					loginRes["type"] = type;
					console.log("loginRes", loginRes);
					client.callFunction({
						name: 'micLogin',
						data: loginRes,
						success: result => {
							console.log("micLogin", result)
							if (result.code == 200) {
								//写入缓存
								uni.setStorage({
									key: userInfoKey,
									data: result.data
								});
								auth.signInWithTicket(result.data.ticket).then(() => {
									// 登录成功
									console.log('客户端登录成功');
								});
							} else if (result.code == 404 && result.data) {
								//在后面的授权登录的时候，传到服务器，自动绑定
								uni.setStorage({
									key: "userInfoPlatform",
									data: result.data
								});
							}
						}
					});
				}
			});
		}
	});
}

/** 跳转商品详细页 id商品id，sid型号id*/
const navToGoodsPage = function(id, sid) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	//移除原缓存，兼容navToGoodsItemPage
	uni.removeStorage({
		key: "goodsInfo"
	});
	uni.navigateTo({
		url: `/pages/product/product?id=${id}&sid=${sid}`,
		success: function() {
			isRedirect = false;
		}
	});
}
/**
 * 跳转商品详细页，并在当前页面添加缓存，详情页优先读取缓存，提升显示速度
 * @param {Object} item
 * @param {Boolean} preview 是否预览，0否，1是
 */
const navToGoodsItemPage = function(item, preview) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.setStorage({
		key: "goodsInfo",
		data: item,
		success: () => {

		}
	});
	let id = item.id;
	let sid = item.sku_id || 0;
	let url = `/pages/product/product?id=${id}&sid=${sid}`;
	if (preview) {
		url = `/pages/product/product?id=${id}&sid=${sid}&preview=1`;
	}
	uni.navigateTo({
		url: url,
		success: function() {
			isRedirect = false;
		}
	});
}
//创建订单
const navToCreateOrder = function() {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/order/createOrder`,
		success: function() {
			isRedirect = false;
		}
	});
}
//支付订单跳转
const navToPayOrder = function(id, money, comefrom, module) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/money/pay?id=${id}&money=${money}&comefrom=${comefrom}&module=${module}`,
		success: function() {
			isRedirect = false;
		}
	});
}
/**
 * 订单商品列表
 */
const navToOrderGoodsList = function() {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/order/goods`,
		success: function() {
			isRedirect = false;
		}
	});
}
/**
 * 订单详情
 */
const navToOrderDetail = function(id) {
	if (isRedirect) {
		return false;
	}
	isRedirect = true;
	uni.navigateTo({
		url: `/pages/order/detail?id=${id}`,
		success: function() {
			isRedirect = false;
		}
	});
}
/**
 * 打开markdown说明文档
 * @param string id 文档id
 */
const navToDocPage = function(id) {
	uni.navigateTo({
		url: `/pages/docs/docs?id=${id}`
	});
}
/**
 * 根据类型打开一个文档，如果存在多条，则随机显示
 * @param {Object} type
 */
const navToDocPageByType = function(type) {
	uni.navigateTo({
		url: `/pages/docs/docs?type=${type}`
	});
}
/**
 * 打开http网站
 * @param {Object} url
 */
const navToDocWebPage = function(url) {
	uni.navigateTo({
		url: `/pages/docs/web?url=${url}`
	})
}
/**
 * 打开广告内容
 */
const navToAdDetail = (item)=>{
	let link = item.link;
	if (link.indexOf('/pages') === 0) {
		//跳转指定页面
		uni.navigateTo({
			url: `${link}`
		});
	} else if (link.indexOf('http') === 0) {
		//跳转网页
		navToDocWebPage(link);
	}
}

/**
 * 批量上传多个文件
 * @param {Object} name
 * @param {Object} number
 * @param {Object} chooseCallback
 * @param {Object} successCallback
 */
const uploadFiles = function(name, number, chooseCallback, successCallback) {
	let dt = new Date();
	let pathArr = [name, dateFormat(dt, "yyyy-MM-dd")];
	uni.chooseImage({
		count: number,
		success: res => {
			let paths = [];
			console.log(res)
			if (chooseCallback) {
				chooseCallback(res.tempFilePaths);
			}
			let promises = [];
			//循环上传
			res.tempFilePaths.map((filePath) => {
				let fname = (Math.random() + '').substr(2) + '.jpg';
				let cpath = pathArr.join('/') + '/' + fname;
				let uploadPromise = cloudUploadFile(filePath, cpath);
				promises.push(uploadPromise)
			})
			Promise.all(promises).then(res => {
				console.log(res);
				if (successCallback) {
					successCallback(res)
				}
			});
		}
	});
}
/**
 * 上传到云端储存
 * @param {File}   filePath 本地文件
 * @param {String}   cpath 云端文件名称，腾讯云为文件实际地址
 * @link https://uniapp.dcloud.io/uniCloud/storage?id=uploadfile
 */
const cloudUploadFile = (filePath, cpath) => {
	return new Promise((resolve, reject) => {
		let result = uniCloud.uploadFile({
			filePath: filePath,
			cloudPath: cpath,
			onUploadProgress: pro => {},
			success: res => {
				console.log("cloudUploadFile", res)
				if (res.fileID.indexOf("cloud://") != -1) {
					//用这个转换一下，有一个隐藏的好处，可以等待文件发布到cdn，避免立即访问不到
					uniCloud.getTempFileURL({
						fileList: [res.fileID]
					}).then(res2 => {
						resolve(res2.fileList[0].tempFileURL);
					})
				} else {
					//延时返回，可以等待文件发布到cdn，避免立即访问不到
					setTimeout(() => {
						resolve(res.fileID);
					}, 200);
				}
			},
			fail: () => {
				reject(false);
			}
		});
	});
};
/**
 * 检测app是否需要升级
 */
const checkAppUpdate = (isForce, systemInfo, callback) => {
	let checkUpdateKey = 'checkAppUpdate';
	let dt = new Date();
	//年月日
	let today = dt.getFullYear() + '' + (dt.getMonth() + 1) + '' + dt.getDate();
	let isChecked = uni.getStorageSync(checkUpdateKey);
	console.log("检查更新", isChecked, systemInfo);
	if (!isChecked || isChecked != today || isForce) {
		uni.setStorage({
			key: checkUpdateKey,
			data: today
		});
		uniCloud.callFunction({
			name: 'chb-check-update',
			data: {
				appid: plus.runtime.appid,
				version: plus.runtime.version
			},
			success(e) {
				uni.hideLoading();
				if (e.result.isUpdate) {
					//需要更新
					// 提醒用户更新
					uni.showModal({
						title: '更新提示',
						content: e.result.note ? e.result.note : '是否选择更新',
						success: ee => {
							if (ee.confirm) {
								if (systemInfo.platform == "ios") {
									plus.runtime.openURL(e.result.url);
								} else {
									uni.showLoading({
										title: "正在下载"
									});
									const task = uni.downloadFile({
										url: e.result.url,
										success: (downloadResult) => {
											uni.hideLoading();
											if (downloadResult.statusCode === 200) {
												plus.runtime.install(downloadResult.tempFilePath, {
													force: false
												}, (e) => {
													uni.showModal({
														showCancel: false,
														confirmText: "重启",
														content: "安装完成",
														success: (r) => {
															if (r.confirm) {
																plus.runtime.restart();
															}
														}
													})
												}, (err) => {
													uni.showModal({
														showCancel: false,
														confirmText: "确定",
														content: "安装失败"
													});
												});
											}
										},
										fail: err => {
											//this.downloadError(err);
										}
									});

									task.onProgressUpdate((e) => {

									});
								}
							}
						}
					});
				} else {
					if (callback) {
						callback("已经是最新版")
					}
				}
			}
		});
	}
}
/**
 * 计算2点的距离
 * @param {Object} fromLatlng
 * @param {Object} toLatlng
 */
const mapDistance = function(fromLatlng, toLatlng) {
	return new Promise((resolve, reject) => {
		console.log(fromLatlng)
		uni.request({
			url: `https://apis.map.qq.com/ws/distance/v1/matrix`,
			data: {
				mode: "bicycling",
				from: fromLatlng,
				to: toLatlng,
				key: "ZWYBZ-HOSWD-S2X4S-HHPBQ-YKY7Z-5NFK5"
			},
			success: (res) => {
				console.log(res)
				resolve(res.data.result.rows);
			},
			fail: (err) => {
				console.log(err)
				reject();
			}
		})
	})
}
/**
 * 处理送达时间的名称，到底是显示今天还是日期
 * @param {Object} info
 */
const checkDeliveryHour = function(info) {
	if (!info.deliveryHour) {
		return;
	}
	let deliDay = dateFormat(info.deliveryHour.id, 'MM月dd日');
	let today = dateFormat(false, 'MM月dd日');
	if (deliDay == today) {
		info.deliveryHour.name = '今天';
	} else {
		info.deliveryHour.name = deliDay;
	}
}

export {
	updateCartNumber,
	incrCartNumber,
	getCartSumNumber,
	navToGoodsPage,
	navToGoodsItemPage,
	navToLoginPage,
	navToCreateOrder,
	getUserLocation,
	showLoginDialog,
	navToPayOrder,
	updateGoodsTags,
	navToOrderGoodsList,
	dateFormat,
	miaoshaCountDown,
	navToOrderDetail,
	clearCountDownTimer,
	getOrderStateExp,
	getOrderTypes,
	getGoodsTypes,
	navToDocPage,
	navToDocPageByType,
	navToDocWebPage,
	navMicLogin,
	uploadFiles,
	cloudUploadFile,
	checkAppUpdate,
	mapDistance,
	checkDeliveryHour,
	navToAdDetail
}

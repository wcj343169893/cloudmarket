<template>
	<view class="container" v-if="loaded">
		<pageHeader ref="pageHeader" :referer="referer"></pageHeader>
		<view class="carousel">
			<swiper indicator-dots circular="true" duration="400">
				<swiper-item class="swiper-item" v-for="(item, index) in imgs" :key="index">
					<view class="image-wrapper">
						<image :src="item" class="loaded" mode="aspectFill"></image>
					</view>
				</swiper-item>
			</swiper>
		</view>
		<yudingPage v-if="yuding" :yuding="yuding" :price="price" :title="title" :subTitle="subTitle"></yudingPage>
		<tuangouPage v-else-if="tuangou" :tuangou="tuangou" :price="originPrice" :title="title" :subTitle="subTitle"
		 :monthlySale="monthlySale" :stock="stock"></tuangouPage>
		<block v-else>
			<miaoshaPage v-if="hasMiaosha" :miaosha="miaosha"></miaoshaPage>
			<view class="introduce-section">
				<text class="title">{{ title }}</text>
				<view class="sub-title" v-if="subTitle && subTitle != ''">
					<text>{{ subTitle }}</text>
				</view>
				<view class="price-box">
					<text class="price">{{ price }}</text>
					<block v-if="originPrice > 0 && originPrice > price">
						<text class="price del">{{ originPrice }}</text>
						<text class="coupon-tip">{{ zhekou }}折</text>
					</block>
				</view>
				<view class="bot-row">
					<text>月售: {{ monthlySale }}</text>
					<text>库存: {{ stock }}</text>
					<text>浏览量: {{ visite }}</text>
				</view>
			</view>
		</block>

		<!--  分享 -->
		<!-- <view class="share-section" @click="share">
			<view class="share-icon">
				<text class="yticon icon-xingxing"></text>
				返
			</view>
			<text class="tit">该商品分享可领49减10红包</text>
			<text class="yticon icon-bangzhu1"></text>
			<view class="share-btn">
				立即分享
				<text class="yticon icon-you"></text>
			</view>
		</view> -->

		<view class="c-list " v-if="hasSku">
			<view class="skuDialogPanel">
				<view v-for="(item, index) in skuMap" :key="index">
					<view class="skuname">
						<text>{{ item.name }}</text>
					</view>
					<view class="skuoptions">
						<view v-for="(sname, index2) in item.child" :key="index2" class="skuoptions__item" :class="{ active: item.active == index2, disabled: sname.disabled }"
						 @click="selectSku(index, index2)">
							<text>{{ sname.value }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="c-list" v-if="isSold == 1">
			<view class="c-row amount b-b">
				<text class="tit">数量</text>
				<view class="bz-list con">
					<uni-number-box :min="0" :max="limit" :stock="stock" :keys="id + '_' + sku_id" :value="amount" @change="bindChange"></uni-number-box>
				</view>
			</view>
			<view class="c-row b-b">
				<text class="tit">服务</text>
				<view class="bz-list con">
					<block v-for="(ser, serIndex) in service" :key="serIndex">
						<text class="item">·{{ ser }}</text>
					</block>
				</view>
			</view>
			<view class="c-row b-b" v-if="net_weight!=''">
				<text class="tit">净含量</text>
				<view class="bz-list con">
					<text class="item">{{ net_weight }}</text>
				</view>
			</view>
			<view class="c-row b-b" v-if="guarantee_period!=''">
				<text class="tit">保质期</text>
				<view class="bz-list con">
					<text class="item">{{ guarantee_period }}</text>
				</view>
			</view>
			<view class="c-row" v-if="storage_condition!=''">
				<text class="tit">保存条件</text>
				<view class="bz-list con">
					<text class="item">{{ storage_condition }}</text>
				</view>
			</view>
		</view>
		<!-- 评价 -->
		<view id="rating" class="rating-wrap column">
			<view class="e-header" @click="navTo('/pages/product/comment')">
				<text class="tit">商品评价</text>
				<text class="number">({{ commentCount || 0 }})</text>
				<text class="tip">好评率<text class="number">{{ score * 100 | toFixed}}%</text></text>
				<text class="yticon icon-you"></text>
			</view>
			<commentPage :commentTagStatics="commentTagStatics" :comment="comment"></commentPage>
		</view>
		<view class="detail-desc">
			<view class="d-header"><text>图文详情</text></view>
			<rich-text :nodes="description"></rich-text>
		</view>

		<!-- 底部操作菜单 -->
		<view class="page-bottom" :class="{ show: canAddCart }">
			<view class="options">
				<navigator url="/pages/index/cart" open-type="switchTab" class="p-b-btn">
					<text class="yticon icon-gouwuche">
						<!-- <text class="sub" v-if="cartSumCount > 0">{{ cartSumCount }}</text> --></text>
				</navigator>
			</view>
			<block v-if="isSold == 0"><text class="warning">已下架或已删除</text></block>
			<block v-else-if="yuding">
				<button class="add-btn" v-if="yuding.isBegin" @click="payDingjin()">支付定金</button>
				<button class="add-btn disabled" v-else>预售未开始</button>
			</block>
			<block v-else-if="tuangou">
				<block v-if="tuangou.isBegin">
					<button class="add-btn" @click="addToCart">加入购物车</button>
					<button class="add-btn spec" @click="buy">立即购买</button>
				</block>
				<button class="add-btn disabled" v-else>团购未开始</button>
			</block>
			<block v-else>
				<button class="add-btn" @click="addToCart">加入购物车</button>
				<button class="add-btn spec" @click="buy">立即购买</button>
			</block>
		</view>
		<!-- 分享 -->
		<share ref="share" :contentHeight="580" :shareList="shareList"></share>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import share from '@/components/share';
	import {
		getGoodsInfo,
		editCart
	} from '@/common/request.js';
	import pageHeader from './components/detail-page-header'; //页面头
	import yudingPage from './components/yuding'; //预定页面
	import tuangouPage from './components/tuangou'; //团购页面
	import miaoshaPage from './components/miaosha'; //秒杀页面
	import commentPage from './components/comment.vue'; //评论列表
	import {
		showLoginDialog,
		navToLoginPage,
		navToCreateOrder,
		updateGoodsTags,
		miaoshaCountDown,
		getCartSumNumber,
		clearCountDownTimer
	} from '@/common/functions.js';
	let _anchorList = [];
	export default {
		components: {
			share,
			pageHeader,
			yudingPage,
			miaoshaPage,
			tuangouPage,
			commentPage
		},
		data() {
			return {
				id: 0,
				shopid: 0,
				sku_id: 0,
				preview: undefined, //是否预览
				isSubmit: false,
				default_sku_id: 0,
				title: '',
				subTitle: '',
				stock: 0,
				visite: 0,
				isSold: 1,
				src: '',
				imgs: [], //轮播图
				score: 0,
				price: 0,
				limit: 0,
				skuname: '',
				skus: [],
				originPrice: 0,
				monthlySale: 0,
				categories: [],
				miaosha: {},
				manjian: {},
				description: '',
				zhekou: 0,
				service: [],
				amount: 1,
				favorite: false,
				hasSku: false,
				guarantee_period: '',
				storage_condition: '常温',
				net_weight: '',
				shareList: [],
				skuMap: [],
				cartMap: {},
				yuding: false,
				tuangou: false,
				hasMiaosha: false,
				nameMap: {},
				cart: {},
				cartSumCount: 0,
				canAddCart: false,
				share: "", //分享语
				referer: "",
				commentCount: 0,
				commentTagStatics: [],
				comment: [],
			};
		},
		computed: {
			...mapState(['hasLogin', 'userInfo'])
		},
		async onLoad(options) {
			if (!options.id) {
				//商品id不存在
				this.$api.msg('商品不存在');
				setTimeout(() => {
					uni.navigateBack();
				}, 1500);
				return;
			}
			//是否预览
			if (options.preview) {
				this.preview = options.preview;
			}
			console.log("product", options);
			//商品id
			this.id = options.id;
			//商品规格
			if (options.sid) {
				this.default_sku_id = +options.sid;
			}
			if (options.referer) {
				this.referer = options.referer;
			}
			if (options.u) {
				this.setInvite(options.u)
			}
			this.loadData();
		},
		onUnload() {
			console.log('product onUnload');
			//关闭秒杀定时器
			clearCountDownTimer();
			//清除商品缓存
			uni.removeStorage({
				key: "goodsInfo"
			})
		},
		onShow() {
			this.isSubmit = false;
		},
		onPageScroll(e) {
			this.$refs.pageHeader && this.$refs.pageHeader.pageScroll(e);
		},
		// #ifdef MP-WEIXIN
		onShareAppMessage(res) {
			if (res.from === 'button') {
				// 来自页面内分享按钮
				console.log(res.target);
			}
			let query = [`id=${this.id}`, 'referer=share'];
			if (this.default_sku_id) {
				query.push(`sid=${this.default_sku_id}`)
			}
			let title = this.title;
			if (this.userInfo && this.userInfo.my_invite_code) {
				query.push('u=' + this.userInfo.my_invite_code);
			}
			if (this.share && this.share.title) {
				title = this.share.title;
			}
			return {
				title: title,
				path: '/pages/product/product?' + query.join('&')
			};
		},
		//#endif
		methods: {
			...mapMutations(['setInvite']),
			async loadData() {
				let key = "goodsInfo";
				//优先读取缓存
				let info = uni.getStorageSync(key);
				if (info) {
					try {
						this.buildGoodsInfo(info);
					} catch (e) {
						//TODO handle the exception
						console.log(e);
					}
				}
				//再次读取数据库，获得详细信息
				getGoodsInfo({
					id: this.id,
					preview: this.preview
				}).then(
					item => {
						this.miaosha = {};
						this.yuding = false;
						this.tuangou = false;
						this.buildGoodsInfo(item);
						this.canAddCart = true;
						this.calcAnchor();
						uni.setStorage({
							key: key,
							data: item
						})
					},
					err => {
						//this.$api.msg("商品已删除或下架",20000);
						this.canAddCart = true;
						this.isSold = 0;
					}
				);

				//获得购物车总数量
				//this.cartMapSumCount = getCartSumNumber();
			},
			buildGoodsInfo(item) {
				console.log(item);
				this.imgs = [];
				updateGoodsTags(item, false);
				this.checkYuding(item);
				this.checkTuangou(item);
				this.checkMiaosha(item);
				//计算评论标签
				this.checkCommentTags(item);
				//计算好评率
				this.checkCommentStar(item);
				//倒序评论列表
				this.checkComment(item);
				console.log('default_sku_id:', this.default_sku_id);
				for (let field in item) {
					this[field] = item[field];
				}
				if (this.description.trim() != '') {
					let desMap = [];
					this.description.split(';').map(ele => {
						desMap.push(`<img src="${ele}" style="width:100%;display:block;"/>`);
					});
					this.description = desMap.join('');
				}
				this.imgs.unshift(item.src);
				if (item.hasSku) {
					//多规格
					let skuMap = [];
					for (let n in item.skuname) {
						skuMap.push({
							name: item.skuname[n],
							active: 0,
							child: [],
							childName: []
						});
					}
					let nameMap = {};
					let miaoshaSkuName = [];
					//所有存在的规格名称，例如：aabb，bbcc
					let nameHash = [];
					item.skus.map(sku => {
						let names = sku.name.split('&gt;');
						names.map((n, i) => {
							if (skuMap[i]['childName'].indexOf(n) == -1) {
								skuMap[i]['child'].push({
									value: n,
									//stock: sku.stock,//没有用
									disabled: false
								});
								skuMap[i]['childName'].push(n);
							}
						});
						//name排序之后再拼接起来
						let nameKey = names.sort().join('&gt;');
						nameHash.push(nameKey);
						nameMap[nameKey] = sku;
						this.cartMap[sku.id] = 1;
					});

					let selectSku = [];
					//地址栏传递过来，强制选中执行型号
					if (this.default_sku_id > 0) {
						selectSku = item.skus.filter(sku => {
							return this.default_sku_id == sku.id;
						});
					}
					if (selectSku.length == 0) {
						//优先选中秒杀型号
						selectSku = item.skus.filter(sku => {
							return this.miaosha && this.miaosha.sku_id == sku.id;
						});
					}
					if (selectSku.length == 0) {
						//其次选中默认型号
						selectSku = item.skus.filter(sku => {
							return this.default_checked_sku_id == sku.id;
						});
					}
					if (selectSku.length == 0) {
						//实在没有，则选中第一个型号
						selectSku = item.skus;
					}
					console.log("selectSku", selectSku);
					miaoshaSkuName = selectSku[0].name.split('&gt;');

					this.skuMap = skuMap;
					this.nameMap = nameMap;
					this.nameHash = nameHash;
					console.log(this.cartMap)
					console.log("miaoshaSkuName", miaoshaSkuName)
					if (miaoshaSkuName.length > 0) {
						//默认选中秒杀商品，否则第一个
						skuMap.map((s, i) => {
							//找到秒杀规格所在位置
							let i2 = s.childName.findIndex(sitem => miaoshaSkuName.indexOf(sitem) != -1);
							if (i2 < 0) {
								//没找到对应的型号
								console.log('默认没找到对应的型号', miaoshaSkuName);
								i2 = 0;
							}
							this.selectSku(i, i2);
						});
					} else {
						this.selectSku(0, 0);
					}
				} else {
					//计算折扣
					this.amount = this.cartMap[0] > 0 ? this.cartMap[0] : 1;
					this.getSaleRate();
				}
				this.loaded = true;
			},
			checkYuding(item) {
				if (!item.yuding) {
					return false;
				}
				console.log('有預定');
				let time = new Date().getTime();
				let isBegin = item.yuding.beginTime < time;
				let statusSubName = '距预售开始';
				if (isBegin) {
					statusSubName = '距预售结束';
				}
				//如果预定没开始，是不能预定的，在预定时间内，价格为预订价
				//处理付尾款时间
				Object.assign(item.yuding, {
					hour: '00',
					minute: '00',
					second: '00',
					startTime: time,
					isBegin: isBegin,
					statusSubName: statusSubName
				});
				if (!isBegin) {
					//未开始
					miaoshaCountDown(item.yuding, item.yuding.beginTime, () => {
						this.checkYuding(item);
					});
				} else if (item.yuding.endTime < time) {
					//已结束,按正常价格购买
					item.yuding.statusSubName = '已结束';
				} else {
					item.yuding.startTime = time;
					miaoshaCountDown(item.yuding, item.yuding.endTime, () => {
						this.checkYuding(item);
					});
				}
			},
			checkTuangou(item) {
				if (!item.tuangou) {
					return false;
				}
				console.log('有預定');
				let time = new Date().getTime();
				let isBegin = item.tuangou.beginTime < time;
				let statusSubName = '距团购开始';
				if (isBegin) {
					statusSubName = '距团购结束';
				}
				//如果预定没开始，是不能预定的，在预定时间内，价格为预订价
				//处理付尾款时间
				Object.assign(item.tuangou, {
					hour: '00',
					minute: '00',
					second: '00',
					startTime: time,
					isBegin: isBegin,
					statusSubName: statusSubName
				});
				if (!isBegin) {
					//未开始
					miaoshaCountDown(item.tuangou, item.tuangou.beginTime, () => {
						this.checkTuangou(item);
					});
				} else if (item.tuangou.endTime < time) {
					//已结束,按正常价格购买
					item.tuangou.statusSubName = '已结束';
				} else {
					item.tuangou.startTime = time;
					miaoshaCountDown(item.tuangou, item.tuangou.endTime, () => {
						this.checkTuangou(item);
					});
				}
			},
			/**
			 * 计算商品评论标签，这里只显示最多的6个
			 * @param {Object} item
			 */
			checkCommentTags(item) {
				let tags = [];
				if (item.commentTagStatics) {
					//item.commentTagStatics.sort();
					for (let tag in item.commentTagStatics) {
						tags.push({
							name: tag,
							count: item.commentTagStatics[tag]
						})
					}
					tags.sort((a, b) => {
						return b.count - a.count;
					})
				}
				item.commentTagStatics = tags;
			},
			/**
			 * 倒序评论列表
			 * @param {Object} item
			 */
			checkComment(item) {
				if (item.comment) {
					//倒序排列
					item.comment.reverse();
				}
			},
			/**
			 * 计算好评率
			 * @param {Object} item
			 */
			checkCommentStar(item) {
				//计算好评率
				if (item.starStatics) {
					let sum = 0;
					let good = 0;
					for (let star in item.starStatics) {
						if (star > 2) {
							good += item.starStatics[star];
						}
						sum += item.starStatics[star];
					}
					item.score = good / sum;
				}
			},
			checkMiaosha(item) {
				if (!item.miaosha) {
					return false;
				}
				//秒杀状态，未开始，抢购中，已结束
				let time = new Date().getTime();
				item.miaosha.isEnd = false;
				item.miaosha.isStart = true;
				item.miaosha.hour = '00';
				item.miaosha.minute = '00';
				item.miaosha.second = '00';
				item.miaosha.startTime = time;
				item.hasMiaosha = true;
				console.log('秒杀时间检测：', time, item.miaosha.beginTime);
				if (time < item.miaosha.beginTime) {
					item.miaosha.isStart = false;
					item.miaosha.statusName = '未开始';
					item.miaosha.statusSubName = '距开始';
					//@todo 倒计时开始时间,结束之后更改状态
					miaoshaCountDown(item.miaosha, item.miaosha.beginTime, () => {
						updateGoodsTags(item);
						this.checkMiaosha(item);
						this.updateMiaoshaPrice(item);
					});
				} else if (time > item.miaosha.endTime) {
					item.miaosha.statusName = '已结束';
					item.miaosha.statusSubName = '';
					item.miaosha.isEnd = true;
					item.hasMiaosha = false;
				} else {
					item.miaosha.isStart = true;
					item.miaosha.statusName = '抢购中';
					item.miaosha.statusSubName = '距结束';
					//@todo 启动倒计时
					miaoshaCountDown(item.miaosha, item.miaosha.endTime, () => {
						updateGoodsTags(item);
						this.checkMiaosha(item);
						this.updateMiaoshaPrice(item);
					});
				}
			},
			updateMiaoshaPrice(item) {
				//没有型号或者型号相等
				if (!this.sku_id || this.sku_id == item.miaosha.sku_id) {
					this.originPrice = item.originPrice;
					this.price = item.price;
					this.limit = item.miaosha.limit;
					this.stock = item.miaosha.stock;
					//计算折扣
					this.getSaleRate();
				}
			},
			//分享
			/* 	share() {
					this.$refs.share.toggleMask();
				}, */
			//收藏
			toFavorite() {
				this.favorite = !this.favorite;
			},
			addToCart() {
				if (!this.hasLogin) {
					showLoginDialog();
					return;
				}
				uni.showLoading({
					title: '正在加载',
					mask: true
				});
				if (!this.cartMap[this.sku_id]) {
					this.cartMap[this.sku_id] = 0;
				}
				if (this.cartMap[this.sku_id] > this.stock) {
					uni.hideLoading();
					let msg = '抱歉,该商品仅剩' + this.stock + '件';
					if (this.stock == 0) {
						msg = '抱歉,该商品已卖光了';
					}
					this.$api.msg(msg);
					return;
				}
				//处理limit和stock
				if (this.cartMap[this.sku_id] > this.limit) {
					uni.hideLoading();
					this.$api.msg('抱歉,该商品限购' + this.limit + '件');
					return;
				}
				//累加一件商品
				this.cartMap[this.sku_id] = this.amount;
				editCart({
					id: this.shopid,
					//stationId: this.stationId,
					goods_id: this.id,
					sku_id: this.sku_id,
					price: this.price,
					src: this.src,
					checked: 1,
					appends: 1,
					amount: this.cartMap[this.sku_id]
				}).then(
					res => {
						this.$api.msg('加入成功', 1500, false, 'success');
						console.log(res);
						//这里算不准
						//this.cartMapSumCount = incrCartNumber(1);
						//this.cartMapSumCount = incrCartNumber(this.amount);
						//请求网络，获得购物车数量
						this.$store.dispatch('getCartCount');
						// uni.$emit("refreshCart");
					},
					err => {
						this.$api.msg(err.message || '加入失败');
					}
				);
			},
			bindChange(number, id) {
				console.log(number, id);
				this.amount = +number;
			},
			//支付一件的定金,判断是否有效
			payDingjin() {
				if (!this.yuding.isBegin) {
					this.$api.msg('预售未开始');
					return;
				}
				this.buy();
			},
			/**规格选择,默认选中秒杀商品**/
			selectSku(index, index2) {
				//被点击的name
				let clickName = this.skuMap[index]['child'][index2];
				if (clickName.disabled || clickName.stock < 1) {
					console.log('点击禁用按钮', clickName);
					return false;
				}
				this.skuMap[index].active = index2;
				//console.log(this.skuMap);
				//更新已选择规格
				let names = [];
				this.skuMap.forEach((skuname, ind) => {
					names.push(skuname['child'][skuname.active].value);
					//点击的其他行
					if (ind != index) {
						skuname['child'].forEach(n2 => {
							let joinName = [clickName.value, n2.value].sort().join('&gt;');
							//不存在组合或者库存不足
							n2.disabled = this.nameHash.indexOf(joinName) == -1 || this.nameMap[joinName].stock < 1;
						});
					}
				});
				//匹配skuid
				let sku = this.nameMap[names.sort().join('&gt;')];
				console.log(sku);
				this.sku_id = sku.id;
				this.stock = sku.stock;
				this.limit = sku.limit;
				this.price = sku.price;
				this.originPrice = sku.originPrice > 0 ? sku.originPrice : 0;
				this.amount = this.cartMap[this.sku_id] > 0 ? this.cartMap[this.sku_id] : 1;
				//计算折扣
				this.getSaleRate();
			},
			getSaleRate() {
				if (this.originPrice > 0) {
					this.zhekou = ((this.price / this.originPrice) * 10).toFixed(1);
				}
			},
			//单品直接购买，如果未登录，提示
			buy() {
				if (!this.hasLogin) {
					showLoginDialog();
					return;
				}
				if (this.isSubmit) {
					return;
				}
				this.isSubmit = true;
				uni.setStorage({
					key: 'settlementCartsIds',
					data: {
						shopid: this.shopid,
						goods: {
							id: this.id,
							sku_id: this.sku_id,
							amount: this.amount
						}
					},
					success: () => {
						navToCreateOrder();
					}
				});
			},
			refreshList() {},
			stopPrevent() {},
			//计算锚点参数
			async calcAnchor() {
				const size = await new Promise(res => {
					uni.createSelectorQuery()
						.select('#rating')
						.boundingClientRect(data => {
							res(data);
						})
						.exec();
				});
				const headerHeight = this.systemInfo.statusBarHeight + this.systemInfo.navigationBarHeight;
				const a1 = (size ? size.top : 0) - headerHeight;
				const a2 = (size ? size.bottom : 0) + uni.upx2px(12) - headerHeight;
				this.$refs.pageHeader.anchorList[1].top = a1;
				this.$refs.pageHeader.anchorList[2].top = a2;
				_anchorList = [0, a1, a2];
			}
		}
	};
</script>

<style lang="scss" scoped>
	page,
	.container {
		background: $page-color-base;
		padding-bottom: 100upx;
	}

	.icon-you {
		font-size: $font-base + 2upx;
		color: #888;
	}

	.carousel {
		height: 750upx;
		position: relative;

		swiper {
			height: 100%;
		}

		.image-wrapper {
			width: 100%;
			height: 100%;
		}

		.swiper-item {
			display: flex;
			justify-content: center;
			align-content: center;
			height: 750upx;
			overflow: hidden;

			image {
				width: 100%;
				height: 100%;
			}
		}
	}

	/* 标题简介 */
	.introduce-section {
		background: #fff;
		padding: 20upx 30upx;
		color: $font-color-dark;

		.title {
			font-size: $font-lg;
		}

		.info-box {
			display: flex;
			align-items: baseline;
			font-size: $font-sm;
			margin-bottom: 8upx;

			.name {
				margin-right: 18upx;
				font-weight: 500;
			}

			.desc {
				display: flex;
				flex-direction: column;
			}
		}

		.price-box {
			display: flex;
			align-items: baseline;
			height: 64upx;
			padding: 10upx 0;
			font-size: 26upx;
			color: $uni-color-primary;
		}

		.price {
			font-size: $font-lg + 2upx;
		}

		.m-price {
			margin: 0 12upx;
			color: $font-color-light;
			text-decoration: line-through;
		}

		.coupon-tip {
			align-items: center;
			padding: 4upx 10upx;
			background: $uni-color-primary;
			font-size: $font-sm;
			color: #fff;
			border-radius: 6upx;
			line-height: 1;
			transform: translateY(-4upx);
		}

		.bot-row {
			display: flex;
			align-items: center;
			height: 50upx;
			font-size: $font-sm;
			color: $font-color-light;

			text {
				flex: 1;
			}
		}
	}

	/* 分享 */
	.share-section {
		display: flex;
		align-items: center;
		color: $font-color-base;
		background: linear-gradient(to left, #fdf5f6, #fbebf6);
		padding: 12upx 30upx;

		.share-icon {
			display: flex;
			align-items: center;
			width: 70upx;
			height: 30upx;
			line-height: 1;
			border: 1px solid $uni-color-primary;
			border-radius: 4upx;
			position: relative;
			overflow: hidden;
			font-size: 22upx;
			color: $uni-color-primary;

			&:after {
				content: '';
				width: 50upx;
				height: 50upx;
				border-radius: 50%;
				left: -20upx;
				top: -12upx;
				position: absolute;
				background: $uni-color-primary;
			}
		}

		.icon-xingxing {
			position: relative;
			z-index: 1;
			font-size: 24upx;
			margin-left: 2upx;
			margin-right: 10upx;
			color: #fff;
			line-height: 1;
		}

		.tit {
			font-size: $font-base;
			margin-left: 10upx;
		}

		.icon-bangzhu1 {
			padding: 10upx;
			font-size: 30upx;
			line-height: 1;
		}

		.share-btn {
			flex: 1;
			text-align: right;
			font-size: $font-sm;
			color: $uni-color-primary;
		}

		.icon-you {
			font-size: $font-sm;
			margin-left: 4upx;
			color: $uni-color-primary;
		}
	}

	.c-list {
		font-size: $font-sm + 2upx;
		color: $font-color-base;
		background: #fff;
		margin-top: 16upx;

		.c-row {
			display: flex;
			align-items: center;
			padding: 20upx 30upx;
			position: relative;

			&.b-b:after {
				left: $page-row-spacing;
			}
		}

		.tit {
			width: 140upx;
			flex: 1;
		}

		.con {
			color: $font-color-dark;

			.selected-text {
				margin-right: 10upx;
			}
		}

		.bz-list {
			font-size: $font-sm + 2upx;
			color: $font-color-dark;

			.item {
				margin-right: 8upx;
				font-size: $font-sm;
			}
		}

		.con-list {
			flex: 1;
			display: flex;
			flex-direction: column;
			color: $font-color-dark;
			line-height: 40upx;
		}

		.red {
			color: $uni-color-primary;
		}
	}

	/* 评价 */
	.eva-section {
		display: flex;
		flex-direction: column;
		padding: 20upx 30upx;
		background: #fff;
		margin-top: 16upx;

		.e-header {
			display: flex;
			align-items: center;
			height: 70upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;

			.tit {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				margin-right: 4upx;
			}

			.tip {
				flex: 1;
				text-align: right;
			}

			.icon-you {
				margin-left: 10upx;
			}
		}
	}

	.eva-box {
		display: flex;
		padding: 20upx 0;

		.portrait {
			flex-shrink: 0;
			width: 80upx;
			height: 80upx;
			border-radius: 100px;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			font-size: $font-base;
			color: $font-color-base;
			padding-left: 26upx;

			.con {
				font-size: $font-base;
				color: $font-color-dark;
				padding: 20upx 0;
			}

			.bot {
				display: flex;
				justify-content: space-between;
				font-size: $font-sm;
				color: $font-color-light;
			}
		}
	}

	/*  详情 */
	.detail-desc {
		background: #fff;
		margin-top: 16upx;
		overflow-x: hidden;

		.d-header {
			display: flex;
			justify-content: center;
			align-items: center;
			height: 80upx;
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			position: relative;

			text {
				padding: 0 20upx;
				background: #fff;
				position: relative;
				z-index: 1;
			}

			&:after {
				position: absolute;
				left: 50%;
				top: 50%;
				transform: translateX(-50%);
				width: 300upx;
				height: 0;
				content: '';
				border-bottom: 1px solid #ccc;
			}
		}

		img {
			max-width: 100%;
			display: block;
		}
	}

	/*  弹出层 */
	.popup {
		position: fixed;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 99;

		&.show {
			display: block;

			.mask {
				animation: showPopup 0.2s linear both;
			}

			.layer {
				animation: showLayer 0.2s linear both;
			}
		}

		&.hide {
			.mask {
				animation: hidePopup 0.2s linear both;
			}

			.layer {
				animation: hideLayer 0.2s linear both;
			}
		}

		&.none {
			display: none;
		}

		.mask {
			position: fixed;
			top: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			background-color: rgba(0, 0, 0, 0.4);
		}

		.layer {
			position: fixed;
			z-index: 99;
			bottom: 0;
			width: 100%;
			min-height: 40vh;
			border-radius: 10upx 10upx 0 0;
			background-color: #fff;

			.btn {
				height: 66upx;
				line-height: 66upx;
				border-radius: 100upx;
				background: $uni-color-primary;
				font-size: $font-base + 2upx;
				color: #fff;
				margin: 30upx auto 20upx;
			}
		}

		@keyframes showPopup {
			0% {
				opacity: 0;
			}

			100% {
				opacity: 1;
			}
		}

		@keyframes hidePopup {
			0% {
				opacity: 1;
			}

			100% {
				opacity: 0;
			}
		}

		@keyframes showLayer {
			0% {
				transform: translateY(120%);
			}

			100% {
				transform: translateY(0%);
			}
		}

		@keyframes hideLayer {
			0% {
				transform: translateY(0);
			}

			100% {
				transform: translateY(120%);
			}
		}
	}

	/* 底部操作菜单 */
	.page-bottom {
		position: fixed;
		left: 0upx;
		bottom: -200upx;
		z-index: 95;
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		background: rgba(255, 255, 255, 0.9);
		padding: 16upx 30upx 36upx;
		transition: 0.4s;

		.options {
			flex: 1;
		}

		&.show {
			bottom: var(--window-bottom);
		}

		.warning {
			font-size: $font-base;
			color: $font-color-warning;
		}
	}

	.add-btn {
		height: 70upx;
		line-height: 70upx;
		font-size: $font-lg;
		color: #fff;
		background-color: $base-color;
		border-radius: 10upx;
		margin-left: 20upx;

		&.disabled {
			background-color: $font-color-disabled;
		}

		&.spec {
			background-color: $btn-color-spec;
		}
	}

	.skuDialogPanel {
		padding: 20upx 30upx;

		.title {
			font-size: $font-lg;
			color: $font-color-dark;
		}

		.skuname {
			margin: 8upx 0;
			color: $font-color-light;
		}

		.skuoptions {
			flex-wrap: wrap;
			text-align: center;
			display: flex;
			/* padding-left: 40upx; */
		}

		$yellow-color: $uni-color-success;

		.skuoptions__item {
			/* width: 180upx; */
			border: 1px solid $font-color-disabled;
			border-radius: 8upx;
			padding: 8upx 18upx;
			margin-left: 20upx;
			margin-bottom: 20upx;

			&.active {
				border: 1px solid $yellow-color;
				color: $font-color-emphasis;
			}

			&.disabled {
				border-color: #e8e8e8;
				color: $font-color-disabled;
			}
		}
	}

	.miaosha-section {
		$base-c: #e35650;
		display: flex;
		background: $base-c;
		font-size: $font-ssm;
		text-align: center;
		height: 43px;
		align-items: center;

		.title {
			flex: 1;
			color: #fff;

			.name {
				font-size: $font-base;
				margin-right: 12upx;
			}
		}

		.time {
			color: $base-c;
			width: 266upx;
			background: #fcefea;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;

			.ti {
				background: $base-c;
				color: #fff;
				margin: 0 8upx;
				padding: 0 4upx;
			}
		}

		/* 准备中 */
		&.ready {
			$base-c: #54b85d;
			background: $base-c;

			.time {
				color: $base-c;
				background: #f3f5f3;

				.ti {
					background: $base-c;
				}
			}
		}
	}

	.yuding-section {
		$base-c: #e35650;
		display: flex;
		align-items: center;
		background: $base-c;
		font-size: $font-ssm;
		text-align: center;
		color: #fff;

		.price {
			color: #fff;
			font-size: 1.4em;
		}

		.title {
			flex: 1;
			text-align: left;
			padding: 0 20upx;
			line-height: 1;

			.name {
				margin-right: 12upx;
			}
		}

		.sub-title {
			font-size: 1.2em;
			color: #fff;
		}

		.time-area {
			width: 266upx;
			background: #fcefea;
			padding: 12upx 0;
			color: $base-c;

			.ti {
				background: $base-c;
				color: #fff;
				margin: 0 8upx;
				padding: 0 4upx;
			}
		}

		&.ready {
			$base-c: #54b85d;
			background: $base-c;

			.time-area {
				color: $base-c;
				background: #f3f5f3;

				.ti {
					background: $base-c;
				}
			}
		}
	}

	.icon-gouwuche {
		font-size: 48upx;
	}

	.sub-title {
		font-size: $font-sm;
		color: $font-color-disabled;
	}

	/* 评价 */
	.rating-wrap {
		padding: 20rpx 30rpx 10rpx;
		background: #fff;
		margin-top: 12rpx;

		&.no-data {
			padding: 10rpx 30rpx 10rpx;
		}

		.e-header {
			display: flex;
			align-items: center;
			height: 70rpx;
			font-size: 28rpx;
			color: #333;
		}

		.number {
			font-size: $font-sm;
			color: $font-color-light;
			margin-left: 8rpx;
		}

		.tit {
			font-size: 32rpx;
			color: #333;
			font-weight: 700;
			margin-right: 4rpx;
		}

		.tip {
			flex: 1;
			font-size: 26rpx;
			color: #999;
			text-align: right;
		}

		.icon-you {
			margin-left: 8rpx;
			font-size: 24rpx;
			color: #999;
		}

		.mix-rating-item::after {
			border: 0;
		}
	}
</style>

<template>
	<view class="container">
		<view class="carousel">
			<swiper indicator-dots circular="true" duration="400">
				<swiper-item class="swiper-item" v-for="(item, index) in imgs" :key="index">
					<view class="image-wrapper"><image :src="item" class="loaded" mode="aspectFill"></image></view>
				</swiper-item>
			</swiper>
		</view>
		<block v-if="yuding">
			<view class="yuding-section" :class="{ ready: !yuding.isBegin }">
				<view class="title">
					<view class="sub-title">
						<text class="name">定&nbsp;金</text>
						<text class="price">{{ yuding.price }}</text>
					</view>
					<view class="">
						<text class="name">预售价</text>
						<text class="price">{{ price - yuding.deduction + yuding.price }}</text>
					</view>
				</view>
				<view class="time-area">
					<view class="">
						<text>{{ yuding.statusSubName }}:</text>
					</view>
					<view class="time">
						<text class="ti hour">{{ yuding.hour }}</text>
						<text>:</text>
						<text class="ti minute">{{ yuding.minute }}</text>
						<text>:</text>
						<text class="ti second">{{ yuding.second }}</text>
					</view>
				</view>
			</view>
			<view class="introduce-section">
				<text class="title">{{ title }}</text>
				<view class="info-box" v-if="!yuding.isBegin">
					<text class="name">定金</text>
					<view class="desc">
						<text class="price">{{ yuding.price }}</text>
						<text>({{ yuding.beginTime | dateFormat('MM月dd日hh:mm') }}-{{ yuding.endTime | dateFormat('MM月dd日hh:mm') }})</text>
					</view>
				</view>
				<view class="info-box">
					<text class="name">尾款</text>
					<view class="desc">
						<text class="price">{{ price - yuding.deduction }}</text>
						<text>({{ yuding.finalPaymentBeginTime | dateFormat('MM月dd日hh:mm') }}-{{ yuding.finalPaymentEndTime | dateFormat('MM月dd日hh:mm') }})</text>
					</view>
				</view>
				<view class="info-box">
					<text class="name">流程</text>
					<text>1.付定金-2.付尾款-3.发货</text>
				</view>
			</view>
		</block>
		<block v-else>
			<block v-if="hasMiaosha">
				<view class="miaosha-section" :class="{ ready: !miaosha.isStart }">
					<view class="title">
						<text class="name">限时抢购</text>
						<text class="status">{{ miaosha.statusName }}</text>
					</view>
					<view class="time" v-if="!miaosha.isEnd">
						<text>{{ miaosha.statusSubName }}</text>
						<text class="ti hour">{{ miaosha.hour }}</text>
						<text>:</text>
						<text class="ti minute">{{ miaosha.minute }}</text>
						<text>:</text>
						<text class="ti second">{{ miaosha.second }}</text>
					</view>
				</view>
			</block>
			<view class="introduce-section">
				<text class="title">{{ title }}</text>
				<view class="price-box">
					<text class="price">{{ price }}</text>
					<block v-if="originPrice > 0">
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
						<view
							v-for="(sname, index2) in item.child"
							:key="index2"
							class="skuoptions__item"
							:class="{ active: item.active == index2, disabled: sname.disabled }"
							@click="selectSku(index, index2)"
						>
							<text>{{ sname.value }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="c-list">
			<view class="c-row amount b-b">
				<text class="tit">数量</text>
				<view class="bz-list con">
					<uni-number-box :min="0" :max="limit" :stock="stock" :keys="id + '_' + sku_id" :value="amount" @change="bindChange"></uni-number-box>
				</view>
			</view>
			<view class="c-row">
				<text class="tit">服务</text>
				<view class="bz-list con">
					<block v-for="(ser, serIndex) in service" :key="serIndex">
						<text class="item">·{{ ser }}</text>
					</block>
				</view>
			</view>
		</view>

		<view class="detail-desc">
			<view class="d-header"><text>图文详情</text></view>
			<rich-text :nodes="description"></rich-text>
		</view>

		<!-- 底部操作菜单 -->
		<view class="page-bottom" :class="{show:canAddCart}">
			<view class="options">
				<navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
					<text class="yticon icon-gouwuche"><!-- <text class="sub" v-if="cartSumCount > 0">{{ cartSumCount }}</text> --></text>
				</navigator>
			</view>
			<block v-if="yuding">
				<button class="add-btn" v-if="yuding.isBegin" @click="payDingjin()">支付定金</button>
				<button class="add-btn disabled" v-else>预定未开始</button>
			</block>
			<block  v-else>
				<button class="add-btn" @click="addToCart">加入购物车</button>
				<button class="add-btn spec" @click="buy">立即购买</button>
				
			</block>
		</view>
		<!-- 分享 -->
		<share ref="share" :contentHeight="580" :shareList="shareList"></share>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import share from '@/components/share';
import { getGoodsInfo, editCart } from '@/common/request.js';
import {
	showLoginDialog,
	navToLoginPage,
	navToCreateOrder,
	updateGoodsTags,
	miaoshaCountDown,
	incrCartNumber,
	getCartSumNumber,
	clearCountDownTimer
} from '@/common/functions.js';
export default {
	components: {
		share
	},
	data() {
		return {
			id: 0,
			sku_id: 0,
			isSubmit: false,
			default_sku_id: 0,
			title: '',
			stock: 0,
			visite: 0,
			src: '',
			imgs: [], //轮播图
			score: 0,
			price: 0,
			limit:0,
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
			shareList: [],
			skuMap: [],
			yuding: false,
			hasMiaosha: false,
			nameMap: {},
			cart: {},
			cartSumCount: 0,
			canAddCart: false
		};
	},
	computed: {
		...mapState(['hasLogin'])
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
		console.log(options);
		//商品id
		this.id = options.id;
		//商品规格
		if (options.sid) {
			this.default_sku_id = +options.sid;
		}
		this.loadData();
		/*this.shareList = await this.$api.json('shareList'); */
	},
	onUnload() {
		console.log('product onUnload');
		//关闭秒杀定时器
		clearCountDownTimer();
	},
	onShow() {
		this.isSubmit = false;
	},
	methods: {
		async loadData() {
			//优先读取缓存
			let info = uni.getStorageSync('goodsInfo');
			if (info) {
				try{
					this.buildGoodsInfo(info);
				}catch(e){
					//TODO handle the exception
					console.log(e);
				}
			}
			//再次读取数据库，获得详细信息
			getGoodsInfo({ id: this.id }).then(item => {
				this.buildGoodsInfo(item);
				this.canAddCart = true;
			});

			//获得购物车总数量
			this.cartSumCount = getCartSumNumber();
		},
		buildGoodsInfo(item) {
			this.imgs = [];
			updateGoodsTags(item,true);
			this.checkYuding(item);
			this.checkMiaosha(item);
			console.log('default_sku_id:', this.default_sku_id);
			for (let field in item) {
				this[field] = item[field];
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
					//寻找秒杀商品的定位
					if (miaoshaSkuName.length == 0) {
						if (this.default_sku_id > 0 && this.default_sku_id == sku.id) {
							miaoshaSkuName = names;
						} else if (this.miaosha && this.miaosha.sku_id == sku.id) {
							miaoshaSkuName = names;
						}
					}
				});
				this.skuMap = skuMap;
				this.nameMap = nameMap;
				this.nameHash = nameHash;
				// console.log("miaoshaSkuName",miaoshaSkuName)
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
				this.amount = this.cart[0] > 0 ? this.cart[0] : 1;
				this.getSaleRate();
			}
		},
		checkYuding(item) {
			if (!item.yuding) {
				return false;
			}
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
			if(!isBegin){
				//未开始
				miaoshaCountDown(item.yuding, item.yuding.beginTime, () => {
					this.checkYuding(item);
				});
			}else if(item.yuding.endTime < time){
				//已结束,按正常价格购买
				item.yuding.statusSubName="已结束";
				
			}else{
				item.yuding.startTime = time;
				miaoshaCountDown(item.yuding, item.yuding.endTime, () => {
					this.checkYuding(item);
				});
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
		share() {
			this.$refs.share.toggleMask();
		},
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
			if (!this.cart[this.sku_id]) {
				this.cart[this.sku_id] = 0;
			}
			if (this.cart[this.sku_id] > this.stock) {
				uni.hideLoading();
				let msg = '抱歉,该商品仅剩' + this.stock + '件';
				if (this.stock == 0) {
					msg = '抱歉,该商品已卖光了';
				}
				this.$api.msg(msg);
				return;
			}
			//处理limit和stock
			if (this.cart[this.sku_id] > this.limit) {
				uni.hideLoading();
				this.$api.msg('抱歉,该商品限购' + this.limit + '件');
				return;
			}
			//累加一件商品
			this.cart[this.sku_id] = this.amount;
			editCart({
				id: this.shopid,
				//stationId: this.stationId,
				goods_id: this.id,
				sku_id: this.sku_id,
				price: this.price,
				src: this.src,
				checked: 1,
				amount: this.cart[this.sku_id]
			}).then(res => {
				this.$api.msg('加入成功', 1500, false, 'success');
				console.log(res);
				//这里算不准
				//this.cartSumCount = incrCartNumber(1);
				//this.cartSumCount = incrCartNumber(this.amount);
			});
		},
		bindChange(number, id) {
			console.log(number, id);
			this.amount = +number;
		},
		//支付一件的定金,判断是否有效
		payDingjin() {
			if (!this.yuding.isBegin) {
				this.$api.msg('预定未开始');
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
			this.originPrice = sku.originPrice;
			this.amount = this.cart[this.sku_id] > 0 ? this.cart[this.sku_id] : 1;
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
		stopPrevent() {}
	}
};
</script>

<style lang="scss">
page {
	background: $page-color-base;
	padding-bottom: 100upx;
}
.icon-you {
	font-size: $font-base + 2upx;
	color: #888;
}
.carousel {
	height: 722upx;
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
	bottom:-200upx;
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
	&.show{
		bottom:var(--window-bottom);
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
	&.spec{
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
		padding-left: 40upx;
	}
	$yellow-color: $uni-color-success;
	.skuoptions__item {
		width: 180upx;
		border: 1px solid $font-color-disabled;
		border-radius: 8upx;
		padding: 8upx;
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
</style>

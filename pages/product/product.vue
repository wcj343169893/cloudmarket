<template>
	<view class="container">
		<view class="carousel">
			<swiper indicator-dots circular="true" duration="400">
				<swiper-item class="swiper-item" v-for="(item, index) in imgs" :key="index">
					<view class="image-wrapper"><image :src="item" class="loaded" mode="aspectFill"></image></view>
				</swiper-item>
			</swiper>
		</view>

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
			<view class="b-b skuDialogPanel">
				<view v-for="(item, index) in skuMap" :key="index">
					<view class="skuname">
						<text>{{ item.name }}</text>
					</view>
					<view class="skuoptions">
						<view
							v-for="(sname, index2) in item.child"
							:key="index2"
							class="skuoptions__item"
							:class="{ active: item.active == index2 }"
							@click="selectSku(index, index2)"
						>
							<text>{{ sname }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="c-list">
			<view class="c-row b-b">
				<text class="tit">服务</text>
				<view class="bz-list con">
					<text v-for="ser in service">{{ ser }} ·</text>
				</view>
			</view>
		</view>

		<view class="detail-desc">
			<view class="d-header"><text>图文详情</text></view>
			<rich-text :nodes="description"></rich-text>
		</view>

		<!-- 底部操作菜单 -->
		<view class="page-bottom">
			<view class="options">
				<navigator url="/pages/cart/cart" open-type="switchTab" class="p-b-btn">
					<text class="yticon icon-gouwuche"></text>
				</navigator>
			</view>
			<button class="add-btn" @click="addToCart">加入购物车</button>
		</view>
		<!-- 分享 -->
		<share ref="share" :contentHeight="580" :shareList="shareList"></share>
	</view>
</template>

<script>
import share from '@/components/share';
import { getGoodsInfo, editCart } from '@/common/request.js';
import { navToLoginPage, updateGoodsTags } from '@/common/functions.js';
export default {
	components: {
		share
	},
	data() {
		return {
			id: 0,
			sku_id: 0,
			title: '',
			stock: 0,
			visite: 0,
			src: '',
			imgs: [], //轮播图
			score: 0,
			price: 0,
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

			specClass: 'none',
			specSelected: [],

			favorite: false,
			hasSku: false,
			shareList: [],
			skuMap: [],
			nameMap: {}
		};
	},
	async onLoad(options) {
		if (!options.id) {
			//商品id不存在
			this.$api.msg('商品不存在');
			this.$nextTick(() => {
				uni.navigateBack();
			});
			return false;
		}
		this.id = options.id;
		this.loadData();
		/*this.shareList = await this.$api.json('shareList'); */
	},
	methods: {
		async loadData() {
			getGoodsInfo({ id: this.id }).then(item => {
				updateGoodsTags(item);
				console.log(item);
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
							child: []
						});
					}
					let nameMap = {};
					let miaoshaSkuName = [];
					item.skus.map(sku => {
						let names = sku.name.split('&gt;');
						names.map((n, i) => {
							if (skuMap[i]['child'].indexOf(n) == -1) {
								skuMap[i]['child'].push(n);
							}
						});
						nameMap[sku.name] = sku;
						//寻找秒杀商品的定位
						if (this.miaosha && this.miaosha.sku_id == sku.id) {
							miaoshaSkuName = names;
						}
					});
					this.skuMap = skuMap;
					this.nameMap = nameMap;
					//默认选中秒杀商品，否则第一个
					if (item.miaosha) {
						//let miaoshaDefaultSelect=[1,1];
						///this.selectSku(...miaoshaDefaultSelect);
						skuMap.map((s, i) => {
							//找到秒杀规格所在位置
							let i2 = s.child.findIndex(sitem => miaoshaSkuName.indexOf(sitem) != -1);
							this.selectSku(i, i2);
						});
					} else {
						this.selectSku(0, 0);
					}
				} else {
					//计算折扣
					this.getSaleRate();
				}
			});
		},
		//选择规格
		selectSpec(index, pid) {
			let list = this.specChildList;
			list.forEach(item => {
				if (item.pid === pid) {
					this.$set(item, 'selected', false);
				}
			});

			this.$set(list[index], 'selected', true);
			//存储已选择
			/**
			 * 修复选择规格存储错误
			 * 将这几行代码替换即可
			 * 选择的规格存放在specSelected中
			 */
			this.specSelected = [];
			list.forEach(item => {
				if (item.selected === true) {
					this.specSelected.push(item);
				}
			});
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
			uni.showLoading({
				title: '正在加载',
				mask: true
			});
			if (!this.cart[this.sku_id]) {
				this.cart[this.sku_id] = 0;
			}
			//处理limit和stock
			if (this.cart[this.sku_id] >= this.limit) {
				uni.hideLoading();
				this.$api.msg('抱歉,该商品限购' + this.limit + '件');
				return;
			}
			if (this.cart[this.sku_id] >= this.stock) {
				uni.hideLoading();
				this.$api.msg('抱歉,该商品仅剩' + this.stock + '件');
				return;
			}
			//累加一件商品
			this.cart[this.sku_id]++;
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
				this.$api.msg('加入购物车成功！');
				console.log(res);
			});
		},
		/**规格选择,默认选中秒杀商品**/
		selectSku(index, index2) {
			this.skuMap[index].active = index2;
			//更新已选择规格
			let names = [];
			this.skuMap.map(skuname => {
				names.push(skuname['child'][skuname.active]);
			});
			//匹配skuid
			let sku = this.nameMap[names.join('&gt;')];
			console.log(sku);
			this.sku_id = sku.id;
			this.stock = sku.stock;
			this.limit = sku.limit;
			this.price = sku.price;
			this.originPrice = sku.originPrice;
			//计算折扣
			this.getSaleRate();
		},
		getSaleRate() {
			if (this.originPrice > 0) {
				this.zhekou = ((this.price / this.originPrice) * 10).toFixed(1);
			}
		},
		buy() {
			uni.navigateTo({
				url: `/pages/order/createOrder`
			});
		},
		stopPrevent() {}
	}
};
</script>

<style lang="scss">
page {
	background: $page-color-base;
	padding-bottom: 160upx;
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

	.title {
		font-size: 32upx;
		color: $font-color-dark;
		height: 50upx;
		line-height: 50upx;
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
	background: linear-gradient(left, #fdf5f6, #fbebf6);
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
	}
	.con {
		flex: 1;
		color: $font-color-dark;
		.selected-text {
			margin-right: 10upx;
		}
	}
	.bz-list {
		height: 40upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		text {
			display: inline-block;
			margin-right: 30upx;
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
	bottom: var(--window-bottom);
	z-index: 95;
	display: flex;
	justify-content: space-between;
	align-items: center;
	width: 100%;
	height: 100upx;
	background: rgba(255, 255, 255, 0.9);
	padding: 16upx 30upx;
	.options {
		flex: 1;
	}
}
.add-btn {
	height: 80upx;
	font-size: $font-lg;
	color: #fff;
	background-color: $base-color;
	border-radius: 10upx;
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
	}
	$yellow-color: $uni-color-success;
	.skuoptions__item {
		width: 200upx;
		border: 1px solid $font-color-disabled;
		border-radius: 8upx;
		padding: 8upx;
		margin-right: 20upx;
		margin-bottom: 20upx;
		&.active {
			border: 1px solid $yellow-color;
			color: $font-color-emphasis;
		}
	}
}
</style>

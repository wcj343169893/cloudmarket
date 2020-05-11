<template>
	<view class="container" :style="shopinfo.bannerBackground">
		<view class="space"></view>
		<!-- 店铺基本信息区域 -->
		<view class="shopinfo weui-flex" id="shopinfo">
			<view class="image-wrapper"><image :src="shopinfo.src" mode="aspectFill"></image></view>
			<view class="desc">
				<view class="">
					<text class="title">{{ shopinfo.name }}</text>
				</view>
				<view>
					<text class="ops">评分{{ shopinfo.score }}</text>
					<text class="ops">月售{{ shopinfo.monthSale }}</text>
				</view>
				<view class="">
					<text class="ops">起送￥{{ shopinfo.deliveryMin }}</text>
					<text class="ops">配送￥{{ shopinfo.deliveryMoney }}</text>
					<text v-if="shopinfo.deliveryMoneyBefore > 0" class="del ops">{{ shopinfo.deliveryMoneyBefore }}</text>
					<text class="ops">人均￥{{ shopinfo.perCapita }}</text>
				</view>
				<view class="youhui" v-if="shopinfo.hasManjian">
					<text class="yh" v-for="(cou, ind) in shopinfo.manjians" :key="ind">{{ cou.name }}</text>
				</view>
			</view>
		</view>
		<view class="content weui-flex" :style="contentStyleHeight">
			<scroll-view scroll-y="true" class="content-category">
				<view v-for="(item, index) in categoryList" :key="index" @click="changeCategory(index)" :class="{ 'cate-item': 1, selected: index == categorySelectIndex }">
					<text>{{ item.name }}</text>
				</view>
				<view class="space"></view>
			</scroll-view>
			<view class="weui-flex__item" :style="contentStyleHeight">
				<scroll-view class="floor-list" scroll-x>
					<view class="scoll-wrapper">
						<view
							v-for="(item, index) in subCategoryList"
							:key="index"
							:class="{ 'floor-item': 1, selected: index == subCategorySelectIndex }"
							@click="changeGoodsPosition(item.id, index)"
						>
							<text class="title clamp">{{ item.name }}</text>
						</view>
					</view>
				</scroll-view>
				<scroll-view :scroll-top="scrollTop" :scroll-with-animation="true" scroll-y="true" class="content-goods" @scroll="getGoodsPosition">
					<view class="space"></view>
					<view v-for="(item, index) in goodsList" :key="index" class="goodsList">
						<view class="sub-catename" v-if="item.subCategory" :id="'sub_cate_' + item.subCategory.id">{{ item.subCategory.name }}</view>
						<view class="weui-flex">
							<view class="image-wrapper"><image :src="item.src" mode="aspectFill"></image></view>
							<view class="desc weui-flex__item">
								<view class="">
									<text class="title">{{ item.title }}</text>
								</view>
								<view class="">
									<text>月售{{ item.monthlySale }}</text>
									<text class="m-l">好评度{{ item.score * 100 }}%</text>
								</view>
								<view class="price">
									<text class="unit">￥</text>
									<text>{{ item.price }}</text>
									<text class="del m-l" v-if="item.originPrice > 0">￥{{ item.originPrice }}</text>
								</view>
								<view class="buttons">
									<uni-icons type="minus" size="22" color="#333333" @click="removeCart(item)"></uni-icons>
									<input class="uni-input" maxlength="10" value="1" />
									<uni-icons type="plus" size="22" color="#ef5656" @click="addCart(item)"></uni-icons>
								</view>
							</view>
						</view>
					</view>
					<text class="nomore">此分类已加载完成</text>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { getShopHome,getGoodsByCid } from '@/common/request.js';
export default {
	data() {
		return {
			scrollTop: 0,
			old: {
				scrollTop: 0
			},
			shopinfo: {},
			categoryList: [],
			categorySelectIndex: 0,
			subCategorySelectIndex: 0,
			subCategoryList: [],
			headHeight: 100,
			contentStyleHeight: 'height:500px',
			goodsList: []
		};
	},
	async onLoad(options) {
		console.log(options);
		if (!options.id) {
			this.$api.msg('店铺不存在');
			setTimeout(function() {
				uni.navigateBack({
					delta: 1
				});
			}, 3000);
			return;
		}
		this.shopid = options.id;
		this.loadData();
	},
	computed: {
		...mapState(['userInfo', 'stationId'])
	},
	methods: {
		async loadData() {
			//加载店铺信息
			this.getShopInfo();
		},
		getShopInfo() {
			getShopHome({
				id: this.shopid,
				stationId: this.stationId
			}).then(
				res => {
					console.log(res);
					if (!res.id) {
						return;
					}
					this.shopinfo = res;
					if (this.shopinfo.banner) {
						this.shopinfo.bannerBackground = 'background-image: url(' + this.shopinfo.banner + ');';
					}
					this.categoryList = res.goods_categories;
					//计算高度
					this.calculate();
					this.changeCategory(0);
				},
				err => {
					console.log('店铺不存在');
					this.$api.msg('店铺不存在');
				}
			);
		},
		//计算分类和商品列表高度
		calculate() {
			//窗口高度-顶部高度
			const { windowWidth, windowHeight } = uni.getSystemInfoSync();
			let info = uni.createSelectorQuery().select('#shopinfo');
			info.boundingClientRect(data => {
				this.headHeight = data.height + data.top;
				let height = windowHeight - this.headHeight;
				this.contentStyleHeight = 'height:' + height + 'px';
			}).exec();
		},
		changeCategory(index) {
			this.categorySelectIndex = index;
			this.subCategorySelectIndex = 0;
			this.goodsList = [];
			if (this.categoryList[index]['children']) {
				this.subCategoryList = this.categoryList[index]['children'];
			} else {
				this.subCategoryList = [];
			}
			this.getGoodsByCid(0);
		},
		changeGoodsPosition(id, index) {
			//this.scrollTop = this.old.scrollTop;
			this.subCategorySelectIndex = index;
			let info = uni.createSelectorQuery().select('#sub_cate_' + id);
			info.boundingClientRect(data => {
				if (data) {
					//this.scrollTop=data.top;
					this.$nextTick(function() {
						console.log(this.old.scrollTop, data.top);
						this.scrollTop = this.old.scrollTop + data.top - this.headHeight - data.height * 2 + 14;
					});
				}
			}).exec();
		},
		getGoodsPosition(e) {
			//e.detail.scrollTop
			this.old.scrollTop = e.detail.scrollTop;
			console.log(e.detail.scrollTop);
		},
		getGoodsByCid(index) {
			this.subCategorySelectIndex = index;
			let cate = this.categoryList[this.categorySelectIndex];
			getGoodsByCid({
						id: this.shopid,
						stationId: this.stationId,
						cid: cate.id
					})
				.then(res => {
					if (this.subCategoryList && this.subCategoryList.length > 0) {
						let subCids = [];
						let goodsList = {};
						let subCatMap = {};
						for (let sc = 0; sc < this.subCategoryList.length; sc++) {
							subCids.push(this.subCategoryList[sc].id);
							goodsList[this.subCategoryList[sc].id] = [];
							subCatMap[this.subCategoryList[sc].id] = this.subCategoryList[sc];
						}
						//按分组显示
						for (let i = 0; i < res.length; i++) {
							let goods = res[i];
							//循环多分类
							for (let c = 0; c < goods.categories.length; c++) {
								if (subCids.includes(goods.categories[c].id)) {
									goodsList[goods.categories[c].id].push(goods);
									break;
								}
							}
						}
						let outGoodsList = [];
						for (let var1 in goodsList) {
							if (goodsList[var1].length > 0) {
								goodsList[var1][0]['subCategory'] = subCatMap[var1];
								outGoodsList = outGoodsList.concat(goodsList[var1]);
							}
						}
						this.goodsList = outGoodsList;
					} else {
						this.goodsList = res;
					}
				},err=>{
					//没有商品
				});
		},
		removeCart(item) {
			console.log(item);
		},
		addCart(item) {
			console.log(item);
		}
	}
};
</script>

<style lang="scss">
.container {
	padding-top: var(--status-bar-height);
	background-size: 100%;
	background-repeat: no-repeat;
	height: 100%;
	overflow: hidden;
}
.space {
	padding: 20upx 0 0;
}
.weui-flex {
	display: flex;
	align-items: center;
}
.weui-flex__item {
	flex: 1;
}
$border-color: #f5f5f5;
.shopinfo {
	margin: 0 40upx 0;
	padding: 20upx;
	background-color: #ffffff;
	border-radius: 20upx 20upx 0 0;
	border: 1px solid $border-color;
	.image-wrapper {
		width: 180upx;
		height: 180upx;
		border-radius: 3px;
		overflow: hidden;
		margin-right: 22upx;
		image {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
	.desc {
		flex: 1;
		font-size: $font-sm;
		color: $font-color-light;
		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 60upx;
			font-weight: 400;
		}
		.ops {
			margin-right: 12upx;
		}
		.del {
			text-decoration: line-through;
		}
		.youhui {
			padding-top: 8upx;
			.yh {
				margin-right: 10upx;
				color: #f0ad4e;
				border: 1px solid #f0ad4e;
				font-size: 0.8em;
				padding: 0upx 10upx;
				line-height: 1;
				border-radius: 8upx;
			}
		}
	}
}
.content {
	background: #ffffff;
	font-size: 0.85rem;
	.content-category {
		width: 160upx;
		border-right: 2upx solid $border-color;
		height: 100%;
		overflow-y: auto;
		.cate-item {
			padding: 20upx;
			border-bottom: 2upx solid $border-color;
			font-size: $font-sm + 2upx;
			word-break: break-all;
			text-overflow: ellipsis;
			&.selected {
				background-color: #f8f6fc;
			}
		}
		.space {
			padding-top: 180upx;
		}
	}
	.content-goods {
		height: 100%;
		overflow-y: auto;
		position: relative;
	}
	.floor-list {
		white-space: nowrap;
		position: absolute;
		width: 580upx;
		background-color: #ffffff;
		z-index: 10;
		border-bottom: 2upx solid $border-color;
		height: 54upx;
		overflow: hidden;
	}
	.scoll-wrapper {
		display: flex;
		align-items: flex-start;
	}
	.floor-item {
		width: 150upx;
		margin-right: 20upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		line-height: 1.8;
		padding: 5upx 16upx;
		&.selected {
			color: #ffffff;
			background-color: #dd524d;
		}
	}
	.space {
		padding-top: 60upx;
	}
	.goodsList {
		padding: 20upx;
		.weui-flex {
			align-items: flex-start;
		}
		.sub-catename {
			padding-bottom: 10upx;
		}
	}
	.image-wrapper {
		width: 180upx;
		height: 180upx;
		border-radius: 3px;
		overflow: hidden;
		margin-right: 22upx;
		image {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
	.desc {
		flex: 1;
		font-size: $font-sm;
		color: $font-color-light;
		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 1.1;
			font-weight: 400;
		}
		.m-l {
			margin-left: 20upx;
		}
		.price {
			color: #ff0000;
			font-size: 1.4em;
			.unit {
				font-size: 0.8em;
			}
			.del {
				font-size: 0.8em;
				color: $font-color-light;
			}
		}
		.buttons {
			display: flex;
			text-align: center;
			width: 180upx;
			float: right;
			margin-right: 20upx;
			.uni-input {
				border: 1px solid $border-color;
				border-radius: 6upx;
			}
		}
	}
}
</style>

<template>
	<view class="container" :style="shopinfo.bannerBackground">
		<view class="space"></view>
		<!-- 店铺基本信息区域 -->
		<view class="shopinfo weui-flex" id="shopinfo">
			<view class="image-wrapper"><image :src="shopinfo.src" mode="aspectFill"></image></view>
			<view class="desc">
				<view class="">
					<text class="title clamp">{{ shopinfo.name }}</text>
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
			</scroll-view>
			<scroll-view scroll-y="true" class="content-goods weui-flex__item" @scrolltolower="getMoreGoods()">
				<scroll-view class="floor-list" scroll-x>
					<view class="scoll-wrapper">
						<view
							v-for="(item, index) in subCategoryList"
							:key="index"
							:class="{ 'floor-item': 1, selected: index == subCategorySelectIndex }"
							@click="getGoodsByCid(index)"
						>
							<text class="title clamp">{{ item.name }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="space"></view>
				<view v-for="(item, index) in goodsList" :key="index" class="goodsList weui-flex">
					<view class="image-wrapper"><image :src="item.src" mode="aspectFill"></image></view>
					<view class="desc weui-flex__item">
						<view class="">
							<text class="title">{{ item.title }}</text>
						</view>
						<view class="">
							<text>月售{{item.monthlySale}}</text>
							<text class="m-l">好评度{{item.score*100}}%</text>
						</view>
						<view class="price"><text class="unit">￥</text><text>{{ item.price }}</text><text class="del m-l" v-if="item.originPrice>0">￥{{ item.originPrice }}</text> </view>
						<view class="buttons">
						</view>
					</view>
				</view>
				<uni-load-more :status="loadingType" :contentText="loadingContentText"></uni-load-more>
			</scroll-view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
export default {
	components: {
		uniLoadMore
	},
	data() {
		return {
			shopinfo: {},
			categoryList: [],
			categorySelectIndex: 0,
			subCategorySelectIndex: 0,
			subCategoryList:[],
			page: 1,
			loadingType: 'more', //加载更多状态
			loadingContentText:{
				contentdown: "上拉显示更多",
				contentrefresh: "正在加载...",
				contentnomore:"此分类已加载完成"
			},
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
		this.calculate();
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
			uniCloud
				.callFunction({
					name: 'shopHome',
					data: {
						id: this.shopid,
						stationId: this.stationId,
						uid: this.userInfo.id
					}
				})
				.then(res => {
					console.log(res.result);
					if (!res.result.id) {
						return;
					}
					this.shopinfo = res.result;
					if (this.shopinfo.banner) {
						this.shopinfo.bannerBackground = 'background-image: url(' + this.shopinfo.banner + ');';
					}
					this.categoryList = res.result.goods_categories;
					this.changeCategory(0);
				});
		},
		//计算分类和商品列表高度
		calculate() {
			//窗口高度-顶部高度
			const { windowWidth, windowHeight } = uni.getSystemInfoSync();
			let info = uni.createSelectorQuery().select('#shopinfo');
			info.boundingClientRect(data => {
				let height = windowHeight - data.height - data.top;
				this.contentStyleHeight = 'height:' + height + 'px';
			}).exec();
		},
		changeCategory(index) {
			this.categorySelectIndex = index;
			this.subCategorySelectIndex = 0;
			this.goodsList = [];
			this.page = 1;
			this.loadingType = 'more';
			if(this.categoryList[index]['children']){
				this.subCategoryList=this.categoryList[index]['children'];
			}else{
				this.subCategoryList=[];
			}
			this.getGoodsByCid(0);
		},
		getMoreGoods() {
			if (this.loadingType != 'nomore') {
				this.page++;
				getGoodsByCid(this.subCategorySelectIndex);
			}
		},
		getGoodsByCid(index) {
			this.subCategorySelectIndex = index;
			let cate = this.categoryList[this.categorySelectIndex];
			console.log(cate);
			this.$api.loading();
			let limit = 30;
			uniCloud
				.callFunction({
					name: 'getGoodsByCid',
					data: {
						id: this.shopid,
						stationId: this.stationId,
						uid: this.userInfo.id,
						cid: cate.id,
						page: this.page,
						limit: limit
					}
				})
				.then(res => {
					uni.hideLoading();
					if (res.result.affectedDocs > 0) {
						//累加到现有数组
						this.goodsList = this.goodsList.concat(res.result.data);
						//不足一页，肯定没有下一页了
						if (res.result.affectedDocs < limit) {
							this.loadingType = 'nomore';
						} else {
							//还有数据
							this.loadingType = 'more';
						}
					} else {
						this.loadingType = 'nomore';
					}
					console.log(res.result);
				});
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
		width: 200upx;
		border-right: 2upx solid $border-color;
		height: 100%;
		overflow-y: auto;
		.cate-item {
			padding: 20upx;
			border-bottom: 2upx solid $border-color;
			word-break: break-all;
			text-overflow: ellipsis;
			&.selected {
				background-color: #f8f6fc;
			}
		}
	}
	.content-goods {
		height: 100%;
		overflow-y: auto;
		position: relative;
		.floor-list {
			white-space: nowrap;
			position: fixed;
			width: 540upx;
			background-color: #ffffff;
			z-index: 10;
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
	}
	.space{
		padding-top: 60upx;
	}
	.goodsList {
		align-items: flex-start;
		padding: 20upx;
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
		.m-l{
			margin-left: 20upx;
		}
		.price{
			color: #ff0000;
			font-size: 1.4em;
			.unit{
				font-size: 0.8em;
			}
			.del{
				font-size: 0.8em;
				color: $font-color-light;
			}
		}
	}
}
</style>

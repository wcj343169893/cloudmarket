<template>
	<view class="container">
		<!-- 小程序头部兼容 -->
		<!-- #ifdef MP -->
		<view class="mp-search-box">
			<navigator url="chooseAddress" class="yticon icon-icon-test"></navigator>
			<input class="ser-input" type="text" :value="searchWord" disabled @click="navToSearch"/>
		</view>
		<!-- #endif -->
		<!-- 头部轮播 -->
		<view class="carousel-section">
			<!-- 标题栏和状态栏占位符 -->
			<view class="titleNview-placing"></view>
			<!-- 背景色区域 -->
			<view class="titleNview-background" :style="{ backgroundColor: titleNViewBackground }"></view>
			<!--收货地址-->
			<view class="titleNview-address" v-if="address != ''">
				<text>送至:{{ address }}</text>
			</view>
			<swiper class="carousel" circular @change="swiperChange">
				<swiper-item v-for="(item, index) in carouselList" :key="index" class="carousel-item" @click="navToAdPage(item)"><image :src="item.src" /></swiper-item>
			</swiper>
			<!-- 自定义swiper指示器 -->
			<view class="swiper-dots">
				<text class="num">{{ swiperCurrent + 1 }}</text>
				<text class="sign">/</text>
				<text class="num">{{ swiperLength }}</text>
			</view>
		</view>
		<!-- 口号 -->
		<view class="weui-flex kouhao m-t" @click="navToDocPage('7c59e15d685c4a2d9a5d81376b2dc47f')">
			<view class="kouhao_item">
				<text class="yticon icon-chps"></text>
				<text>最快2小时送达</text>
			</view>
			<view class="kouhao_item">
				<text class="yticon icon-money"></text>
				<text>0起送费0配送费</text>
			</view>
			<view class="kouhao_item">
				<text class="yticon icon-dunpai"></text>
				<text>安心退换</text>
			</view>
		</view>
		<!-- 分类 -->
		<view class="cate-section m-t" v-if="recommendCategoriesList.length > 0">
			<view v-for="(item, index) in recommendCategoriesList" :key="index" class="cate-item" @click="navToCategoryPage(item.id)">
				<image :src="item.src"></image>
				<text>{{ item.name }}</text>
			</view>
		</view>
		<block v-if="miaoshaList.length > 0">
			<view class="f-header m-t" @click="navToSecKillGoods">
				<view class="icon">&nbsp;</view>
				<view class="tit-box"><text class="tit">限时抢购</text></view>
				<text class="yticon icon-you"></text>
			</view>
			<view class="seckill-section">
				<scroll-view class="floor-list" scroll-x>
					<view class="scoll-wrapper">
						<view v-for="(item, index) in miaoshaList" :key="index" class="floor-item" @click="navToGoodsPage(item)">
							<image :src="item.src" mode="aspectFill"></image>
							<view class="content">
								<view class="title clamp">
									<text>{{ item.title }}</text>
								</view>
								<view class="tags">
									<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{ tag.text }}</text>
								</view>
								<view class="">
									<text class="price">{{ item.price }}</text>
									<text class="price del" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
								</view>
							</view>
						</view>
					</view>
				</scroll-view>
			</view>
		</block>
		<block v-if="newestList.length > 0">
			<view class="f-header m-t">
				<view class="icon">&nbsp;</view>
				<view class="tit-box"><text class="tit">实时鲜货</text></view>
			</view>
			<view class="newest-section">
				<view v-for="(item, index) in newestList" :key="index" class="floor-item" @click="navToGoodsPage(item)">
					<image :src="item.src" mode="aspectFill"></image>
					<view class="content">
						<view class="title clamp">
							<text>{{ item.title }}</text>
						</view>
						<view class="tags">
							<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{ tag.text }}</text>
						</view>
						<view class="">
							<text class="price">{{ item.price }}</text>
							<text class="price del" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
						</view>
					</view>
				</view>
			</view>
		</block>
		<view class="bottom" v-show="isLoaded"><text>以下没数据了</text></view>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { getHomeFruitData } from '@/common/request.js';
import { navToGoodsItemPage, updateGoodsTags, incrCartNumber, updateCartNumber, navToDocPage, navToDocWebPage } from '@/common/functions.js';
export default {
	data() {
		return {
			titleNViewBackground: '',
			swiperCurrent: 0,
			swiperLength: 0,
			goNext: 1,
			searchWord: '',
			isLoaded: false,
			searchKeyWords: [],
			address: '开启定位获得位置/收货地址',
			carouselList: [],
			recommendCategoriesList: [],
			miaoshaList: [],
			newestList: []
		};
	},
	computed: {
		...mapState(['hasLogin', 'userInfo', 'stationId', 'shopId', 'location'])
	},
	watch: {
		/* shopId() {
			console.log('附近店铺id有变动');
			setTimeout(() => {
				this.loadData();
			}, 100);
		}, */
		hasLogin() {
			console.log('watch 登录状态改变,刷新当前页面');
			setTimeout(() => {
				//this.loadData();
				this.getUserLocation();
			}, 100);
		},
		location() {
			console.log('watch location');
			console.log(this.location);
			this.address = this.location.name;
		}
	},
	onLoad() {
		this.getUserLocation();
	},
	//下拉刷新,不会更新底部附近的店铺
	onPullDownRefresh() {
		//this.loadData('refresh');
		console.log('刷新整页');
		uni.stopPullDownRefresh();
		this.loadData();
	},
	//滑到底部加载更多
	onReachBottom() {
		this.goNext += 1;
	},
	methods: {
		...mapMutations(['changeShopId', 'changeMainCateId', 'setUserLocation']),
		async getUserLocation() {
			console.log('开始获取定位');
			//1.如果存在经纬度，则直接访问
			if (this.location.id) {
				//存在历史定位，只能是从收货地址填写
				console.log('存在选择地址', this.location);
				this.address = this.location.name;
				this.loadData();
			} else {
				//获取定位
				uni.getLocation({
					type: 'gcj02',
					altitude: true,
					geocode: true,
					success: res => {
						console.log('获取定位完成', res);
						this.address = '当前位置';
						//#ifndef MP
						this.address = res.address.poiName;
						//#endif
						this.setUserLocation({
							id: false,
							latitude: res.latitude,
							longitude: res.longitude,
							name: this.address
						});
						this.loadData();
					},
					fail: res => {
						console.log('获取定位失败', res.errMsg);
						this.loadData();
					}
				});
			}
		},
		changeLocationInfo(info) {
			//this.location = info;
			console.log(this.location);
			this.address = this.location.name;
			//刷新页面数据
			this.loadData();
		},
		async loadData() {
			this.isLoaded = false;
			getHomeFruitData({
				stationId: this.stationId,
				latitude: this.location.latitude,
				longitude: this.location.longitude
			}).then(res => {
				this.isLoaded = true;
				//修改默认附近店铺id
				this.changeShopId(res.shopId);
				//广告
				if (res.ads) {
					let ads = res.ads;
					this.titleNViewBackground = ads[0].background;
					this.swiperLength = ads.length;
					this.carouselList = ads;
				}
				if (res.categories) {
					this.recommendCategoriesList = res.categories;
				}
				this.miaoshaList = res.miaosha;
				this.miaoshaList.forEach(item => {
					updateGoodsTags(item);
				});
				this.newestList = res.newest;
				this.newestList.forEach(item => {
					updateGoodsTags(item);
				});
				//this.address = res.address;
				//购物车总数量
				/* if(res.cart > 0){
					uni.setTabBarBadge({
						index:2,
						text:res.cart+""
					});
				} */
				//异步查询购物车总数量，需要过滤库存不足的商品
				if (this.hasLogin) {
					updateCartNumber(res.cart);
				}
				if (res.shop) {
					this.searchKeyWords = res.shop.searchGoodsKeywords;
					//同时写入缓存，在分类页面也能调用
					uni.setStorage({
						key: 'shopSearchGoodsKeywords',
						data: this.searchKeyWords
					});
					this.getDefaultSearchWord();
				}
			});
		},
		//轮播图切换修改背景色
		swiperChange(e) {
			const index = e.detail.current;
			this.swiperCurrent = index;
			this.titleNViewBackground = this.carouselList[index].background;
		},
		//广告轮播跳转
		navToAdPage(item) {
			//https://ask.dcloud.net.cn/article/35621
			let link = item.link;
			//this.$api.msg(link)
			if (link.indexOf('/pages') === 0) {
				//跳转指定页面
				uni.navigateTo({
					url: `${link}`
				});
			} else if (link.indexOf('http') === 0) {
				//跳转网页
				/* plus.runtime.openURL(link, function(res) {
					console.log(res);
				}); */
				navToDocWebPage(link);
			}
		},
		navToDocPage(id) {
			navToDocPage(id);
		},
		navToCategoryPage(id) {
			this.changeMainCateId(+id);
			uni.switchTab({
				url: `../category/goods`
			});
		},
		navToGoodsPage(item) {
			//navToGoodsPage(item.id);
			navToGoodsItemPage(item);
		},
		navToSecKillGoods() {
			//秒杀商品列表,把当前页面数据传过去
			uni.setStorage({
				key: 'secKillGoodsList',
				data: this.miaoshaList
			});
			uni.navigateTo({
				url: '/pages/index/seckillGoods'
			});
		},
		navToSearch(){
			uni.navigateTo({
				url: `/pages/search/search?key=${this.searchWord}`
			});
		},
		getDefaultSearchWord() {
			if (this.searchKeyWords && this.searchKeyWords.length > 0) {
				this.searchWord = this.searchKeyWords[parseInt(Math.random() * this.searchKeyWords.length)];
			}
			// #ifdef APP-PLUS
			var webView = this.$mp.page.$getAppWebview();
			var tn = webView.getStyle().titleNView;
			tn.searchInput.placeholder = this.searchWord;

			webView.setStyle({
				titleNView: tn
			});
			// #endif
			//10秒换一个
			setTimeout(() => {
				this.getDefaultSearchWord();
			}, 10000);
		}
	},
	// #ifndef MP
	// 标题栏input搜索框点击
	onNavigationBarSearchInputClicked: async function(e) {
		//this.$api.msg('点击了搜索框');
		this.navToSearch()
	},
	//点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index === 0) {
			uni.navigateTo({
				url: `/pages/index/chooseAddress`
			});
		} else if (index === 1) {
			// #ifdef APP-PLUS
			//隐藏红点
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			const currentWebview = page.$getAppWebview();
			currentWebview.hideTitleNViewButtonRedDot({
				index
			});
			// #endif
			uni.navigateTo({
				url: '/pages/notice/notice'
			});
		}
	}
	// #endif
};
</script>

<style lang="scss">
/* #ifdef MP */
.mp-search-box {
	position: absolute;
	left: 0;
	top: calc(var(--status-bar-height) + 50upx);
	z-index: 9999;
	width: 50%;
	padding: 0 20upx;
	display: flex;
	align-items: center;
	.icon-icon-test{
		font-size: 48upx;
		color: #FFFFFF;
		margin-right: 7upx;
	}
	.ser-input {
		flex: 1;
		height: 56upx;
		line-height: 56upx;
		text-align: center;
		font-size: 28upx;
		color: $font-color-base;
		border-radius: 20px;
		background: rgba(255, 255, 255, 0.6);
	}
}
page {
	.carousel-section {
		padding: 0;
		.titleNview-placing {
			padding-top: 118upx;
		}
		.carousel {
			.carousel-item {
				padding: 10upx;
			}
		}
		.swiper-dots {
			left: 45upx;
			bottom: 40upx;
		}
	}
}
/* #endif */
page {
	background: #f5f5f5;
}
/* 头部 轮播图 */
.carousel-section {
	position: relative;
	padding-top: 10px;

	.titleNview-placing {
		height: var(--status-bar-height);
		padding-top: 68upx;
		box-sizing: content-box;
	}

	.titleNview-background {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 426upx;
		transition: 0.4s;
	}
	.titleNview-address {
		font-size: $font-sm;
		color: #ffffff;
		position: relative;
		padding-left: 36upx;
		padding-bottom: 12upx;
	}
}
.carousel {
	width: 100%;
	height: 350upx;

	.carousel-item {
		width: 100%;
		height: 100%;
		padding: 0 28upx;
		overflow: hidden;
	}

	image {
		width: 100%;
		height: 100%;
		border-radius: 10upx;
	}
}
.swiper-dots {
	display: flex;
	position: absolute;
	left: 60upx;
	bottom: 15upx;
	width: 72upx;
	height: 36upx;
	background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTk4MzlBNjE0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTk4MzlBNjA0NjU1MTFFOUExNjRFQ0I3RTQ0NEExQjMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6Q0E3RUNERkE0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6Q0E3RUNERkI0NjExMTFFOTg5NzI4MTM2Rjg0OUQwOEUiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4Gh5BPAAACTUlEQVR42uzcQW7jQAwFUdN306l1uWwNww5kqdsmm6/2MwtVCp8CosQtP9vg/2+/gY+DRAMBgqnjIp2PaCxCLLldpPARRIiFj1yBbMV+cHZh9PURRLQNhY8kgWyL/WDtwujjI8hoE8rKLqb5CDJaRMJHokC6yKgSCR9JAukmokIknCQJpLOIrJFwMsBJELFcKHwM9BFkLBMKFxNcBCHlQ+FhoocgpVwwnv0Xn30QBJGMC0QcaBVJiAMiec/dcwKuL4j1QMsVCXFAJE4s4NQA3K/8Y6DzO4g40P7UcmIBJxbEesCKWBDg8wWxHrAiFgT4fEGsB/CwIhYE+AeBAAdPLOcV8HRmWRDAiQVcO7GcV8CLM8uCAE4sQCDAlHcQ7x+ABQEEAggEEAggEEAggEAAgQACASAQQCCAQACBAAIBBAIIBBAIIBBAIABe4e9iAe/xd7EAJxYgEGDeO4j3EODp/cOCAE4sYMyJ5cwCHs4rCwI4sYBxJ5YzC84rCwKcXxArAuthQYDzC2JF0H49LAhwYUGsCFqvx5EF2T07dMaJBetx4cRyaqFtHJ8EIhK0i8OJBQxcECuCVutxJhCRoE0cZwMRyRcFefa/ffZBVPogePihhyCnbBhcfMFFEFM+DD4m+ghSlgmDkwlOgpAl4+BkkJMgZdk4+EgaSCcpVX7bmY9kgXQQU+1TgE0c+QJZUUz1b2T4SBbIKmJW+3iMj2SBVBWz+leVfCQLpIqYbp8b85EskIxyfIOfK5Sf+wiCRJEsllQ+oqEkQfBxmD8BBgA5hVjXyrBNUQAAAABJRU5ErkJggg==);
	background-size: 100% 100%;

	.num {
		width: 36upx;
		height: 36upx;
		border-radius: 50px;
		font-size: 24upx;
		color: #fff;
		text-align: center;
		line-height: 36upx;
	}

	.sign {
		position: absolute;
		top: 0;
		left: 50%;
		line-height: 36upx;
		font-size: 12upx;
		color: #fff;
		transform: translateX(-50%);
	}
}
.weui-flex {
	display: flex;
	align-items: center;
}
.weui-flex__item {
	flex: 1;
}
.m-t {
	margin-top: 22upx;
}
.kouhao {
	font-size: $font-sm;
	justify-content: space-around;
	color: $base-color;
	.kouhao_item {
		display: flex;
	}
	image {
		width: 32upx;
		height: 32upx;
		margin-right: 4upx;
	}
}
/* 分类 */
.cate-section {
	display: flex;
	justify-content: space-around;
	align-items: center;
	flex-wrap: wrap;
	padding: 30upx 22upx 0;
	background: #fff;
	.cate-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		width: 140upx;
		padding-bottom: 30upx;
	}
	image {
		width: 88upx;
		height: 88upx;
		margin-bottom: 14upx;
		border-radius: 50%;
		box-shadow: 4upx 4upx 20upx rgba(62, 147, 23, 0.3);
	}
}

/* 秒杀专区 */
.seckill-section {
	padding: 20upx 0 24upx;
	.floor-list {
		white-space: nowrap;
	}
	.scoll-wrapper {
		display: inline-flex;
		align-items: flex-start;
		flex-direction: row;
		padding-left: 20upx;
	}
	.floor-item {
		background: #fff;
		width: 280upx;
		padding: 0 0 20upx;
		margin-right: 20upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		border-radius: 4%;
		overflow: hidden;
		.content {
			padding: 0 20upx;
		}
		image {
			width: 280upx;
			height: 280upx;
		}
	}
}
.f-header {
	display: flex;
	align-items: center;
	height: 100upx;
	padding: 6upx 30upx 8upx;
	background: #fff;
	.icon {
		flex-shrink: 0;
		width: 10upx;
		height: 36upx;
		background: linear-gradient(to bottom, #75d66f, #62b66c);
		margin-right: 12upx;
	}
	.tit-box {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.tit {
		font-size: $font-lg + 2upx;
		color: $font-color-dark;
		line-height: 1.3;
	}
	.tit2 {
		font-size: $font-sm;
		color: $font-color-light;
	}
	.icon-you {
		font-size: $font-lg + 2upx;
		color: $font-color-light;
	}
}
.newest-section {
	display: flex;
	flex-wrap: wrap;
	font-size: $font-base;
	padding-top: 20upx;
	.floor-item {
		background: #ffffff;
		width: 344upx;
		margin-left: 20upx;
		padding: 0 0 20upx;
		margin-bottom: 20upx;
		border-radius: 4%;
		overflow: hidden;
		.content {
			padding: 0 16upx;
		}
		image {
			width: 344upx;
			height: 344upx;
		}
	}
}
.bottom {
	text-align: center;
	font-size: $font-sm;
	color: $font-color-disabled;
	padding: 20upx;
}
</style>

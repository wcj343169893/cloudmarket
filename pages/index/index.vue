<template>
	<view class="container">
		<!-- 小程序头部兼容 -->
		<!-- #ifdef MP -->
		<view class="mp-search-box"><input class="ser-input" type="text" value="输入关键字搜索" disabled /></view>
		<!-- #endif -->

		<!-- 头部轮播 -->
		<view class="carousel-section">
			<!-- 标题栏和状态栏占位符 -->
			<view class="titleNview-placing"></view>
			<!-- 背景色区域 -->
			<view class="titleNview-background" :style="{ backgroundColor: titleNViewBackground }"></view>
			<swiper class="carousel" circular @change="swiperChange">
				<swiper-item v-for="(item, index) in carouselList" :key="index" class="carousel-item" @click="navToAdPage(item)">
					<image :src="item.src" />
				</swiper-item>
			</swiper>
			<!-- 自定义swiper指示器 -->
			<view class="swiper-dots">
				<text class="num">{{ swiperCurrent + 1 }}</text>
				<text class="sign">/</text>
				<text class="num">{{ swiperLength }}</text>
			</view>
		</view>
		<!--常买店铺 -->
		<view class="f-header m-t" v-if="oftenShopsList.length > 0">
			<image src="/static/temp/h1.png"></image>
			<view class="tit-box">
				<text class="tit">常买店铺</text>
				<text class="tit2">Frequent shops</text>
			</view>
			<text class="yticon icon-you"></text>
		</view>
		<view class="seckill-section" v-if="oftenShopsList.length > 0">
			<scroll-view class="floor-list" scroll-x>
				<view class="scoll-wrapper">
					<view v-for="(item, index) in oftenShopsList" :key="index" class="floor-item" @click="navToShopPage(item)">
						<image :src="item.src" mode="aspectFill"></image>
						<text class="title clamp">{{ item.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- 分类 -->
		<view class="cate-section m-t">
			<view v-for="(item, index) in mainShopCategoriesList" :key="index" class="cate-item" @click="navToCategoryPage(item)">
				<image :src="item.src"></image>
				<text>{{ item.name }}</text>
			</view>
		</view>

		<!-- <view class="ad-1"><image src="/static/temp/ad1.jpg" mode="scaleToFill"></image></view> -->

		<!-- 优选好店 -->
		<view class="f-header m-t"  v-if="recommendShopList.length > 0">
			<image src="/static/temp/h1.png"></image>
			<view class="tit-box">
				<text class="tit">优选好店</text>
				<text class="tit2">Recommendation store</text>
			</view>
			<text class="yticon icon-you"></text>
		</view>
		<view :class="recommendShopClass" v-if="recommendShopList.length > 0">
			<view v-for="(item,index) in recommendShopList" :key="index" class="rss-item" @click="navToShopPage(item)">
				<view class="imgs">
					<image :src="item.goods.src" class="goods" mode="aspectFill"></image>
					<image :src="item.src" class="logo"></image>
				</view>
				<text class="clamp">{{item.name}}</text>
			</view>
		</view>
		<!-- 附近店铺 -->
		<view class="f-header m-t">
			<image src="/static/temp/h1.png"></image>
			<view class="tit-box">
				<text class="tit">附近商家</text>
				<text class="tit2">Nearby shops</text>
			</view>
		</view>
		<view v-bind:class="{'fixed':nearbyHeaderPosition,'nearby-func-section':1}">
			<text v-bind:class="{active:(nearByShopIndex&1)==1,'fast-btn':1}" @click="getNearbyShops(1,1)">满减优惠</text>
			<text v-bind:class="{active:(nearByShopIndex&2)>>1==1,'fast-btn':1}" @click="getNearbyShops(2,1)">30分钟内</text>
			<text v-bind:class="{active:(nearByShopIndex&4)>>2==1,'fast-btn':1}" @click="getNearbyShops(4,1)">减配送费</text>
			<text v-bind:class="{active:(nearByShopIndex&8)>>3==1,'fast-btn':1}" @click="getNearbyShops(8,1)">大众好评</text>
		</view>
		<view class="nearby-section">
			<view v-for="(item,index) in nearbyShops" :key="index" class="shop-item" @click="navToShopPage(item)">
				<view class="image-wrapper"><image :src="item.src" mode="aspectFill"></image></view>
				<view class="desc">
					<view class="">
						<text class="title clamp">{{ item.name }}</text>
					</view>
					<view><text class="ops">评分{{ item.score}}</text> <text class="ops">月售{{ item.monthSale}}</text></view>
					<view class=""><text class="ops">起送￥{{ item.deliveryMin}}</text> <text class="ops">配送￥{{ item.deliveryMoney}}</text><text v-if="item.deliveryMoneyBefore > 0" class="del ops">{{item.deliveryMoneyBefore}}</text> <text class="ops">人均￥{{ item.perCapita}}</text></view>
					<view class="youhui" v-if="item.hasManjian">
						<text class="yh" v-for="(cou,ind) in item.manjians" :key="ind">{{cou.name}}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
	    mapState 
	} from 'vuex'; 
	import uniLoadMore from '@/components/uni-load-more/uni-load-more.vue';
export default {
	components: {
		uniLoadMore	
	},
	data() {
		return {
			titleNViewBackground: '',
			swiperCurrent: 0,
			swiperLength: 0,
			oftenShopsList: [],
			carouselList: [],
			mainShopCategoriesList: [],
			recommendShopList: [],
			recommendShopClass:"recommend-shops-section",
			nearbyShops:[],
			nearByShopIndex:0,
			nearByShopPage:1,
			nearByHeadTop:200,
			nearbyHeaderPosition:0,
			loadingType: 'more', //加载更多状态
			nearByShopMaxPage:3,
			goodsList: []
		};
	},

	onLoad() {
		this.loadData();
	},
	onPageScroll(e){
		//兼容iOS端下拉时顶部漂移
		if(e.scrollTop>=this.nearByHeadTop){
			this.nearbyHeaderPosition = 1;
		}else{
			this.nearbyHeaderPosition = 0;
		}
	},
	//下拉刷新
	onPullDownRefresh(){
		//this.loadData('refresh');
		console.log("刷新整页")
		this.loadData();
		uni.stopPullDownRefresh();
	},
	//加载更多
	onReachBottom(){
		if(this.loadingType !="nomore"){
			this.getNearbyShops(0,this.nearByShopPage+1);
		}
	},
	computed: {
		...mapState(['hasLogin', 'userInfo','stationId'])
	},
	methods: {
		/**
		 * 请求静态数据只是为了代码不那么乱
		 * 分次请求未作整合
		 */
		async loadData() {
			uniCloud
				.callFunction({
					name: 'home',
					data: {
						id:this.userInfo.id,
						shop_recommend_uid:this.userInfo.shop_recommend_uid,
						stationId:this.stationId
					}
				})
				.then(res => {
					//广告
					if(res.result.ads){
						let ads = res.result.ads;
						this.titleNViewBackground = ads[0].background;
						this.swiperLength = ads.length;
						this.carouselList = ads;
					}
					if(res.result.oftenShops){
						this.oftenShopsList = res.result.oftenShops;
					}
					if(res.result.categories){
						this.mainShopCategoriesList = res.result.categories;
					}if(res.result.recommendShops){
						this.recommendShopList = res.result.recommendShops;
						this.recommendShopClass ="recommend-shops-section rss-numb-"+res.result.recommendShops.length;
					}
					console.log("加载数据完成。。。");
				}).catch(err=>{
					uni.showToast({
						icon:"none",
						title:"网络异常"
					})
				});
				this.getNearbyShops(0,1);
			//let goodsList = await this.$api.json('goodsList');
			//this.goodsList = goodsList || [];
		},
		getNearbyShops(index,page){
			if(index > 0){
				uni.showLoading({
					title:"加载中"
				});
				
				if((this.nearByShopIndex & index)==index){
					//已经存在，减少
					this.nearByShopIndex=this.nearByShopIndex-index;
				}else{
					this.nearByShopIndex=this.nearByShopIndex+index;
				}
			}
			if(page > this.nearByShopMaxPage){
				this.loadingType = "nomore";
				return;
			}
			this.nearByShopPage = page;
			let limit=5;
			uniCloud.callFunction({
				name: 'getShops',
				data: {
					page:page,
					limit:limit,
					index:this.nearByShopIndex,
					stationId:this.stationId
				}
			}).then(res=>{
				uni.hideLoading();
				if(page == 1){
					//清空原数据
					this.nearbyShops =[];
				}
				console.log(page+" "+res.result.affectedDocs);
				if(res.result.affectedDocs > 0){
					//累加到现有数组
					this.nearbyShops = this.nearbyShops.concat(res.result.data)
					//不足一页，肯定没有下一页了
					if(res.result.affectedDocs < limit){
						this.loadingType = "nomore";
					}else{
						//还有数据
						this.loadingType = "more";
					}
				}else{
					this.loadingType = "nomore";
				} 
			}).catch(err=>{
				uni.showToast({
					icon:"none",
					title:"网络异常"
				})
			});
		},
		//轮播图切换修改背景色
		swiperChange(e) {
			const index = e.detail.current;
			this.swiperCurrent = index;
			this.titleNViewBackground = this.carouselList[index].background;
		},
		//广告轮播跳转
		navToAdPage(item){
			//https://ask.dcloud.net.cn/article/35621
			let link=item.link;
			if(link.indexOf("/pages") === 0){
				//跳转指定页面
				uni.navigateTo({
					url: `${link}`
				});
			}else if(link.indexOf("http") === 0){
				//跳转网页
				plus.runtime.openURL(link, function(res) {  
					console.log(res);  
				}); 
			}
		},
		//主分类首页
		navToCategoryPage(item){
			uni.navigateTo({
				url: `/pages/category/index?id=${item.id}&name=${item.name}`
			});
		},
		//详情页
		navToShopPage(item) {
			//测试数据没有写id，用title代替
			let id = item.id;
			uni.navigateTo({
				url: `/pages/shop/index?id=${id}`
			});
		}
	},
	// #ifndef MP
	// 标题栏input搜索框点击
	onNavigationBarSearchInputClicked: async function(e) {
		this.$api.msg('点击了搜索框');
	},
	//点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index === 0) {
			this.$api.msg('点击了扫描');
		} else if (index === 1) {
			// #ifdef APP-PLUS
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
	top: 30upx;
	z-index: 9999;
	width: 100%;
	padding: 0 80upx;
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
	.cate-section {
		position: relative;
		z-index: 5;
		border-radius: 16upx 16upx 0 0;
		margin-top: -20upx;
	}
	.carousel-section {
		padding: 0;
		.titleNview-placing {
			padding-top: 0;
			height: 0;
		}
		.carousel {
			.carousel-item {
				padding: 0;
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
.m-t {
	margin-top: 16upx;
}
/* 头部 轮播图 */
.carousel-section {
	position: relative;
	padding-top: 10px;

	.titleNview-placing {
		height: var(--status-bar-height);
		padding-top: 44px;
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
/* 分类 */
.cate-section {
	display: flex;
	justify-content: space-around;
	align-items: center;
	flex-wrap: wrap;
	padding: 30upx 22upx 0 22upx;
	background: #fff;
	.cate-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		width:150upx;
		padding-bottom: 30upx;
	}
	/* 原图标颜色太深,不想改图了,所以加了透明度 */
	image {
		width: 88upx;
		height: 88upx;
		margin-bottom: 14upx;
		border-radius: 50%;
		opacity: 0.7;
		box-shadow: 4upx 4upx 20upx rgba(250, 67, 106, 0.3);
	}
}
.ad-1 {
	width: 100%;
	height: 210upx;
	padding: 10upx 0;
	background: #fff;
	image {
		width: 100%;
		height: 100%;
	}
}
/* 秒杀专区 */
.seckill-section {
	padding: 4upx 30upx 24upx;
	background: #fff;
	.s-header {
		display: flex;
		align-items: center;
		height: 92upx;
		line-height: 1;
		.s-img {
			width: 140upx;
			height: 30upx;
		}
		.tip {
			font-size: $font-base;
			color: $font-color-light;
			margin: 0 20upx 0 40upx;
		}
		.timer {
			display: inline-block;
			width: 40upx;
			height: 36upx;
			text-align: center;
			line-height: 36upx;
			margin-right: 14upx;
			font-size: $font-sm + 2upx;
			color: #fff;
			border-radius: 2px;
			background: rgba(0, 0, 0, 0.8);
		}
		.icon-you {
			font-size: $font-lg;
			color: $font-color-light;
			flex: 1;
			text-align: right;
		}
	}
	.floor-list {
		white-space: nowrap;
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
		image {
			width: 150upx;
			height: 150upx;
			border-radius: 6upx;
		}
		.price {
			color: $uni-color-primary;
		}
	}
}
.recommend-shops-section{
	display: flex;
	justify-content: space-around;
	align-items: center;
	flex-wrap: wrap;
	padding:0 22upx 22upx;
	background: #fff;
	.rss-item{
		width: 48%;
		text-align: center;
		padding-bottom:22upx;
		.imgs{
			position: relative;
			.goods{
				width: 100%;
				height: 220upx;
				border-radius: 20upx;
			}
			.logo{
				position: absolute;
				right: 10upx;
				bottom: 10upx;
				width: 50upx;
				height: 50upx;
			}
		}
		.clamp{
			font-size: $font-sm + 2upx;
		}
		&:nth-child(2n + 1) {
			margin-right: 4%;
		}
	}
	&.rss-numb-1{
		.rss-item{
			width: 100%;
		}
	}
	&.rss-numb-3{
		.rss-item{
			&:nth-child(1) {
				width: 100%;
			}
			&:nth-child(2n + 1) {
				margin-right: 0;
			}
			&:nth-child(2n + 2) {
				margin-right: 2%;
			}
		}
	}
}
.nearby-section{
	padding: 10upx 22upx;
	.shop-item {
		background-color: #ffffff;
		display: flex;
		flex-direction: wrap;
		padding:20upx 20upx 30upx;
		border-radius: 20upx;
		margin-bottom: 10upx;
	}
	.image-wrapper {
		width: 140upx;
		height: 140upx;
		border-radius: 3px;
		overflow: hidden;
		margin-right: 22upx;
		image {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
	.desc{
		flex: 1;
		font-size: $font-sm;
		color: $font-color-light;
		.title {
			font-size: $font-lg;
			color: $font-color-dark;
			line-height: 60upx;
			font-weight: 400;
		}
		.ops{
			margin-right: 12upx;
		}
		.del{
			text-decoration: line-through;
		}
		.youhui{
			padding-top: 8upx;
			.yh{
				margin-right: 10upx;
				color: #F0AD4E;
				border: 1px solid #F0AD4E;
				font-size: 0.8em;
				padding: 0upx 10upx;
				line-height: 1;
				border-radius: 8upx;
			}
		}
	}
}
.nearby-func-section{
	padding:0 20upx 20upx;
	font-size: $font-sm;
	background: #fff;
	.fast-btn{
		background-color: #F8F8F8;
		color: $font-color-light;
		padding: 6upx 30upx;
		margin-right: 20upx;
		border-radius: 8upx;
		&.active{
			background-color: #FA436A;
			color: #ffffff;
		}
	}
}
.f-header {
	display: flex;
	align-items: center;
	height: 140upx;
	padding: 6upx 30upx 8upx;
	background: #fff;
	image {
		flex-shrink: 0;
		width: 80upx;
		height: 80upx;
		margin-right: 20upx;
	}
	.tit-box {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.tit {
		font-size: $font-lg + 2upx;
		color: #font-color-dark;
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
</style>

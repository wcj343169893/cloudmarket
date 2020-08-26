<template>
	<view class="container">
		<!-- 小程序头部兼容 -->
		<!-- #ifdef MP -->
		<!-- 顶部栏 -->
		<page-header :showFillView="true"></page-header>
		<!-- #endif -->
		<!-- 头部轮播 -->
		<view class="carousel-section" v-if="isLoaded">
			<!-- 标题栏和状态栏占位符 -->
			<view class="titleNview-placing"></view>
			<!-- 背景色区域 -->
			<view class="titleNview-background" :style="{ backgroundColor: titleNViewBackground }"></view>
			<!--收货地址-->
			<view class="titleNview-address" v-if="address != ''">
				<navigator url="/pages/index/chooseAddress">送至:{{ address }}</navigator>
			</view>
			<swiper class="carousel" circular @change="swiperChange">
				<swiper-item v-for="(item, index) in carouselList" :key="index" class="carousel-item" @click="navToAdPage(item)"><image :src="item.src" /></swiper-item>
			</swiper>
			<!-- 自定义swiper指示器 -->
			<view class="swiper-dots" v-if="carouselList && carouselList.length > 0">
				<text class="num">{{ swiperCurrent + 1 }}</text>
				<text class="sign">/</text>
				<text class="num">{{ swiperLength }}</text>
			</view>
		</view>
		<!-- 口号 -->
		<view class="weui-flex kouhao m-t" v-if="shop.id && shop.id > 0" @click="navToDocPageByType('app_goods_charge')">
			<view class="kouhao_item">
				<text class="yticon icon-chps"></text>
				<text>最快{{ shop.delivery.time }}分钟送达</text>
			</view>
			<view class="kouhao_item">
				<text class="yticon icon-money"></text>
				<text>{{ shop.delivery.minPrice }}元起送</text>
				<text v-if="shop.delivery.money == 0">{{ shop.delivery.money }}配送费</text>
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
								<view class="sub-title" v-if="item.subTitle && item.subTitle != ''">
									<text>{{ item.subTitle }}</text>
								</view>
								<view class="tags">
									<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{ tag.text }}</text>
								</view>
								<view class="">
									<text class="price">{{ item.price }}</text>
									<text class="price del" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
									<text class="sku_btn yticon icon-gouwuche_" @click.stop="saveCartAmount(item, item.miaosha.sku_id)"></text>
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
					<image :src="item.src" mode="aspectFill" lazy-load="true"></image>
					<view class="content">
						<view class="title clamp">
							<text>{{ item.title }}</text>
						</view>
						<view class="sub-title" v-if="item.subTitle && item.subTitle != ''">
							<text>{{ item.subTitle }}</text>
						</view>
						<view class="weui-flex">
							<view class="weui-flex__item">
								<view class="tags">
									<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{ tag.text }}</text>
								</view>
								<view class="">
									<text class="price">{{ item.price }}</text>
									<text class="price del" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
								</view>
							</view>
							<view class="buttons">
								<text class="sku_btn" v-if="item.yuding">查看</text>
								<text class="sku_btn" v-else-if="item.hasSku" @click.stop="openSku(item)">选规格</text>
								<text class="sku_btn yticon icon-gouwuche_" v-else @click.stop="saveCartAmount(item, 0)"></text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</block>
		<view class="bottom" v-show="isLoaded"><text>以下没数据了</text></view>
		<!-- 选规格 -->
		<uni-popup ref="showsku" type="center" :mask-click="true">
			<view class="skuDialogPanel">
				<view class="title">
					<text>{{ skuGoods.title }}</text>
				</view>
				<view v-for="(item, index) in skuGoods.skuNameMap" :key="index">
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
				<view class="sku_selected">
					<text>已选择规格：{{ skuGoodsSelected }}</text>
				</view>
				<view class="sku_prices_buttons">
					<view class="sku_prices_buttons__price ">
						<text class="price">{{ skuGoods.showPrice }}</text>
						<text class="price del m-l" v-if="skuGoods.showOriginPrice > 0">{{ skuGoods.showOriginPrice }}</text>
					</view>
					<view class="sku_prices_buttons__btn"><text class="sku_btn yticon icon-gouwuche_" @click.stop="saveCartAmount(skuGoods, skuGoods.selectedSkuId)"></text></view>
				</view>
			</view>
			<view class="uni-image-close" @click="closeSkuDialog()"><uni-icons type="clear" color="#fff" size="40" /></view>
		</uni-popup>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import pageHeader from './components/page-header.vue';
import { getHomeFruitData, editCart } from '@/common/request.js';
import { navToGoodsItemPage, updateGoodsTags, incrCartNumber, updateCartNumber, navToDocPageByType, navToDocWebPage, showLoginDialog } from '@/common/functions.js';

export default {
	components: {
		pageHeader
	},
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
			newestList: [],
			shop: {},
			skuGoods: {},
			share: {},
			skuGoodsSelected: ''
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
			//重新加载数据
			this.loadData();
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
				uni.showLoading({
					title:"正在定位"
				})
				uni.getLocation({
					type: 'gcj02',
					altitude: true,
					geocode: true,
					success: res => {
						uni.hideLoading();
						console.log('获取定位完成', res);
						this.address = '当前位置';
						//#ifndef MP
						if(res.address){
							this.address = res.address.poiName;
						}
						//百度地图
						//this.address = res.address.street + res.address.streetNum;
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
						uni.hideLoading();
						this.address = '定位失败,将展示默认信息';
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
					this.shop = res.shop;
					this.searchKeyWords = res.shop.searchGoodsKeywords;
					//同时写入缓存，在分类页面也能调用
					uni.setStorage({
						key: 'shopSearchGoodsKeywords',
						data: this.searchKeyWords
					});
					this.getDefaultSearchWord();
				}
				this.share = res.share;
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
			console.log(item);
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
		navToDocPageByType(id) {
			navToDocPageByType(id);
		},
		navToCategoryPage(id) {
			this.changeMainCateId(+id);
			uni.switchTab({
				url: `/pages/index/category`
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
		navToSearch() {
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
		},
		//更新购物车数据到服务器
		saveCartAmount(item, sku_id) {
			let number = 1;
			if (!this.hasLogin) {
				showLoginDialog();
				return;
			}
			console.log(item);
			editCart({
				id: this.shopId,
				stationId: this.stationId,
				goods_id: item.id,
				sku_id: +sku_id,
				price: item.price,
				title: item.title,
				appends: 1,
				subTitle: item.subName,
				src: item.src,
				checked: 1,
				amount: number
			}).then(
				res => {
					console.log(res);
					this.$api.msg('加入成功', 2000, true, 'success');
					incrCartNumber(1);
				},
				err => {
					this.$api.msg(err.message);
				}
			);
		},
		openSku(item) {
			if (!this.hasLogin) {
				this.showLoginDialog();
				return;
			}
			//处理规格结构
			let skus = item.skus;
			console.log(skus);
			let skuMap = [];
			for (let n in item.skuname) {
				skuMap.push({
					name: item.skuname[n],
					active: 0, //相当于默认选中第一个，一定存在
					child: [],
					childName: []
				});
			}
			console.log(skuMap);
			let nameMap = {};
			//所有存在的规格名称，例如：aabb，bbcc
			let nameHash = [];
			let miaoshaSkuName = [];
			skus.map(sku => {
				let names = sku.name.split('&gt;');
				names.map((n, i) => {
					if (skuMap[i]['childName'].indexOf(n) == -1) {
						skuMap[i]['child'].push({
							value: n,
							stock: sku.stock,
							disabled: false
						});
						skuMap[i]['childName'].push(n);
					}
				});
				//name排序之后再拼接起来
				nameHash.push(names.sort().join('&gt;'));
				nameMap[sku.name] = sku;

				if (miaoshaSkuName.length == 0) {
					if (item.miaosha && item.miaosha.sku_id == sku.id) {
						miaoshaSkuName = names;
					} else if (item.default_checked_sku_id == sku.id) {
						//本身默认选中
						miaoshaSkuName = names;
					}
				}
			});
			//默认第一个规格的选中次数
			item['cart'] = 0;
			item['skuNameIds'] = nameMap;
			item['skuNameMap'] = skuMap;
			item['skuNameHash'] = nameHash;
			this.skuGoods = item;
			//默认选中第一个
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
			//延时打开
			this.$nextTick(() => {
				this.$refs['showsku'].open();
			});
		},
		/**关闭sku选择弹窗**/
		closeSkuDialog() {
			this.$refs['showsku'].close();
		},
		/**规格选择**/
		selectSku(index, index2) {
			console.log('selectSku', index, index2);
			//被点击的name
			let clickName = this.skuGoods.skuNameMap[index]['child'][index2];
			if (clickName.disabled) {
				console.log(clickName);
				return false;
			}
			//skuNameIds
			this.skuGoods.skuNameMap[index].active = index2;
			//更新已选择规格
			let names = [];
			this.skuGoods.skuNameMap.forEach((skuname, ind) => {
				names.push(skuname['child'][skuname.active].value);
				skuname['child'].forEach(n2 => {
					//点击的其他行
					if (ind != index) {
						let joinName = [clickName.value, n2.value].sort().join('&gt;');
						//不存在组合或者库存不足
						n2.disabled = this.skuGoods.skuNameHash.indexOf(joinName) == -1 || n2.stock < 1;
					}
				});
			});
			//匹配skuid
			let selectSku = this.skuGoods['skuNameIds'][names.join('&gt;')];
			this.skuGoods['selectedSkuId'] = selectSku.id;
			//更新商品价格
			this.skuGoods['showPrice'] = selectSku.price;
			//库存和限购
			this.skuGoods['stock'] = selectSku.stock;
			this.skuGoods['limit'] = selectSku.limit;
			this.skuGoods['showOriginPrice'] = selectSku.originPrice ? selectSku.originPrice : 0;
			//console.log(this.skuGoods)
			this.skuGoodsSelected = names.join('、');
		}
	},
	// #ifdef MP-WEIXIN
	onShareAppMessage(res) {
		if (res.from === 'button') {
			// 来自页面内分享按钮
			console.log(res.target);
		}
		let query = [];
		if (this.userInfo) {
			query.push('uid=' + this.userInfo.id);
		}
		if (this.share.pageLinkQuery) {
			query.push(this.share.pageLinkQuery);
		}
		return {
			title: this.share.title,
			path: '/pages/index/fruit?' + query.join('&')
		};
	},
	//#endif

	// #ifndef MP
	// 标题栏input搜索框点击
	onNavigationBarSearchInputClicked: async function(e) {
		//this.$api.msg('点击了搜索框');
		console.log('onNavigationBarSearchInputClicked');
		this.navToSearch();
	},
	//点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		const index = e.index;
		console.log('onNavigationBarButtonTap');
		//this.$api.msg(index+" ");
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
page {
	.carousel-section {
		padding: 0;
		.titleNview-placing {
			padding: 0;
			height: 16rpx;
		}
		.titleNview-background {
			height: 380rpx;
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
	$width: 320rpx;
	.floor-item {
		background: #fff;
		width: $width;
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
			width: $width;
			height: $width;
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
		.title {
			margin-bottom: 4rpx;
		}
	}
}
.bottom {
	text-align: center;
	font-size: $font-sm;
	color: $font-color-disabled;
	padding: 20upx;
}
.sku_btn {
	color: #ffffff;
	background: $btn-color-light;
	font-size: $font-sm;
	float: right;
	padding: 4rpx 8rpx;
	border-radius: 8rpx;
	&.yticon {
		font-size: 48rpx;
		color: $btn-color-light;
		background: none;
	}
}
.sub-title {
	font-size: $font-sm;
	color: $font-color-disabled;
}
.skuDialogPanel {
	background: #ffffff;
	width: 670upx;
	border-radius: 20upx;
	padding: 30upx 20upx;
	font-size: $font-base;
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
	.sku_selected {
		background: #fafafa;
		margin: 20upx -20upx;
		padding: 12upx 20upx;
		border: 2upx solid #f3f3f3;
		border-left: none;
		border-right: none;
	}
	.sku_prices_buttons {
		display: flex;
	}
	.sku_prices_buttons__price {
		flex: 1;
	}
	.sku_prices_buttons__btn {
	}
}
.uni-image-close {
	margin-top: 20upx;
	text-align: center;
}
</style>

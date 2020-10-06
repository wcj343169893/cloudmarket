<template>
	<view class="container">
		<!-- 小程序头部兼容 -->
		<!-- #ifdef MP -->
		<!-- 顶部栏 -->
		<page-header :showFillView="true" :showLocationView="false"></page-header>
		<!-- #endif -->
		<view class="main-category-panel-all" :class="{show:isShowCategoryPanelPre}" @click="closeCategoryPanel()" v-if="isShowCategoryPanel">
			<view class="main-categories" :style="{top: categoryPanelHeight}">
				<view v-for="(item, index) in categories" :key="index" @click.stop="changeMainCategory(item, index)" class="item"
				 :class="{ current: item.id == mainCurrentId }" :style="{
							width: cateWidth
						}">
					<image :src="item.src" mode="aspectFill"></image>
					<view class="">
						<text>{{ item.name }}</text>
					</view>
				</view>
			</view>
			<view class="shadow"></view>
		</view>
		<view class="main-content" :style="{
					height: contentHeight
				}">
			<view class="main-category-panel b-b" :style="{
					height: cateHeight
				}">
				<scroll-view scroll-with-animation scroll-x class="main-categories" :style="{
						height: cateScorllHeight
					}"
				 :scroll-left="categoryScrollLeft">
					<view v-for="(item, index) in categories" :key="index" @click="changeMainCategory(item, index)" class="item"
					 :class="{ current: item.id == mainCurrentId }" :style="{
							width: cateWidth
						}">
						<image :src="item.src" mode="aspectFill"></image>
						<view class="">
							<text>{{ item.name }}</text>
						</view>
					</view>
				</scroll-view>
				<view class="buttons" :style="{
						height: cateHeight
					}" @click="openCategoryPanel()">
					<text>全</text>
					<text>部</text>
					<text class="yticon" :class="{'icon-xia':!isShowCategoryPanel,'icon-shang':isShowCategoryPanel}"></text>
				</view>
			</view>
			<view class="content">
				<scroll-view scroll-with-animation scroll-y class="left-aside" :scroll-top="categoryScrollTop">
					<view class="left-aside-content">
						<view v-for="(item, index) in categoryList" :key="index" class="f-item " :class="{ active: item.id === currentId, before: item.id === currentBeforeId, after: item.id === currentAfterId ,'b-b':index<categoryList.length-1}"
						 @click="changeSubCategory(item, index)">
							<text>{{ item.name }}</text>
						</view>
						<view class="space" :class="{ after: currentAfterId == 0 }"></view>
					</view>
				</scroll-view>
				<scroll-view scroll-with-animation scroll-y class="right-aside" @scrolltolower="goodsScorllEvent">
					<view class="sort-bar b-b">
						<text class="sort-bar-name">{{currentItem.name}}</text>
						<view class="sort-bar-item center" :class="{active: item.current, last: index === sortList.length-1}" v-for="(item,index) in sortList"
						 :key="index" @click="changeSort(item)">
							<text>{{ item.name }}</text>
							<view v-if="item.children.length>1" class="icon-wrap">
								<text class="yticon icon-shang" :class="{active: item.children[0].current}"></text>
								<text class="yticon icon-xia" :class="{active: item.children[1].current}"></text>
							</view>
						</view>
					</view>
					<view class="sort-bar-empty"></view>
					<view class="loading_empty" v-if="goodsList.length === 0"></view>
					<view v-for="(item, index) in goodsList" :key="index" class="goodsList" @click="navToGoodsPage(item)">
						<view class="weui-flex">
							<view class="image-wrapper">
								<image :src="item.src" mode="aspectFill" lazy-load="true" @load="imageOnLoad(item)"></image>
							</view>
							<view class="desc weui-flex__item">
								<view class="">
									<text class="title">{{ item.title }}</text>
								</view>
								<view class="sub-title" v-if="item.subTitle && item.subTitle != ''">
									<text>{{ item.subTitle }}</text>
								</view>
								<view class="desc2">
									<text>月售{{ item.monthlySale }}</text>
									<text class="m-l">好评度{{ item.score * 100 }}%</text>
								</view>
								<view class="tags">
									<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{ tag.text }}</text>
								</view>
								<view class="buttons">
									<view>
										<text class="price">{{ item.price }}</text>
										<text class="price del m-l" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
									</view>
									<view class="sku_button" v-if="item.yuding"><text class="sku_btn">查看</text></view>
									<view class="sku_button" v-else-if="item.hasSku">
										<text class="sub_number" v-if="item.cart > 0">{{ item.cart }}</text>
										<text class="sku_btn" @click.stop="openSkus(item)">选规格</text>
									</view>
									<view class="sku_button" v-else>
										<text class="sub_number gouwuche" v-if="item.cart > 0">{{ item.cart }}</text>
										<text class="sku_btn yticon icon-gouwuche_" @click.stop="saveCartAmount(item, 0)"></text>
									</view>
								</view>
							</view>
						</view>
					</view>
					<uni-load-more :status="loadingType" :contentText="loadingContent"></uni-load-more>
				</scroll-view>
			</view>
		</view>
		<!-- 登录提示 -->
		<uni-popup ref="showlogin" :type="skuDialogType" :mask-click="true" @change="change">
			<view class="loginDialog">
				<image :src="userInfo.portrait || '/static/missing-face.png'" mode=""></image>
				<view class="notice"><text>您还未登录</text></view>
				<view class="weui-flex">
					<view class="weui-flex__item"><text class="btn btn_ok" @click="navToLoginPage()">登录</text></view>
					<view class="weui-flex__item" @click="closeLoginDialog()"><text class="btn">取消</text></view>
				</view>
			</view>
		</uni-popup>
		<!-- 选规格 -->
		<uni-popup ref="showsku" :type="skuDialogType" :mask-click="true" @change="change">
			<view class="skuDialogPanel">
				<view class="title">
					<text>{{ skuGoods.title }}</text>
				</view>
				<view v-for="(item, index) in skuGoods.skuNameMap" :key="index">
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
				<view class="sku_selected">
					<text>已选择规格：{{ skuGoodsSelected }}</text>
				</view>
				<view class="sku_prices_buttons">
					<view class="sku_prices_buttons__price ">
						<text class="price">{{ skuGoods.showPrice }}</text>
						<text class="price del m-l" v-if="skuGoods.showOriginPrice > 0">{{ skuGoods.showOriginPrice }}</text>
					</view>
					<view class="sku_prices_buttons__btn">
						<text class="sku_btn yticon icon-gouwuche_" @click.stop="saveCartAmount(skuGoods, skuGoods.selectedSkuId)"></text>
					</view>
				</view>
			</view>
			<view class="uni-image-close" @click="closeSkuDialog()">
				<uni-icons type="clear" color="#fff" size="40" />
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import pageHeader from './components/page-header.vue';
	import tabbarMixin from './mixin/tabbar';
	import {
		getCategories,
		cloudMall,
		getAllCategories,
		editCart,
		cleanCart,
		getCartList
	} from '@/common/request.js';
	import {
		navToGoodsItemPage,
		navToLoginPage,
		showLoginDialog,
		updateGoodsTags
	} from '@/common/functions.js';
	export default {
		mixins: [tabbarMixin],
		components: {
			pageHeader
		},
		data() {
			return {
				isLoaded: false,
				categories: [],
				mainCurrentId: 0,
				categoryWidth: 140,
				subcategoryHeight: 100,
				categoryHeight: 138,
				categoryScrollLeft: 0,
				categoryScrollTop: 0,
				mainCurrentItem: {},
				currentItem: {},
				isShowCategoryPanel: false,
				isShowCategoryPanelPre: false,
				categoryPanelHeight: "",
				loadingContent: {
					contentdown: "上拉显示更多",
					contentrefresh: "正在加载...",
					contentnomore: "到底了，看看别的分类吧"
				},
				isOpenCategoryOne: false,
				sortList: [{
						name: '销量',
						children: [{
							sort: "monthlySale",
							current: true,
							order: "desc"
						}],
						current: true
					},
					{
						name: '价格',
						children: [{
							sort: "price",
							current: true,
							order: "asc"
						}, {
							sort: "price",
							current: false,
							order: "desc"
						}],
						current: false
					}
				],
				shopinfo: {
					name: '',
					perCapita: 0,
					score: 0,
					monthSale: 0,
					delivery: {}
				},
				inited: false, //是否获得了店铺数据
				searchWord: '',
				headHeight: 100,
				goodsList: [],
				sizeCalcState: false,
				tabScrollTop: 0,
				leftScrollTop: 0,
				currentId: 0,
				nunn: 1,
				currentBeforeId: 0,
				currentAfterId: 0,
				categoryList: [],
				slist: [],
				mainCategoryMap: {}, //主分类id索引
				cartNumber: {}, //大分类对应商品数量
				cartInfo: {
					sumCart: 0,
					sumPrice: 0,
					sumDiscount: 0,
					sumDeliveryMoney: 0,
					dataList: []
				},
				goodsSkusMap: {}, //商品+规格map数据，用于购物车动态处理
				goodsCartNumber: {}, //商品购物车总计
				skuDialogType: 'center',
				cartDialogType: 'bottom',
				isCartOpen: false,
				searchKeyWords: [],
				skuGoods: {},
				skuGoodsSelected: '',
				skuCart: {} ////多规格购物车数量统计
			};
		},
		watch: {
			hasLogin() {
				console.log('watch 登录状态改变,刷新当前页面');
				this.closeLoginDialog();
			},
			categoryId(v) {
				//切换选中分类
				this.changeMainCategoryById(v);
			},
			shopId(id) {
				console.log('watch 店铺id改变,刷新当前页面');
				this.loadData();
			}
		},
		onLoad() {
			this.loadData();
		},
		onShow() {
			this.closeCategoryPanel();
		},
		computed: {
			...mapState(['userInfo', 'stationId', 'categoryId']),
			cateHeight() {
				return uni.upx2px(this.categoryHeight) + 'px';
			},
			cateScorllHeight() {
				return uni.upx2px(this.categoryHeight + 30) + 'px';
			},
			cateWidth() {
				return uni.upx2px(this.categoryWidth) + 'px';
			},
			contentHeight() {
				let height = '';
				//#ifdef MP
				height = this.systemInfo.windowHeight - this.systemInfo.statusBarHeight - this.systemInfo.navigationBarHeight +
					'px';
				//#endif
				return height;
			}
		},
		methods: {
			async loadData() {
				this.getCateList();
				//加载店铺信息
				this.searchKeyWords = uni.getStorageSync('shopSearchGoodsKeywords');
				this.getDefaultSearchWord();
			},
			/**
			 * 查询店铺所有分类
			 */
			async getCateList() {
				cloudMall('category', 'cates', {
					id: this.shopId
				}).then(
					res => {
						this.categories = res;
						//默认为第一个分类
						if (this.categoryId > 0) {
							//默认选中首页选中的分类
							this.changeMainCategoryById(this.categoryId);
						} else {
							this.changeMainCategory(res[0], 0);
						}
					},
					err => {
						console.log('没有分类');
					}
				);
			},
			/**
			 * 根据id，切换主分类
			 * @param {Object} id
			 */
			changeMainCategoryById(id) {
				let item, index;
				this.categories.map((cate, i) => {
					if (cate.id == id) {
						item = cate;
						index = i;
					}
				});
				this.changeMainCategory(item, index);
			},
			/**
			 * 切换主分类
			 * @param {Object} item
			 */
			changeMainCategory(item, index) {
				if (this.mainCurrentId == item.id) {
					console.log("主分类没有变化");
					return;
				}
				//顶部默认分类
				this.mainCurrentItem = item;
				this.mainCurrentId = item.id;
				//左侧默认分类,
				this.categoryList = item.children;
				this.changeSubCategory(item.children[0], 0);
				let cu = 2;
				this.$nextTick(() => {
					if (index > cu) {
						this.categoryScrollLeft = (index - cu) * uni.upx2px(this.categoryWidth);
					} else {
						this.categoryScrollLeft = 0;
					}
					if (!this.isOpenCategoryOne) {
						setTimeout(()=>{
							this.openCategoryPanel();
						},200)
						this.isOpenCategoryOne = true;
					} else {
						this.closeCategoryPanel();
					}
				})
			},
			/**
			 * 切换左侧二级分类
			 * @param {Object} item
			 * @param {Object} index
			 */
			changeSubCategory(item, index) {
				if (this.currentId == item.id) {
					console.log("左侧分类没有变化");
					return;
				}
				this.currentItem = item;
				this.currentId = item.id;
				if (index > 0) {
					this.currentBeforeId = this.categoryList[index - 1].id;
				} else {
					this.currentBeforeId = 0;
				}
				if (index < this.categoryList.length - 1) {
					this.currentAfterId = this.categoryList[index + 1].id;
				} else {
					this.currentAfterId = 0;
				}
				let cu = 5;
				this.$nextTick(() => {
					if (index > cu) {
						this.categoryScrollTop = (index - cu) * uni.upx2px(this.subcategoryHeight);
					} else {
						this.categoryScrollTop = 0;
					}
				})
				this.refreshList();
			},
			/**
			 * 重新刷新商品列表
			 */
			refreshList() {
				this.page = 0;
				this.loaded = false;
				this.goodsList = [];
				//查询商品
				this.getGoodsByCid();
			},
			/**
			 * 排序
			 * @param {Object} item
			 */
			changeSort(item) {
				if (item.current) {
					if (item.children.length == 1) {
						//无效点击
						return;
					}
					//反选
					item.children.forEach(child => {
						child.current = !child.current;
					});
				} else {
					this.sortList.forEach(v => v.current = false);
					item.current = true;
				}
				this.refreshList();
			},
			/**
			 * 异步根据分类id加载商品
			 * @param {Object} category
			 */
			async getGoodsByCid() {
				this.page++;
				let category = this.currentItem;
				this.loadingType = 'loading';
				let sorts = this.sortList.filter(item => item.current)[0].children.filter(child => child.current)[0];
				cloudMall('product', 'getByCid', {
					shopid: this.shopId,
					page: this.page,
					limit: this.limit,
					cateid: category.id,
					//sort: this.sortList.filter(item => item.current)[0].type,
					isRecommend: category.id == category.pid,
					...sorts
				}).then(
					res => {
						this.loaded = true;
						res.forEach(ele => {
							ele['cart'] = 0;
							updateGoodsTags(ele);
							if (!this.skuCart[ele.id]) {
								this.skuCart[ele.id] = {};
							}
						});
						if (res.length < this.limit) {
							this.loadingType = 'noMore';
						}
						this.goodsList = this.goodsList.concat(res);
						this.resetGoodsCart();
					},
					err => {
						this.loaded = true;
						this.loadingType = 'noMore';
						console.log('没有商品');
					}
				);
			},
			/**
			 * 刷新商品购物车数量
			 */
			resetGoodsCart() {
				//console.log("category resetGoodsCart",this.cartMap)
				this.goodsList.forEach(ele => {
					if (ele.hasSku) {
						ele['cart'] = 0;
						ele.skus.map(sku => {
							let key = ele.id + '_' + sku.id;
							let cartI = 0;
							//多规格购物车数量统计
							ele['cart'] += this.skuCart[ele.id][sku.id] = this.cartMap[key] ? parseInt(this.cartMap[key]) : 0;
						});
					} else {
						let key = ele.id + '_0';
						//单品购物车数量
						ele['cart'] = this.skuCart[ele.id][0] = this.cartMap[key] ? parseInt(this.cartMap[key]) : 0;
					}
				});
				//console.log(this.goodsList);
			},
			/**打开sku选择弹窗**/
			openSkus(item) {
				if (!this.hasLogin) {
					this.showLoginDialog();
					return;
				}
				//处理规格结构
				let skus = item.skus;
				let skuMap = [];
				for (let n in item.skuname) {
					skuMap.push({
						name: item.skuname[n],
						active: 0, //相当于默认选中第一个，一定存在
						child: [],
						childName: []
					});
				}
				//console.log(skuMap);
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

					/* if (miaoshaSkuName.length == 0) {
						if (item.miaosha && item.miaosha.sku_id == sku.id) {
							miaoshaSkuName = names;
						} else if (item.default_checked_sku_id == sku.id) {
							//本身默认选中
							miaoshaSkuName = names;
						}
					} */
				});
				let selectSku = [];
				if (selectSku.length == 0) {
					//优先选中秒杀型号
					selectSku = item.skus.filter(sku => {
						return item.miaosha && item.miaosha.sku_id == sku.id;
					});
				}
				if (selectSku.length == 0) {
					//其次选中默认型号
					selectSku = item.skus.filter(sku => {
						return item.default_checked_sku_id == sku.id;
					});
				}
				if (selectSku.length == 0) {
					//实在没有，则选中第一个型号
					selectSku = item.skus;
				}
				//console.log("selectSku", selectSku);
				miaoshaSkuName = selectSku[0].name.split('&gt;');

				//console.log(miaoshaSkuName)
				//默认第一个规格的选中次数
				//item['cart'] = 0;
				item['catPid'] = this.mainCurrentId;
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
				//console.log(item);
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
				//console.log('selectSku', index, index2);
				//被点击的name
				let clickName = this.skuGoods.skuNameMap[index]['child'][index2];
				if (clickName.disabled) {
					//console.log(clickName);
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
				this.skuGoods['skuCart'] = this.cartMap[this.skuGoods.id + '_' + selectSku.id];
				this.skuGoods['showOriginPrice'] = selectSku.originPrice ? selectSku.originPrice : 0;
				//console.log(this.skuGoods)
				this.skuGoodsSelected = names.join('、');
			},
			change(e) {
				console.log('是否打开:' + e.show);
			},
			showLoginDialog() {
				//登录提示框
				showLoginDialog();
				//console.log("showLoginDialog")
				//this.$refs['showlogin'].open();
			},
			closeLoginDialog() {
				this.$refs['showlogin'].close();
			},
			goodsScorllEvent(e) {
				if (this.loadingType != 'noMore') {
					this.getGoodsByCid();
				}
			},
			navToGoodsPage(item) {
				//navToGoodsPage(item.id,0);
				navToGoodsItemPage(item);
			},
			navToLoginPage() {
				navToLoginPage();
			},
			getDefaultSearchWord() {
				if (this.searchKeyWords && this.searchKeyWords.length > 0) {
					this.searchWord = this.searchKeyWords[parseInt(Math.random() * this.searchKeyWords.length)];
				}
				// #ifdef APP-PLUS
				let webView = this.$mp.page.$getAppWebview();
				let tn = webView.getStyle().titleNView;
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
			openCategoryPanel() {
				if (this.isShowCategoryPanel) {
					this.closeCategoryPanel();
				} else {
					this.isShowCategoryPanel = true;
					setTimeout(() => {
						this.isShowCategoryPanelPre = true;
						this.categoryPanelHeight = this.cateHeight;
						//#ifdef MP
						this.categoryPanelHeight = (this.systemInfo.statusBarHeight + this.systemInfo.navigationBarHeight + uni.upx2px(
							this.categoryHeight)) + "px";
						//#endif
					}, 50);
				}
			},
			closeCategoryPanel() {
				this.categoryPanelHeight = "";
				this.isShowCategoryPanelPre = false;
				setTimeout(() => {
					this.isShowCategoryPanel = false;
				}, 300);
			},
		},
		// #ifndef MP
		// 标题栏input搜索框点击
		onNavigationBarSearchInputClicked: async function(e) {
			//this.$api.msg('点击了搜索框');
			uni.navigateTo({
				url: `/pages/search/search?key=${this.searchWord}`
			});
		}
		// #endif
	};
</script>

<style lang="scss">
	page,
	.container {
		height: 100%;
		background-color: #ffffff;
		position: relative;
	}

	.space {
		padding: 20upx 0 0;
		background: #fff;
	}

	.weui-flex {
		display: flex;
		align-items: center;
	}

	.weui-flex__item {
		flex: 1;
	}

	$border-color: #f5f5f5;

	.content {
		display: flex;
		background-color: #f8f8f8;
		height: 100%;
	}

	.left-aside {
		flex-shrink: 0;
		width: 160upx;
		height: 100%;

		.left-aside-content {
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			min-height: 100%;

			.space {
				padding: 0;
				flex: 1;

				&.after {
					border-radius: 0 10px 0 0;
				}
			}
		}
	}

	.f-item {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100upx;
		font-size: 28upx;
		color: $font-color-base;
		position: relative;
		background: #fff;

		.sub_number {
			top: 6upx;
		}

		&.active {
			color: $base-color;
			background: #f8f8f8;
			font-weight: 500;

			&:before {
				content: '';
				position: absolute;
				left: 0;
				top: 50%;
				transform: translateY(-50%);
				height: 36upx;
				width: 8upx;
				background-color: $base-color;
				border-radius: 0 4px 4px 0;
				opacity: 0.8;
			}

			&.b-b:after {
				display: none;
			}
		}

		&.before {
			border-radius: 0 0 10px 0;

			&.b-b:after {
				display: none;
			}
		}

		&.after {
			border-radius: 0 10px 0 0;
		}
	}

	.right-aside {
		flex: 1;
		overflow: hidden;
		padding: 2upx 0 0 18upx;
		height: 100%;
		position: relative;

		.s-item {
			display: flex;
			align-items: center;
			height: 70upx;
			font-size: 28upx;
			color: $font-color-dark;
		}

		.goodsList {
			background: #ffffff;
			padding: 20upx;
			border-radius: 8rpx;
			margin-bottom: 8upx;

			.weui-flex {
				align-items: flex-start;
			}

			.sub-catename {
				padding-bottom: 10upx;
			}
		}

		.empty {
			text-align: center;
			padding: 50rpx 0;
			font-size: $font-base;
		}

		.image-wrapper {
			width: 120upx;
			height: 120upx;
			overflow: hidden;
			border-radius: 4%;
			margin-right: 22upx;
			flex-shrink: 0;

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
				font-size: $font-base;
				color: $font-color-dark;
				line-height: 1.1;
				font-weight: 400;
			}

			.desc2 {
				padding: 4upx 0 0;
			}

			.buttons {
				margin-top: 6upx;
				display: flex;
				justify-content: space-between;

				.empty {
					flex: 1;
				}
			}
		}
	}

	.m-l {
		margin-left: 10upx;
	}

	/**选规格**/
	$box-height: 60upx;

	.sku_button {
		width: 80upx;
		height: $box-height;
		flex: 1;
		text-align: right;
		position: relative;
	}

	.sku_btn {
		background: $btn-color-light;
		color: $font-color-white;
		padding: 12upx 24upx 12upx;
		border-radius: 30upx;
		display: inline-block;
		font-size: $font-ssm;

		&.yticon {
			font-size: 48rpx;
			color: $btn-color-light;
			background: none;
		}
	}

	.sub_number {
		position: absolute;
		right: 6upx;
		top: -26upx;
		background: $base-color;
		line-height: 1;
		font-size: $font-sm;
		color: #ffffff;
		padding: 4upx;
		border-radius: 32upx;
		width: 32upx;
		text-align: center;
		z-index: 10;

		&.gouwuche {
			top: -8rpx;
		}
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
			position: relative;
		}
	}

	.uni-image-close {
		margin-top: 20upx;
		text-align: center;
	}

	.loginDialog {
		background: #ffffff;
		width: 520upx;
		border-radius: 20upx;
		padding: 30upx 20upx;
		font-size: $font-base;
		text-align: center;

		image {
			width: 200upx;
			height: 200upx;
		}

		.notice {
			padding: 20upx 0 40upx;
		}

		.btn {
			padding: 10upx 30upx;
			background: #ffffff;
			border-radius: 20upx;
		}

		.btn_ok {
			background: $btn-color-light;
			color: #ffffff;
		}
	}

	.cart {
		$bg-color: #1c1819;
		position: fixed;
		left: 25upx;
		bottom: 60upx;
		background: none;
		z-index: 100;
		font-size: $font-sm;
		width: 700upx;
		border-radius: 60upx;
		color: #fff;
		height: 90upx;

		.weui-flex {
			align-items: stretch;
		}

		.settleMoney {
			background: $bg-color;

			.weui-flex {
				align-items: center;
			}

			.img {
				position: relative;
				margin-right: 16upx;
			}

			image {
				width: 80upx;
				height: 80upx;
			}
		}

		.price {
			color: #ffffff;
			line-height: 1.2;
		}

		.delivery {
			line-height: 1.2;
		}

		.sub_number {
			top: 18upx;
			right: 18upx;
			background: none;
		}

		.btn {
			padding: 0 24upx;
			align-items: center;
			display: flex;
			background: $bg-color;
			border-radius: 60upx 0 0 60upx;
		}

		.btn_tel {
			margin-right: 4upx;
		}

		.btn_ok {
			background: $btn-color-light;
			border-radius: 0 60upx 60upx 0;
			color: $font-color-dark;
		}

		.notice {
			text-align: center;
			background: #fffbf2;
			width: 432upx;
			margin: 0 auto;
			color: #333;
			padding: 4upx;
			position: absolute;
			top: -40upx;
			left: 142upx;
		}
	}

	.cart-list-title {
		background: #fff;
		display: flex;
		justify-content: flex-end;
		padding: 20upx 40upx;
		font-size: $font-ssm;
	}

	.cart-list {
		height: 670upx;
		background: #fff;
		padding: 6upx;
	}

	.sub-title {
		font-size: $font-sm;
		color: $font-color-disabled;
	}

	.main-content {
		height: 100%;
		display: flex;
		flex-direction: column;

		.main-category-panel {
			display: flex;
			padding-right: 50rpx;
			overflow: hidden;
			position: relative;
			z-index: 13;
			background: #FFFFFF;

			.buttons {
				box-shadow: -1px 0px 20px 0px #d1d1d1;
				position: fixed;
				right: 0;
				background: #fff;
				text-align: center;
				font-size: $font-sm;
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 20rpx 10rpx;
				color: $font-color-base;

				.yticon {
					margin-top: 6rpx;
				}

				.icon-shang {
					color: $base-color;
				}
			}
		}

		.content {
			flex: 1;
		}
	}

	.main-categories {
		white-space: nowrap;
		font-size: $font-sm;
		position: relative;
		padding-bottom: 12rpx;

		.item {
			color: $font-color-dark;
			display: inline-block;
			width: 140rpx;
			text-align: center;
			font-weight: 400;

			&.current {
				color: $base-color;
				font-weight: 500;

				image {
					border-color: $base-color;
				}
			}
		}

		image {
			width: 86rpx;
			height: 86rpx;
			border-radius: 50%;
			border: 4rpx solid #fff;
		}
	}

	.loading_empty {
		height: 300rpx;
	}

	.sort-bar {
		font-size: $font-sm;
		color: $font-color-base;
		display: flex;
		align-items: center;
		padding: 20rpx;
		position: fixed;
		width: 600rpx;
		background: #FFFFFF;
		z-index: 11;

		.sort-bar-name {
			flex: 1;
		}

		.sort-bar-item {
			margin-right: 26rpx;

			&.active {
				color: $base-color;

				.yticon.active {
					color: $base-color;
				}
			}
		}

		.icon-wrap {
			display: flex;
			flex-direction: column;
			padding-left: 8rpx;
		}

		.yticon {
			font-size: 14rpx;
			color: $font-color-light;
		}
	}

	.sort-bar-empty {
		height: 90rpx;
	}

	.main-category-panel-all {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: 12;

		.shadow {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
			background: #000;
			opacity: 0;
			transition: 0.5s;
		}

		.main-categories {
			position: absolute;
			top: -700rpx;
			white-space: normal;
			background: #FFFFFF;
			padding: 20rpx 0;
			width: 100%;
			left: 0;
			transition: 0.4s;
			z-index: 2;
		}

		.item {
			margin-top: 10rpx;
			margin-bottom: 30rpx;
		}

		&.show {
			.shadow {
				opacity: 0.45;
			}
		}
	}
</style>

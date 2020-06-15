<template>
	<view class="container">
		<view class="content">
			<scroll-view scroll-y class="left-aside" :scroll-top="leftScrollTop">
				<view
					v-for="(item, index) in categoryList"
					:key="item.id"
					class="f-item"
					:class="{ active: item.id === currentId, before: item.id === currentBeforeId, after: item.id === currentAfterId }"
					@click="tabtap(item)"
				>
					<text>{{ item.name }}</text>
					<text class="sub_number" v-if="item.cart > 0">{{ item.cart }}</text>
				</view>
				<view class="space"></view>
			</scroll-view>
			<scroll-view scroll-with-animation scroll-y class="right-aside" @scroll="asideScroll" :scroll-top="tabScrollTop">
				<view v-for="(category, cindex) in slist" :key="category.id" class="s-list" :id="'main-' + category.id">
					<text class="s-item">{{ category.name }}</text>
					<view class="t-list">
						<view v-for="(item, index) in category.goods" :key="index" class="goodsList">
							<view class="weui-flex">
								<view class="image-wrapper" @click="navToGoodsPage(item)"><image :src="item.src" mode="aspectFill"></image></view>
								<view class="desc weui-flex__item">
									<view class="" @click="navToGoodsPage(item)">
										<text class="title">{{ item.title }}</text>
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
										<view class="sku_button" v-if="item.yuding"><text class="sku_btn" @click="navToGoodsPage(item)">查看</text></view>
										<view class="sku_button" v-else-if="item.hasSku">
											<text class="sub_number" v-if="goodsCartNumber[item.id] > 0">{{ goodsCartNumber[item.id] }}</text>
											<text class="sku_btn" @click="openSkus(item, category.pid)">选规格</text>
										</view>
										<uni-number-box
											v-else
											:min="0"
											:max="item.limit"
											:stock="item.stock"
											:disabled="!hasLogin"
											:keys="category.pid + '_' + item.id"
											:value="goodsCartNumber[item.id]"
											@disabledEvent="showLoginDialog"
											@change="bindChange"
										></uni-number-box>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="space"></view>
			</scroll-view>
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
					<view class="sku_prices_buttons__btn" v-if="skuCart[skuGoods.id]">
						<uni-number-box
							:min="0"
							:max="skuGoods.limit"
							:stock="skuGoods.stock"
							:keys="skuGoods.catPid + '_' + skuGoods.id"
							:value="skuCart[skuGoods.id][skuGoods.selectedSkuId]"
							@change="bindChangeSku"
						></uni-number-box>
					</view>
				</view>
			</view>
			<view class="uni-image-close" @click="closeSkuDialog()"><uni-icons type="clear" color="#fff" size="40" /></view>
		</uni-popup>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
import { getShopHome, editCart, cleanCart, getCartList } from '@/common/request.js';
import { updateCartNumber, navToGoodsItemPage, navToLoginPage, showLoginDialog, updateGoodsTags } from '@/common/functions.js';
export default {
	data() {
		return {
			isLoaded: false,
			shopinfo: {
				name: '',
				perCapita: 0,
				score: 0,
				monthSale: 0,
				deliveryMoney: 0,
				deliveryMin: 0
			},
			inited: false, //是否获得了店铺数据
			searchWord:"",
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
			//数据初始化,暂时只重新刷新购物车是最省资源
			setTimeout(() => {
				this.getShopInfo();
			}, 100);
		},
		categoryId(v) {
			//切换选中分类
			this.tabtap({ id: v });
		}
	},
	onLoad() {
		this.loadData();
	},
	onShow() {
		if (this.isLoaded) {
			console.log('category goods onShow');
			//重新加载页面数据
			//this.loadData();
			this.reBuildCartData();
		}
	},
	computed: {
		...mapState(['hasLogin', 'userInfo', 'stationId', 'shopId', 'categoryId'])
	},
	methods: {
		async loadData() {
			//加载店铺信息
			this.getShopInfo();
			this.searchKeyWords = uni.getStorageSync("shopSearchGoodsKeywords");
			this.getDefaultSearchWord();
		},
		getShopInfo() {
			//一并查询所有商品
			getShopHome({
				id: this.shopId,
				stationId: this.stationId,
				withGoods: 1,
				withSubCategory: 1
			}).then(
				res => {
					this.isLoaded = true;
					console.log(res);
					this.inited = true;
					this.shopinfo = res.info;
					this.slist = [];
					this.mainCategoryMap = {};
					if (res.goods_categories.length > 0) {
						//构造二级数据，如果没有，则为本身
						let cateMap = {};
						let catIndex = 0;
						res.goods_categories.forEach((ele, index) => {
							ele.cart = 0;
							//主分类索引
							this.mainCategoryMap[ele.id] = index;
							if (ele.children && ele.children.length > 0) {
								ele.children.forEach((ele2, ind2) => {
									ele2.pid = ele.id;
									ele2.goods = [];
									this.slist.push(ele2);
									cateMap[ele2.id] = catIndex;
									catIndex++;
								});
								//去掉子集，节省内存
								ele.children = [];
							} else {
								ele.pid = ele.id;
								ele.goods = [];
								this.slist.push(ele);
								cateMap[ele.id] = catIndex;
								catIndex++;
							}
						});
						//处理购物车信息
						let cartMap = {};
						let cartSumNunber = 0;
						this.cartInfo.dataList = [];
						//这里只为了兼容退出登录不干净
						if (res.carts.length > 0 && this.hasLogin) {
							res.carts.forEach(ct => {
								cartMap[ct.goods_id + '_' + ct.sku_id] = ct.amount;
								cartSumNunber += ct.amount;
							});
						}
						//更新购物车总数量
						updateCartNumber(cartSumNunber);
						//需要按分类来分组联动，这里的商品,优先二级
						if (res.goods.length > 0) {
							res.goods.map((ele, index) => {
								updateGoodsTags(ele);
								if (!this.skuCart[ele.id]) {
									this.skuCart[ele.id] = {};
								}
								//多规格
								if (ele.hasSku) {
									ele['cart'] = 0;
									ele.skus.map(sku => {
										let key = ele.id + '_' + sku.id;
										let cartI = 0;
										//多规格购物车数量统计
										ele['cart'] += cartI = this.skuCart[ele.id][sku.id] = cartMap[key] ? parseInt(cartMap[key]) : 0; //sku.cart?parseInt(sku.cart):0;
										this.goodsSkusMap[key] = {
											goods_id: ele.id,
											sku_id: sku.id,
											src: ele.src,
											price: sku.price,
											originPrice: sku.originPrice ? sku.originPrice : 0,
											title: ele.title,
											subName: sku.name.replace('&gt;', ' ')
											//categories:ele.categories,
											//cart:cartI
										};
									});
								} else {
									let key = ele.id + '_0';
									//单品购物车数量
									this.skuCart[ele.id][0] = ele['cart'] = cartMap[key] ? parseInt(cartMap[key]) : 0;
									this.goodsSkusMap[key] = {
										goods_id: ele.id,
										sku_id: 0,
										src: ele.src,
										price: ele.price,
										originPrice: ele.originPrice ? ele.originPrice : 0,
										title: ele.title,
										subName: ''
										//categories:ele.categories,
										//cart:ele.cart
									};
								}
								//多分类
								if (ele.categories) {
									ele.categories.map((cate, cindex) => {
										//判断是否存在与二级分类中
										if (cate.id in cateMap) {
											let cmIndex = cateMap[cate.id];
											this.slist[cmIndex].goods.push(ele);
											//计算大分类上的商品数量
											if (!this.cartNumber[this.slist[cmIndex].pid]) {
												this.cartNumber[this.slist[cmIndex].pid] = {};
											}
											this.cartNumber[this.slist[cmIndex].pid][ele.id] = ele.cart;
										}
									});
								}
								this.goodsCartNumber[ele.id] = ele.cart;
								//console.log(this.goodsCartNumber[ele.id])
							});
							//console.log("skuCart",this.skuCart)
						}

						this.categoryList = res.goods_categories;
						//默认第一个选中
						if (this.currentId < 1) {
							this.currentId = this.categoryList[0].id;
							if (this.categoryList.length > 1) {
								this.currentAfterId = this.categoryList[1].id;
							}
						}
						//统计所有主分类购物车数量
						this.getAllMainCategoryNumber();
					}
					this.$nextTick(() => {
						//延时计算联动效果
						this.calcSize();
						//从首页点击过来，默认选中
						console.log('默认选中分类：', this.categoryId);
						if (this.categoryId) {
							setTimeout(() => {
								this.tabtap({ id: this.categoryId });
							}, 200);
						}
					});
					//this.goodsList = res.goods;
					//计算高度
					//this.calculate();
					//this.changeCategory(0);
				},
				err => {
					this.$api.msg('加载店铺分类数据错误');
					this.isLoaded = true;
				}
			);
		},
		reBuildCartData() {
			getCartList({
				id: this.shopId,
				showLoading: false,
				stationId: this.stationId
			}).then(
				res => {
					//单个商品总数量
					this.goodsCartNumber = {};
					//2级清零
					this.skuCart = {};
					console.log('reBuildCartData');
					let cartMap = {};
					res.forEach(ct => {
						cartMap[ct.goods_id + '_' + ct.sku_id] = ct.amount;
						if (!this.goodsCartNumber[+ct.goods_id]) {
							this.goodsCartNumber[+ct.goods_id] = 0;
						}
						this.goodsCartNumber[+ct.goods_id] += ct.amount;
					});
					//所有商品走一遭,平铺多规格
					for (let key in this.goodsSkusMap) {
						let goods = this.goodsSkusMap[key];
						if (!this.skuCart[goods.goods_id]) {
							this.skuCart[goods.goods_id] = {};
						}
						this.skuCart[goods.goods_id][goods.sku_id] = cartMap[key] ? parseInt(cartMap[key]) : 0;
					}
					//更新分类对应商品数量
					for (let pid in this.cartNumber) {
						for (let g in this.cartNumber[pid]) {
							this.cartNumber[pid][g] = this.goodsCartNumber[g] ? parseInt(this.goodsCartNumber[g]) : 0;
						}
					}
					//统计所有主分类购物车数量
					this.getAllMainCategoryNumber();
				},
				err => {
					//单个商品总数量
					this.goodsCartNumber = {};
					//2级清零
					this.skuCart = {};
					for (let pid in this.cartNumber) {
						for (let g in this.cartNumber[pid]) {
							this.cartNumber[pid][g] = 0;
						}
					}
					//统计所有主分类购物车数量
					this.getAllMainCategoryNumber();
				}
			);
		},
		//一级分类点击
		tabtap(item) {
			this.currentId = item.id;
			let index = this.slist.findIndex(sitem => sitem.pid === item.id);
			this.tabScrollTop = this.slist[index].top + 4;
			this.cateIndex(this.currentId);
			console.log('clicked', this.tabScrollTop);
		},
		/**右侧分类滚动**/
		asideScroll(e) {
			let scrollTop = e.detail.scrollTop;
			let tabs = this.slist.filter(item => item.top <= scrollTop).reverse();
			if (tabs.length > 0) {
				this.currentId = tabs[0].pid;
				this.cateIndex(this.currentId);
			}
		},
		/**选中左侧分类**/
		cateIndex(id) {
			let index = this.categoryList.findIndex(sitem => sitem.id === id);
			if (index > 0) {
				this.currentBeforeId = this.categoryList[index - 1].id;
			}
			if (index < this.categoryList.length) {
				this.currentAfterId = this.categoryList[index + 1].id;
			}
			//没有作用，希望是滑动的分类小于4，能显示出来
			/* if(index < 4){
				this.leftScrollTop=1;
				console.log("leftScrollTop 0")
			} */
		},
		//计算右侧栏每个tab的高度等信息
		calcSize() {
			let h = 0;
			this.slist.forEach(item => {
				let view = uni.createSelectorQuery().select('#main-' + item.id);
				view.fields(
					{
						size: true
					},
					data => {
						if (data) {
							item.top = h;
							h += data.height;
							item.bottom = h;
						}
					}
				).exec();
			});
			this.sizeCalcState = true;
		},
		/**单商品增减数量**/
		bindChange(number, id) {
			console.log('单规格', number, id);
			let ginfo = id.split('_');
			let pid = parseInt(ginfo[0]);
			let gid = parseInt(ginfo[1]);
			let num = parseInt(number) * 1;
			//调用多规格方法
			this.changeCartDataList(pid, gid, 0, num);
		},
		/**多规格商品增减数量**/
		bindChangeSku(number, id) {
			console.log('多规格', number, id, this.skuGoods.selectedSkuId);
			let ginfo = id.split('_');
			let pid = parseInt(ginfo[0]);
			let gid = parseInt(ginfo[1]);
			let num = parseInt(number);
			//统一处理
			this.changeCartDataList(pid, gid, this.skuGoods.selectedSkuId, num);
		},
		/**统一处理修改购物车数量操作**/
		changeCartDataList(pid, gid, sid, num) {
			//得到当前选中的skuid，往下传递的num，应该是所有规格的总数
			if (!this.skuCart[gid]) {
				this.skuCart[gid] = {};
			}
			if (this.skuCart[gid][sid] == num) {
				console.log('多规格商品数量没有改变');
				return;
			}
			this.skuCart[gid][sid] = num;
			//console.log(this.skuCart);
			//计算所有规格的总数
			let gnumber = 0;
			for (let i in this.skuCart[gid]) {
				gnumber += this.skuCart[gid][i];
			}
			//商品的总数量
			this.changeGoodsCategoryCount(pid, gid, gnumber);
			//更新购物车栏数据
			this.updateCartInfo();
			//更新购物车数据库
			this.saveCartAmount(gid, sid, num);
		},
		/* 更新购物车栏数据 */
		updateCartInfo() {
			let gnumber = 0;
			for (let i in this.skuCart) {
				for (let b in this.skuCart[i]) {
					gnumber += this.skuCart[i][b];
				}
			}
			updateCartNumber(gnumber);
		},
		/**打开sku选择弹窗**/
		openSkus(item, pid) {
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
			console.log(skuMap);
			let nameMap = {};
			//所有存在的规格名称，例如：aabb，bbcc
			let nameHash = [];
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
			});
			//默认第一个规格的选中次数
			item['cart'] = 0;
			item['catPid'] = pid;
			item['skuNameIds'] = nameMap;
			item['skuNameMap'] = skuMap;
			item['skuNameHash'] = nameHash;
			this.skuGoods = item;
			//默认选中第一个
			this.selectSku(0, 0);
			//延时打开
			this.$nextTick(() => {
				this.$refs['showsku'].open();
			});
		},
		/**单商品和多规格商品统一更改数量统计**/
		changeGoodsCategoryCount(pid, gid, number) {
			if (!this.cartNumber[pid]) {
				this.cartNumber[pid] = {};
			}
			this.cartNumber[pid][gid] = number;
			this.getMainCategoryNumber(pid);
			//商品总量
			this.goodsCartNumber[gid] = number;
			console.log('goodsCartNumber', this.goodsCartNumber[gid]);
		},
		//更新购物车数据到服务器
		saveCartAmount(gid, sku, number) {
			let goods = this.goodsSkusMap[gid + '_' + sku];
			console.log('saveCartAmount', gid, sku, number);
			editCart({
				id: this.shopId,
				stationId: this.stationId,
				goods_id: gid,
				sku_id: sku,
				price: goods.price,
				title: goods.title,
				subTitle: goods.subName,
				src: goods.src,
				checked: 1,
				amount: number
			}).then(res => {
				console.log(res);
			});
		},
		/**计算主分类总数量**/
		getMainCategoryNumber(pid) {
			let sum = 0;
			//更新大分类数量
			for (let i in this.cartNumber[pid]) {
				sum += this.cartNumber[pid][i];
			}
			let index = this.mainCategoryMap[pid];
			//let index = this.categoryList.findIndex(sitem => sitem.id === pid);
			if (index < 0) {
				return;
			}
			this.categoryList[index]['cart'] = sum;
		},
		/**计算主所有分类总数量**/
		getAllMainCategoryNumber() {
			for (let pid in this.cartNumber) {
				this.getMainCategoryNumber(pid);
			}
		},
		/**关闭sku选择弹窗**/
		closeSkuDialog() {
			this.$refs['showsku'].close();
		},
		/**规格选择**/
		selectSku(index, index2) {
			console.log('selectSku');
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
			var webView = this.$mp.page.$getAppWebview();
			var tn = webView.getStyle().titleNView;
			tn.searchInput.placeholder = this.searchWord;

			webView.setStyle({
				titleNView: tn
			});
			// #endif
			//10秒换一个
			setTimeout(()=>{
				this.getDefaultSearchWord();
			},10000)
		}
	},
	// #ifndef MP
	// 标题栏input搜索框点击
	onNavigationBarSearchInputClicked: async function(e) {
		//this.$api.msg('点击了搜索框');
		uni.navigateTo({
			url:`/pages/search/search?key=${this.searchWord}`
		})
	},
	// #endif
};
</script>

<style lang="scss">
page,
.container {
	height: 100%;
	background-color: #f8f8f8;
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
.content {
	display: flex;
	background-color: #f8f8f8;
	height: 100%;
	/* #ifdef MP */
	padding-top: calc(var(--status-bar-height) + 50upx);
	/* #endif */
}
.left-aside {
	flex-shrink: 0;
	width: 160upx;
	height: 100%;
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
	}
	&.before {
		border-radius: 0 0 10px 0;
	}
	&.after {
		border-radius: 0 10px 0 0;
	}
}

.right-aside {
	flex: 1;
	overflow: hidden;
	padding: 2upx 18upx 0;
	height: 100%;
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
		border-radius: 4%;
		margin-bottom: 8upx;
		.weui-flex {
			align-items: flex-start;
		}
		.sub-catename {
			padding-bottom: 10upx;
		}
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
	.sku_btn {
		background: $btn-color-light;
		color: $font-color-white;
		padding: 12upx 24upx 12upx;
		border-radius: 30upx;
		display: inline-block;
		font-size: $font-ssm;
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
</style>

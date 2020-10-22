<template>
	<view class="container">
		<!-- 空白页 -->
		<view v-if="!hasLogin || empty === true" class="empty">
			<image src="/static/emptyCart.jpg" mode="aspectFit"></image>
			<view class="empty-tips">
				<text>空空如也</text>
				<navigator v-if="hasLogin" class="navigator" url="/pages/index/fruit" open-type="switchTab">随便逛逛></navigator>
				<view v-else class="navigator" @click="navToLoginPage">去登陆></view>
			</view>
		</view>
		<view v-else>
			<!-- 列表 -->
			<view class="cart-list">
				<block v-for="(item, index) in cartList" :key="index">
					<view class="goodsList b-b" v-if="item.cart > 0">
						<view class="weui-flex flex-start">
							<view class="weui-flex-check">
								<view class="yticon icon-xuanzhong2 checkbox" :class="{ checked: item.checked }" @click="check('item', index)"></view>
								<view class="image-wrapper" @click="navToGoodsPage(item)">
									<image :src="item.src" :class="[item.loaded]" mode="aspectFill" lazy-load @load="onImageLoad('cartList', index)"
									 @error="onImageError('cartList', index)"></image>
								</view>
							</view>
							<view class="desc">
								<view class="desc-name">
									<view class="" @click="navToGoodsPage(item)">
										<text class="title">{{ item.title }}</text>
									</view>
									<view class="weui-flex desc-content">
										<view class="weui-flex__item">
											<view class="">
												<text>{{ item.subName }}</text>
											</view>
											<view class="" v-if="item.cutPrice > 0">
												<text class="saledPrice">
													<text class="unit">比加入时便宜</text>
													<text class="price emphasis">{{ item.cutPrice }}</text>
												</text>
											</view>
											<view class="tags" v-if="item.tags && item.tags.length > 0">
												<text v-for="(tag,tagIndex) in item.tags" :key="tagIndex" class="tag" :class="[tag.type]">{{tag.text}}</text>
											</view>
											<view class="buttons">
												<view>
													<text class="price">{{ item.price }}</text>
													<text class="price del m-l" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
												</view>
											</view>
										</view>
										<uni-number-box :min="0" :zeroNotice="!0" :max="item.limit" :stock="item.stock" :keys="item.goods_id + '_' + item.sku_id"
										 :value="item.cart" @change="bindChangeCart"></uni-number-box>
									</view>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
			<block v-if="notEnoughCartList.length > 0">
				<view class="lose-notice b-b"><text>因配送范围、库存原因而导致失效的商品</text></view>
				<view class="cart-list lose">
					<block v-for="(item, index) in notEnoughCartList" :key="index">
						<view class="goodsList b-b">
							<view class="weui-flex">
								<view class="weui-flex-check"><text>失效</text></view>
								<view class="desc">
									<view class="image-wrapper" @click="navToGoodsPage(item)">
										<image :src="item.src" :class="[item.loaded]" mode="aspectFill" lazy-load @load="onImageLoad('notEnoughCartList', index)"
										 @error="onImageError('notEnoughCartList', index)"></image>
									</view>
									<view class="desc-name">
										<view class="" @click="navToGoodsPage(item)">
											<text class="title">{{ item.title }}</text>
										</view>
										<view class="" v-if="item.subName && item.subName.length > 0">
											<text>{{ item.subName }}</text>
										</view>
										<view class="tags" v-if="item.tags && item.tags.length > 0">
											<text v-for="(tag, tagIndex) in item.tags" :key="tagIndex" class="tag warning">{{ tag }}</text>
										</view>
										<view class="buttons">
											<view>
												<text class="price">{{ item.price }}</text>
												<text class="price del m-l" v-if="item.originPrice > 0">{{ item.originPrice }}</text>
											</view>
										</view>
										<view class="notice">
											{{item.notice}}
										</view>
									</view>
								</view>
								<view class="">
									<text>{{item.cart}}</text>
								</view>
							</view>
						</view>
					</block>
				</view>
				<view class="lose-buttons">
					<button class="action-btn" @click.stop="cleanLoseGoods()">一键移除失效商品</button>
				</view>
			</block>
			<!-- 底部菜单栏 -->
			<view class="action-section" v-show="canSetllement">
				<view class="checkbox_area">
					<text class="yticon icon-xuanzhong2 checkbox" :class="{ checked: allChecked }" @click="check('all')"></text>
					<!-- <image :src="allChecked ? '/static/selected2.png' : '/static/select.png'" mode="aspectFit" @click="check('all')"></image> -->
					<view class="clear-btn2" v-show="allChecked" @click="clearCart">清空</view>
				</view>
				<view class="total-box">
					<text class="price emphasis">{{ total }}</text>
					<text class="coupon">
						已优惠
						<text>{{ discount }}</text>
						元
					</text>
				</view>
				<button type="primary" class="no-border confirm-btn" :class="{ disabled: !isChecked }" @click="createOrder">去结算</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import {
		editCart,
		cleanCart,
		selectCart,
		getCartList,
		settlementCart
	} from '@/common/request.js';
	import {
		navToGoodsItemPage,
		navToLoginPage,
		navToCreateOrder,
		updateGoodsTags
	} from '@/common/functions.js';
	import tabbarMixin from './mixin/tabbar'
	export default {
		mixins: [tabbarMixin],
		data() {
			return {
				isLoaded: false,
				isSubmit: false,
				canSetllement: false,
				isChecked: false,
				total: 0, //总价格
				discount: 0, //总优惠
				allChecked: false, //全选状态  true|false
				empty: false, //空白页现实  true|false
				skuCart: {},
				cartList: [],
				notEnoughCartList: []
			};
		},
		onLoad() {
			console.log('cart onLoad');
			uni.$on('refreshCart', () => {
				this.loadData();
			});
		},
		onShow() {
			this.loadData();
		},
		//下拉刷新,不会更新底部附近的店铺,app没效果
		onPullDownRefresh() {
			console.log('刷新整页');
			uni.stopPullDownRefresh();
			this.loadData();
		},
		watch: {
			//显示空白页
			cartList(e) {
				let empty = e.length === 0 && this.notEnoughCartList.length == 0 ? true : false;
				if (this.empty !== empty) {
					this.empty = empty;
				}
			},
			hasLogin() {
				console.log('watch 登录状态改变,刷新当前页面');
				setTimeout(() => {
					this.loadData(true);
				}, 100);
			}
		},
		computed: {
			...mapState(['hasLogin', 'shopId', 'stationId'])
		},
		methods: {
			//请求数据
			async loadData(isHideLoading) {
				isHideLoading = isHideLoading || false;
				getCartList({
					id: this.shopId,
					stationId: this.stationId,
					showLoading: !isHideLoading,
					opt: 'full'
				}).then(
					res => {
						this.canSetllement = false;
						this.isLoaded = true;
						this.allChecked = false;
						let goodsSkusMap = {};
						res.goods.map(ele => {
							updateGoodsTags(ele, true);
							if (!this.skuCart[ele.id]) {
								this.skuCart[ele.id] = {};
							}
							let id = ele.id;
							//多规格
							if (ele.hasSku) {
								ele.skus.map(sku => {
									let key = id + '_' + sku.id;
									let item = { ...ele
									};
									item = Object.assign(item, sku, {
										key: key,
										goods_id: ele.id,
										sku_id: sku.id,
										subName: sku.name.replace('&gt;', ' '),
									});
									if (ele.miaosha && sku.id == ele.miaosha.sku_id) {
										item = Object.assign(item, {
											...ele.miaosha
										})
									}
									goodsSkusMap[key] = item;
								});
							} else {
								let key = ele.id + '_0';
								//单品购物车数量
								goodsSkusMap[key] = Object.assign(ele, {
									key: key,
									goods_id: ele.id,
									sku_id: 0,
									subName: ''
								});
							}
						});
						this.cartList = [];
						this.notEnoughCartList = [];
						let number = 0;
						res.cart.map(ct => {
							//加入到购物车数据列表
							let key = ct.goods_id + '_' + ct.sku_id;
							let goods = goodsSkusMap[key];
							if (goods) {
								goods['cart'] = ct.amount;
								//必须保证库存足够
								goods['disabled'] = ct.amount > goods.stock;
								goods['cutPrice'] = 0;
								goods['cartId'] = ct._id;
								goods['loaded'] = '';
								if (ct.price > 0 && ct.price > goods.price) {
									goods['cutPrice'] = (ct.price - goods.price).toFixed(2);
								}
								if (goods.disabled) {
									goods["notice"] = "库存不足";
									goods['checked'] = ct.checked;
									this.notEnoughCartList.push(goods);
								} else {
									//默认选中
									goods['checked'] = ct.checked && !goods.disabled;
									this.cartList.push(goods);
								}
								number += ct.amount;
							} else {
								ct["notice"] = "商品已下架";
								ct['cartId'] = ct._id;
								ct['cart'] = ct.amount;
								ct["subName"] = ct.subTitle;
								this.notEnoughCartList.push(ct);
							}
						});

						//console.log(this.cartList);
						//计算购物车总金额
						this.calcTotal();
						if (this.notEnoughCartList.length > 0) {
							let cartIds = [];
							this.notEnoughCartList.map(m => {
								if (m.checked) {
									cartIds.push(m.cartId);
								}
							});
							//批量取消选择
							if (cartIds.length > 0) {
								console.log(cartIds);
								selectCart({
									id: this.shopId,
									stationId: this.stationId,
									checked: false,
									cartIds: cartIds.join(',')
								}).then(res => {
									console.log(res);
								});
							}
						}
						if (this.cartList.length > 0) {
							this.canSetllement = true;
						}
					},
					err => {
						//没有数据
						this.empty = true;
						this.isLoaded = true;
						//购物车总数量
						this.updateCartNumber(0);
					}
				);
			},
			//监听image加载完成
			onImageLoad(key, index) {
				this.$set(this[key][index], 'loaded', 'loaded');
			},
			//监听image加载失败
			onImageError(key, index) {
				this[key][index].image = '/static/errorImage.jpg';
			},
			/**更新购物车数据列表**/
			updateCartDataList(id, sid, numb) {
				let key = id + '_' + sid;
				//判断是否已经存在
				let index = this.cartList.findIndex(sitem => sitem.key == key);
				let goods = this.cartList[index];
				if (numb < 1) {
					console.log('删除购物车data列表', index);
					//删除
					//this.cartList.splice(index, 1);
					console.log('剩余', this.cartList);
					editCart({
						id: this.shopId,
						stationId: this.stationId,
						goods_id: id,
						sku_id: sid,
						amount: numb
					}).then(res => {
						console.log(res);
					});
					this.cartList[index].cart = numb;
				} else {
					console.log('更新购物车data列表', index);
					this.cartList[index].cart = numb;
					editCart({
						id: this.shopId,
						stationId: this.stationId,
						goods_id: id,
						sku_id: sid,
						checked: goods.checked,
						amount: numb
					}).then(res => {
						console.log(res);
					});
				}
			},
			/**购物车商品增减数量**/
			bindChangeCart(number, id) {
				console.log('购物车', number, id);
				let ginfo = id.split('_');
				//商品id
				let gid = parseInt(ginfo[0]);
				//型号id
				let sid = parseInt(ginfo[1]);
				//数量
				let num = parseInt(number);
				this.updateCartDataList(gid, sid, num);
				this.calcTotal();
			},
			//选中状态处理
			check(type, index) {
				if (type === 'item') {
					this.cartList[index].checked = !this.cartList[index].checked;
					console.log(index);
					let goods = this.cartList[index];
					editCart({
						id: this.shopId,
						stationId: this.stationId,
						goods_id: goods.goods_id,
						sku_id: goods.sku_id,
						price: goods.price,
						src: goods.src,
						checked: this.cartList[index].checked,
						amount: goods.cart
					}).then(res => {
						console.log(res);
					});
				} else {
					const checked = !this.allChecked;
					const list = this.cartList;
					let cartIds = [];
					list.forEach(item => {
						if (item.checked !== checked) {
							cartIds.push(item.cartId);
						}
						item.checked = checked;
					});
					this.allChecked = checked;
					//保存数据可以购买的商品
					selectCart({
						id: this.shopId,
						stationId: this.stationId,
						checked: checked,
						cartIds: cartIds.join(',')
					}).then(res => {
						console.log(res);
					});
				}
				this.calcTotal(type);
			},
			//删除
			deleteCartItem(index) {
				let list = this.cartList;
				let row = list[index];
				let id = row.id;

				this.cartList.splice(index, 1);
				this.calcTotal();
				uni.hideLoading();
			},
			//清空
			clearCart() {
				uni.showModal({
					content: '清空购物车？',
					success: e => {
						if (e.confirm) {
							this.cleanAllCart();
						}
					}
				});
			},
			/**清空购物车数据**/
			cleanAllCart() {
				cleanCart({
					id: this.shopId,
					stationId: this.stationId
				}).then(res => {
					console.log(res);
				});
				//清空临时数据
				this.cartList = [];
				//失效商品
				this.notEnoughCartList = [];
				this.calcTotal();
			},
			//计算总价
			calcTotal() {
				let list = this.cartList;
				if (list.length === 0) {
					this.empty = true;
					this.updateCartNumber(0);
					return;
				}
				this.isChecked = false;
				let total = 0;
				let number = 0;
				let discount = 0;
				let checked = true;
				let cartMap = {};
				list.forEach(item => {
					if (item.checked === true) {
						total += item.price * item.cart;
						//总优惠
						if (item.originPrice && item.originPrice > item.price) {
							discount += (item.originPrice - item.price) * item.cart;
						}
						this.isChecked = true;
					} else if (checked === true) {
						checked = false;
					}
					number += item.cart;
					cartMap[item.goods_id + "_" + (+item.sku_id)] = item.cart;
				});
				this.allChecked = checked;
				this.total = Number(total.toFixed(2));
				this.discount = Number(discount.toFixed(2));
				//更新购物车总数量
				this.setStateAttr({cartMap});
				console.log("cart", this.cartMap);
				setTimeout(() => {
					this.updateCartNumber(number);
				}, 100)
			},
			cleanLoseGoods() {
				uni.showModal({
					content: '是否确定移除？',
					success: e => {
						if (e.confirm) {
							let cartIds = this.notEnoughCartList.map(m => {
								return m.cartId;
							});
							console.log(this.notEnoughCartList)
							//批量取消选择
							if (cartIds.length > 0) {
								console.log("移除失效商品", cartIds);
								cleanCart({
									id: this.shopId,
									stationId: this.stationId,
									cartIds: cartIds.join(',')
								}).then(res => {
									console.log(res);
								});
							}
							this.notEnoughCartList = [];
						}
					}
				});

			},
			navToGoodsPage(item) {
				item.id = item.goods_id;
				navToGoodsItemPage(item);
			},
			navToLoginPage() {
				navToLoginPage();
			},
			//创建订单
			createOrder() {
				if (this.isSubmit) {
					return;
				}
				if (this.isChecked) {
					this.isSubmit = true;
					//批量设置结算属性
					let cartIds = [];
					this.cartList.map(e => {
						if (e.checked) {
							cartIds.push(e.cartId);
						}
					});
					uni.setStorage({
						key: "settlementCartsIds",
						data: {
							shopid: this.shopId,
							cartids: cartIds
						},
						success: () => {
							navToCreateOrder();
							this.isSubmit = false;
						}
					})
					/* settlementCart({
						id: this.shopId,
						stationId: this.stationId,
						cartIds: cartIds.join(',')
					}).then(res=>{
						navToCreateOrder();
					}) */
				}
			},
			//刷新数据
			refreshList() {
				this.loadData();
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #f5f5f5;
	}

	.container {
		padding-bottom: calc(80upx + var(--window-bottom));
		//#ifdef APP-PLUS
		padding-bottom: calc(130upx + var(--window-bottom));
		//#endif
		//#ifdef MP
		padding-bottom: calc(150upx + var(--window-bottom));

		//#endif
		/* 空白页 */
		.empty {
			position: fixed;
			left: 0;
			top: 0;
			width: 100%;
			height: 100vh;
			padding-bottom: 100upx;
			display: flex;
			justify-content: center;
			flex-direction: column;
			align-items: center;
			background: #fff;

			image {
				width: 240upx;
				height: 160upx;
				margin-bottom: 30upx;
			}

			.empty-tips {
				display: flex;
				font-size: $font-sm + 2upx;
				color: $font-color-disabled;

				.navigator {
					color: $uni-color-primary;
					margin-left: 16upx;
				}
			}
		}
	}

	.weui-flex {
		display: flex;
		align-items: center;
	}

	.flex-start {
		align-items: start;
	}

	.weui-flex__item {
		flex: 1;
	}

	.cart-list {
		flex: 1;
		overflow: hidden;
		height: 100%;
		font-size: $font-base;

		.space {
			padding-top: var(--window-bottom);
		}

		.s-item {
			display: flex;
			align-items: center;
			height: 70upx;
			font-size: 28upx;
			color: $font-color-dark;
		}

		.goodsList {
			position: relative;
			background: #ffffff;
			padding: 20upx 20upx 20upx;

			.sub-catename {
				padding-bottom: 10upx;
			}

			&.disabled {
				.checkbox {
					display: none;
				}
			}
		}

		.image-wrapper {
			width: 120upx;
			height: 120upx;
			border-radius: 4%;
			overflow: hidden;
			margin-right: 22upx;
			flex-shrink: 0;

			image {
				width: 100%;
				height: 100%;
				opacity: 1;
			}
		}

		.weui-flex-check {
			display: flex;
			align-items: center;
		}

		.checkbox {
			z-index: 8;
			font-size: 44upx;
			line-height: 1;
			padding: 4upx;
			border-radius: 50px;
			margin-right: 10upx;
		}

		.desc {
			flex: 1;
			font-size: $font-sm;
			color: $font-color-light;
			display: flex;
			align-items: flex-start;

			.desc-name {
				flex: 1;
			}

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

		.notice {
			color: $font-color-warning;
		}

		.b-b:after {
			left: 80upx;
		}

		&.lose {
			color: $font-color-disabled;

			.weui-flex-check {
				font-size: $font-sm;
				padding-right: 10upx;
			}

			.desc {
				.title {
					color: $font-color-disabled;
				}
			}

			.price {
				color: $font-color-disabled;
			}
		}
	}

	.m-l {
		margin-left: 10upx;
	}

	/* 底部栏 */
	.action-section {
		position: fixed;
		left: 30upx;
		bottom: calc(30upx + var(--window-bottom));
		z-index: 95;
		display: flex;
		align-items: center;
		width: 690upx;
		height: 100upx;
		padding: 0 30upx;
		background: rgba(255, 255, 255, 0.9);
		box-shadow: 0 0 20upx 0 rgba(0, 0, 0, 0.5);
		border-radius: 16upx;

		.checkbox_area {
			/* overflow: hidden;
		width: 172upx;
		font-size: $font-base; */
			display: flex;
			font-size: $font-base;
			background-color: $font-color-disabled;
			border-radius: 50px;
			align-items: center;
			line-height: 1;
		}

		.checkbox {
			font-size: 52upx;
			background-color: #FFFFFF;
			border-radius: 50%;
			margin: 2upx;
		}

		.clear-btn2 {
			color: #fff;
			padding: 0 24upx 0 14upx;
			font-size: $font-base;
			transition: 0.2s;
		}

		.clear-btn {
			position: absolute;
			left: 26upx;
			top: 0;
			z-index: 4;
			width: 0;
			height: 52upx;
			line-height: 52upx;
			padding-left: 38upx;
			font-size: $font-base;
			color: #fff;
			background: $font-color-disabled;
			border-radius: 0 50px 50px 0;
			opacity: 0;
			transition: 0.2s;

			&.show {
				opacity: 1;
				width: 120upx;
			}
		}

		.total-box {
			flex: 1;
			display: flex;
			flex-direction: column;
			text-align: right;
			padding-right: 40upx;

			.coupon {
				font-size: $font-sm;
				color: $font-color-light;

				text {
					color: $font-color-dark;
				}
			}
		}

		.confirm-btn {
			padding: 0 56upx;
			margin: 0;
			border-radius: 100px;
			height: 76upx;
			line-height: 76upx;
			font-size: $font-base + 2upx;
			background: $base-color;
			transition: 0.4s;

			&.disabled {
				background-color: $font-color-disabled;
			}
		}
	}

	/* 复选框选中状态 */
	.action-section .checkbox.checked,
	.cart-item .checkbox.checked {
		color: $base-color;
	}

	.lose-notice {
		font-size: $font-sm;
		text-align: center;
		margin-top: 20upx;
		background-color: #fff;
		padding: 18upx 8upx;
		position: relative;
	}

	.lose-buttons {
		text-align: center;
		padding: 20upx;
		background: #fff;
	}

	.action-btn {
		background: #fff;
		color: $base-color;
		display: inline-block;
		height: 60upx;
		margin: 0;
		padding: 0 30upx;
		line-height: 60upx;
		font-size: $font-sm + 2upx;
	}
</style>

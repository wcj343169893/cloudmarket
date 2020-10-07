<template>
	<view class="container">
		<view class="header">
			<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
			<view class="header_title">
				<text>{{ stateTip }}</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		<view class="section message_notice m-t">
			<text>{{message}}</text>
			<button type="default" class="action-btn recom">去开启</button>
		</view>
		<view class="section m-t">
			<view class="sub-title">
				<text>{{ stateContent }}</text>
				<!-- 付尾款提示 ,只有付了定金，才能进入此详细页面-->
				<view v-if="isYuding && info.state == 0">
					<text>应付尾款：</text>
					<text class="price">{{ (info.yuding ? info.yuding.finishPaymentPrice : '') | toFixed }}</text>
					<text class="m-l">{{ (info.yuding ? info.yuding.finalPaymentBeginTime : '') | dateFormat('yyyy-MM-dd hh:mm:ss') }}开始</text>
				</view>
				<!-- 退款进度 -->
				<view class="apply-list" v-if="info.cancelApply">
					<view class="title">
						<text>取消进度：</text>
					</view>
					<view class="apply-list-content">
						<view v-for="(ca, iCa) in info.cancelApply" :key="iCa" class="weui-flex">
							<text>{{ ca.message }}</text>
							<text>{{ ca.time | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="buttons">
				<block v-if="info.state == 0">
					<block v-if="isYuding"><button class="action-btn disabled">去支付尾款</button></block>
				</block>
				<block v-else-if="info.state == 1"><button type="default" class="action-btn" @click="pusheDelivery">催一催</button></block>
				<block v-else-if="info.state == 2"><button type="default" class="action-btn" @click="confirmOrder">确定收货</button></block>
				<block v-else-if="info.state == 3"><button type="default" class="action-btn recom" @click="evaluateOrder">评价一下</button></block>
				<block v-else>
					<button type="default" class="action-btn" @click="deleteOrder">删除订单</button>
					<button type="default" class="action-btn" @click="buyAgain()">再次购买</button>
				</block>
			</view>
		</view>
		<view class="section ab m-t">
			<view class="weui-flex address ">
				<view @click="navToLocation(info.shop)">
					<text>{{ info.shop.name }}</text>
				</view>
				<view class="" @click="tel(info.shop.phone)" v-if="info.shop.phone">
					<text class="yticon icon-dianhua-copy"></text>
					<text class="m-l">联系</text>
				</view>
			</view>
			<view class="weui-flex address b-b" @click="navToLocation(info.shop)">
				<text>{{ info.shop.address }}</text>
				<text class="yticon icon-you"></text>
			</view>
			<view class="weui-flex address b-b" v-if="info.deliveryHour">
				<view><text>预约时间</text></view>
				<view class="content">
					<view>
						<text>{{ info.deliveryHour.name }}</text>
						<text class="m-l">{{ info.deliveryHour.time }}</text>
					</view>
				</view>
			</view>
			<block v-if="info.deliveryType == 'selfRaising'">
				<view class="weui-flex address b-b" @click="zoomCode(info.deliveryHour)" v-if="info.deliveryHour">
					<view class="warning">
						<text>提货码:</text>
						<text>{{ info.deliveryHour.number }}</text>
					</view>
					<view class="content">
						<view class="warning">
							<text>密码:</text>
							<text>{{ info.deliveryHour.password }}</text>
						</view>
					</view>
					<text class="yticon icon-you"></text>
				</view>
			</block>
			<view class="weui-flex address b-b" v-else-if="info.address">
				<view><text>收货地址</text></view>
				<view class="content">
					<view>
						<text>{{ info.address.name }}</text>
						<text class="m-l">{{ info.address.mobile }}</text>
					</view>
					<text>{{ info.address.addressName }}</text>
				</view>
			</view>
			<view class="weui-flex">
				<view><text>备注</text></view>
				<view>
					<text>{{ info.remark || '无' }}</text>
				</view>
			</view>
		</view>
		<view class="m-t"></view>

		<view class="cart-list ">
			<block v-for="(item, index) in goodsList" :key="index">
				<view class="goodsList b-b" v-if="item.amount > 0" @click="navToGoodsPage(item)">
					<view class="weui-flex">
						<view class="weui-flex start">
							<view class="weui-flex-check">
								<view class="image-wrapper">
									<image :src="item.src" :class="[item.loaded]" mode="aspectFill" lazy-load @load="onImageLoad('goodsList', index)"
									 @error="onImageError('goodsList', index)"></image>
								</view>
							</view>
							<view class="desc weui-flex__item">
								<view class="weui-flex">
									<text class="title weui-flex__item">{{ item.title }}</text>
									<text class="price warning">{{ (item.price * item.amount) | toFixed }}</text>
								</view>
								<view>
									<text>{{ item.name }}</text>
								</view>
								<view class=" prices">
									<view>
										<text>{{ priceTitle }}:</text>
										<text class="price">{{ item.price | toFixed }}</text>
										<text>数量:</text>
										<text>{{ item.amount }}</text>
										<block v-if="item.refundAmount > 0">
											<text class="m-l">已退:</text>
											<text>{{item.refundAmount}}</text>
										</block>
									</view>
								</view>
								<view class="buttons">
									<button type="default" v-if="info.state > 0" class="action-btn" :class="{disabled:!item.canRefund}"
									 @click.stop="refundOrder(item,index)">申请退款</button>
									<block v-if="isYuding"></block>
									<block v-else><button type="default" class="action-btn" @click.stop="buyAgain(item)">加购物车</button></block>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
			<view class="more-btn b-b" v-if="moreGoodsCount > 0" @click="showAllGoods">
				<text>还有{{ moreGoodsCount }}种商品</text>
				<text class="yticon icon-jiantour-copy"></text>
			</view>
			<view class="section ab">
				<block v-if="isYuding">
					<view class="weui-flex">
						<text>阶段1：定金</text>
						<text class="price">{{ info.yuding.price }}</text>
					</view>
					<block v-if="info.yuding.payInfo">
						<view class="weui-flex">
							<text class="m-l2">支付方式</text>
							<text>{{ info.yuding.payInfo.name }}</text>
						</view>
						<view class="weui-flex">
							<text class="m-l2">支付时间</text>
							<text>{{ (info.yuding && info.yuding.payInfo ? info.yuding.payInfo.time : '') | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
						</view>
					</block>

					<view class="weui-flex b-b">
						<text>阶段2：尾款</text>
						<text class="price">{{ (info.yuding ? info.yuding.finishPaymentPrice : '') | toFixed }}</text>
					</view>
				</block>
				<block v-else>
					<view class="weui-flex">
						<text>商品金额</text>
						<text class="price">{{ (info.totalMoney + info.totalDiscount) | toFixed }}</text>
					</view>
				</block>
				<view class="weui-flex">
					<view><text>运费</text></view>
					<view>
						<text class="price">{{ info.freight | toFixed }}</text>
					</view>
				</view>
				<view class="weui-flex">
					<view><text>优惠金额</text></view>
					<view>
						<text>-</text>
						<text class="price">{{ info.totalDiscount | toFixed }}</text>
					</view>
				</view>
				<view class="weui-flex">
					<view><text>应付金额</text></view>
					<text class="price warning">{{ (info.totalMoney + info.freight) | toFixed }}</text>
				</view>
				<view class="weui-flex" v-if="info.payInfo">
					<view><text>实付金额</text></view>
					<text class="price warning">{{ realPayMoney | toFixed }}</text>
				</view>
			</view>
		</view>
		<view class="m-t"></view>
		<view class="section ab">
			<view class="weui-flex">
				<view><text>订单编号</text></view>
				<view>
					<text>{{ info.id }}</text>
				</view>
			</view>
			<!-- <view class="weui-flex">
				<view><text>支付编号</text></view>
				<view>
					<text>{{ info._id }}</text>
				</view>
			</view> -->
			<view class="weui-flex">
				<view><text>下单时间</text></view>
				<view>
					<text>{{ info.created | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
				</view>
			</view>
			<block v-if="info.payInfo">
				<view class="weui-flex">
					<view><text>支付方式</text></view>
					<view>
						<text>{{ info.payInfo.name }}</text>
					</view>
				</view>
				<view class="weui-flex">
					<view><text>支付时间</text></view>
					<view>
						<text>{{ (info.payInfo ? info.payInfo.time : '') | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
					</view>
				</view>
			</block>
		</view>
		<uni-popup ref="showCode" type="center">
			<view class="code-section" v-if="info.deliveryHour">
				<tki-qrcode v-if="qrcode.ifShow" cid="qrcode1" ref="qrcode" :val="qrcode.val" :size="qrcode.size" :unit="qrcode.unit"
				 :background="qrcode.background" :foreground="qrcode.foreground" :pdground="qrcode.pdground" :icon="qrcode.icon"
				 :iconSize="qrcode.iconsize" :lv="qrcode.lv" :onval="qrcode.onval" :loadMake="qrcode.loadMake" :usingComponents="true"
				 @result="qrR" />

				<view class="warning">
					<text>{{ info.deliveryHour.number }}</text>
				</view>
				<view class="warning">
					<text>{{ info.deliveryHour.password }}</text>
				</view>
				<view><text>仅提供给店员提货扫码</text></view>
				<view><text>请勿泄露给他人</text></view>
			</view>
		</uni-popup>
		<uni-popup ref="showRefund" type="center">
			<view class="refund">
				<view class="section ab">
					<view class="weui-flex b-b">
						<view><text>退款数量</text></view>
						<view>
							<uni-number-box v-if="refundItem.refundMax>1" :min="1" :max="refundItem.refundMax" :stock="refundItem.refundMax"
							 maxStockNotice="抱歉,最多选择" :keys="refundItem._id" :value="1" @change="changeRefundNumber"></uni-number-box>
							<text v-else class="refund-amount">1</text>
						</view>
					</view>
				</view>
				<mix-list-select title="退款类型" :options="refundTypes" border="b-b" :defaultOption="'1'" @eventClick="changeRefundType"></mix-list-select>
				<mix-list-select title="退款原因" :options="refundReasons" border="b-b" :defaultOption="'1'" @eventClick="changeRefundReason"></mix-list-select>
				<mix-list-input title="问题描述" :defContent="refundItem.reason" placeholder="请简要描述" @change="changeRefundContent"></mix-list-input>
				<view class="mix-list-cell" @click="uploadRefundImgs()">
					<text class="cell-tit clamp">上传图片</text>
					<view class="cell-tip">选择图片</view>
					<text class="cell-more yticon icon-you"></text>
				</view>
				<view class="imgs b-b">
					<scroll-view scroll-x class="h-list" v-if="refundImgs && refundImgs.length > 0">
						<view v-for="(item, index) in refundImgs" :key="index" class="h-list-image" @click="replaceImg(index)">
							<image :src="item" mode="aspectFill"></image>
						</view>
					</scroll-view>
				</view>
				<view class="buttons">
					<button type="default" class="action-btn" @click="closedRefund">取消</button>
					<button type="default" class="action-btn recom" @click="submitRefund">确定</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		orders,
		addManyCart
	} from '@/common/request.js';
	import {
		navToGoodsItemPage,
		navToCreateOrder,
		getOrderStateExp,
		uploadFiles,
		dateFormat,
		checkDeliveryHour
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				id: 0,
				goodsList: [],
				moreGoodsCount: 0,
				priceTitle: '单价',
				maxShowCount: 3,
				stateTip: '',
				stateContent: '',
				stateTipColor: '',
				info: {

				},
				isYuding: false,
				isRefundAll: false,
				refundItem: {
					_id: "",
					refundMax: 99,
					amount: 1,
					reason: ""
				},
				refundTypes: {
					"1": "退款退货",
					"2": "仅退款",
				},
				refundReasons: {
					"1": "未收到货",
					"2": "收到商品破损",
					"3": "商品错发、漏发",
					"4": "商品需要维修",
					"5": "收到商品与描述不符",
					"6": "商品质量问题",
					"7": "未按约定时间发货",
					"8": "其他",
				},
				refundImgs: [],
				message: "开启消息通知，及时获取订单配送信息",
				qrcode: {
					ifShow: false,
					val: '二维码', // 要生成的二维码值
					size: 200, // 二维码大小
					unit: 'upx', // 单位
					background: '#ffffff', // 背景色
					foreground: '#000000', // 前景色
					pdground: '#000000', // 角标色
					icon: '', // 二维码图标
					iconsize: 40, // 二维码图标大小
					lv: 3, // 二维码容错级别 ， 一般不用设置，默认就行
					onval: false, // val值变化时自动重新生成二维码
					loadMake: true, // 组件加载完成后自动生成二维码
					src: '' // 二维码生成后的图片地址或base64
				}
			};
		},
		onLoad(options) {
			this.id = options.id;
			this.loadData();
		},
		computed: {
			...mapState(['stationId']),
			realPayMoney() {
				let money = 0;
				if (this.info.payInfo) {
					money = this.info.payInfo.totalFee;
				}
				if (this.info.yuding && this.info.yuding.payInfo) {
					money += this.info.yuding.payInfo.totalFee;
				}
				return money / 100;
			}
		},
		onUnload() {
			uni.removeStorage({
				key: 'orderDetail'
			})
		},
		methods: {
			async loadData() {
				//优先从缓存读取，有助于显示速度
				let item = uni.getStorageSync('orderDetail');
				if (item) {
					//从缓存读取
					this.orderInfo(item);
				}
				//强制从网络获取
				orders({
					id: this.id,
					type: 'detail'
				}).then(res => {
					this.orderInfo(res);
				});
			},
			orderInfo(res) {
				if (!res.goods) {
					return false;
				}
				this.moreGoodsCount = res.goods.length - this.maxShowCount;
				//颠倒顺序
				if (res.cancelApply) {
					res.cancelApply = res.cancelApply.reverse();
				}
				//处理运费
				if (!res.freight) {
					res.freight = 0;
				}
				if (!res.isRefunding) {
					res.isRefunding = 0;
				}
				this.info = res;
				res.goods.forEach(item => {
					if (!item.refundAmount) {
						item.refundAmount = 0;
					}
					if (!item.isRefunding) {
						item.isRefunding = 0;
					}
					item.canRefund = (item.amount - item.refundAmount) > 0 && !item.isRefunding;
				})
				if (this.moreGoodsCount > 0) {
					this.goodsList = res.goods.slice(0, this.maxShowCount);
				} else {
					this.goodsList = res.goods;
				}
				if (this.info.yuding) {
					this.isYuding = true;
					this.priceTitle = '预售价';
				}

				this.updateState();
				checkDeliveryHour(this.info);
			},
			/**
			 * 订单状态
			 */
			updateState() {
				const {
					stateTip,
					stateTipColor,
					stateContent,
				} = getOrderStateExp(this.info);
				this.stateTip = stateTip;
				this.stateTipColor = stateTipColor;
				this.stateContent = stateContent;
			},
			showAllGoods() {
				this.goodsList = this.info.goods;
				this.moreGoodsCount = 0;
			},
			navToGoodsPage(item) {
				navToGoodsItemPage({
					id:item.id,
					sid:item.sku_id
				});
			},
			//删除订单
			deleteOrder() {
				uni.showModal({
					title: '确认删除订单？',
					content: '删除之后可以从回收站恢复',
					success: res => {
						if (res.confirm) {
							orders({
								id: this.id,
								type: 'delete'
							}).then(res => {
								console.log(res);
							});
							this.navBack();
						} else if (res.cancel) {
							console.log('用户点击取消');
						}
					}
				});
			},
			changeRefundNumber(e) {
				console.log("changeRefundNumber", e);
				this.refundItem.refundApplyAmount = +e;
			},
			changeRefundType(e) {
				console.log("changeRefundType", e);
				this.refundItem.refundType = this.refundTypes[e];
			},
			changeRefundReason(e) {
				console.log("changeRefundReason", e);
				this.refundItem.refundReason = this.refundReasons[e];
			},
			uploadRefundImgs() {
				uploadFiles(
					'order_refund',
					5,
					srcs => {
						this.refundImgs = this.refundImgs.concat(srcs);
					},
					srcs => {
						this.refundItem.refundImgs = this.refundItem.refundImgs.concat(srcs);
					}
				);
			},
			replaceImg(index) {
				uploadFiles(
					'order_refund',
					1,
					srcs => {
						//this.refundImgs[index] = srcs[0];
						this.$set(this.refundImgs, index, srcs[0])
					},
					srcs => {
						this.refundItem.refundImgs[index] = srcs[0];
					}
				);
			},
			changeRefundContent(e) {
				this.refundItem.refundContent = e;
			},
			closedRefund() {
				this.$refs.showRefund.close();
			},
			submitRefund() {
				this.closedRefund();
				//提交申请addRefundApply
				orders({
					id: this.info._id,
					type: 'addRefundApply',
					item: this.refundItem
				}).then(res => {
					this.$api.success("申请成功");
					this.info.isRefunding = 1;
					this.goodsList[this.refundItem.index].isRefunding = 1;
					this.goodsList[this.refundItem.index].canRefund = false;
					this.updateState();
					this.$api.prePage().refreshList();
				}, err => {
					this.$api.msg(err.message || "申请失败");
				});
			},
			//申请退款
			refundOrder(item, index) {
				//7天内可以退款
				if (this.info.makesureTime) {
					let makesureTime = (new Date(this.info.makesureTime)).getTime();
					let t = new Date().getTime();
					if ((t - makesureTime) / 1000 / 3600 / 24 > 7) {
						uni.showModal({
							showCancel: false,
							title: "无法申请退款",
							content: "订单完成后7天内可申请退款，现已超过7天，如有售后需求，请联系客服"
						});
						return;
					}
				}
				if (this.info.isRefundAll) {
					this.$api.msg("已退款");
					return false;
				}
				if (!item.canRefund) {
					console.log("退款中")
					this.$api.msg("退款中");
					return false;
				}
				//至少退一件
				this.$set(this, "refundItem", {
					_id: item._id,
					refundApplyAmount: 1,
					refundMax: item.amount - item.refundAmount,
					index,
					reason: "",
					refundImgs: [],
					refundReason: this.refundReasons['1'],
					refundType: this.refundTypes['1'],
					refundContent: ""
				});
				console.log(this.refundItem);
				this.refundImgs = [];
				//如果购买的是多件，需要选择数量
				this.$refs.showRefund.open();
			},
			//再次购买
			buyAgain(item) {
				let data = [];
				if (item) {
					data.push({
						goods_id: item.id,
						sku_id: item.sku_id,
						price: item.price,
						src: item.src,
						checked: 1,
						amount: item.amount
					});
					addManyCart({
						shopid: this.info.shopid,
						stationId: this.stationId,
						data: data
					}).then(res => {
						console.log(res);
						this.$api.msg('加入购物车成功', 1500, false, 'success');
					});
				} else {
					//直接提交订单，如果存在库存不足，将提交失败
					let goods = this.info.goods;
					uni.setStorage({
						key: 'settlementCartsIds',
						data: {
							shopid: this.info.shopid,
							goodslist: goods
						},
						success: () => {
							navToCreateOrder();
						}
					});
					//加入商品到购物车，再跳转到结算
					/* for (let ele of this.info.goods) {
						data.push({
							goods_id: ele.id,
							sku_id: ele.sku_id,
							price: ele.price,
							src: ele.src,
							checked: 1,
							amount: ele.amount
						});
					}
					addManyCart({
						id: this.info.shopid,
						stationId: this.stationId,
						data: data
					}).then(res => {
						console.log(res);
						uni.setStorage({
							key:"settlementCartsIds",
							data:{
								settlement:true
							},
							success:()=> {
								navToCreateOrder();
							}
						})
						//navToCreateOrder();
					}); */
				}
			},
			//催老板发货
			pusheDelivery() {
				this.$api.msg('已发送消息给商家,请耐心等待');
			},
			//确定收货
			confirmOrder(ele) {
				uni.showModal({
					content: '是否确认收到货物？',
					success: res => {
						if (res.confirm) {
							orders({
								id: this.id,
								type: 'makesure'
							}).then(res => {
								//重新刷新页面
								this.loadData();
								this.$api.prePage().refreshList();
							});
						}
					}
				});
			},
			//评价
			evaluateOrder() {
				uni.setStorage({
					key:"commentOrder",
					data:this.info
				});
				this.navTo("/pages/order/comment")
			},
			//监听image加载完成
			onImageLoad(key, index) {
				this.$set(this[key][index], 'loaded', 'loaded');
			},
			//监听image加载失败
			onImageError(key, index) {
				this[key][index].image = '/static/errorImage.jpg';
			},
			//刷新数据
			refreshList() {
				this.loadData();
			},
			navBack() {
				uni.navigateBack();
			},
			tel(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},
			navToLocation(shop) {
				uni.openLocation({
					latitude: shop.latitude,
					longitude: shop.longitude,
					success: function() {
						console.log('success');
					}
				});
			},
			//放大提货码，并生成二维码
			zoomCode(info) {
				this.qrcode.val = 'ziti::' + [info.number, info.password].join('_');
				this.qrcode.ifShow = true;
				this.$refs.showCode.open();
			},
			qrR(src) {
				//console.log('qr', src);
			}
		}
	};
</script>

<style lang="scss">
	page {
		background: #f5f5f5;
		font-size: $font-base;
		color: $font-color-dark;
	}

	.container {
		padding: 20upx;
		padding-top: calc(160upx + var(--status-bar-height));
	}

	.m-t {
		margin-top: 20upx;
	}

	.weui-flex {
		display: flex;
		align-items: center;
		position: relative;

		&.start {
			align-items: flex-start;
		}

		&.b-b {
			padding-bottom: 12rpx;
		}
	}

	.weui-flex__item {
		flex: 1;
	}

	.header {
		position: fixed;
		background: #f5f5f5;
		width: 100%;
		top: 0;
		left: 0;
		z-index: 99;
		padding-left: 20upx;
		padding-top: calc(40upx + var(--status-bar-height));
	}

	.header_title {
		font-size: $font-llg;
		display: flex;
		align-items: center;
		padding-top: 30upx;
		margin-bottom: 16upx;

		.icon-you {
			color: #9e9e9e;
			margin-top: 8upx;
		}
	}

	.section {
		background: #ffffff;
		padding: 20upx 30upx;
		border-radius: 20upx;
	}

	.refund {
		background: #ffffff;
		border-radius: 20upx;
		padding: 20rpx 0 40rpx 0;
		width: 680rpx;

		.section {
			padding: 20upx 0 0 30upx;
		}

		.weui-flex {
			padding-right: 20rpx;
			padding-bottom: 26upx;
		}

		.buttons {
			margin-top: 30rpx;
			padding-right: 50rpx;
		}

		.refund-amount {
			padding-right: 20rpx;
		}
	}

	.message_notice {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.action-btn {
		height: 60upx;
		margin: 0;
		padding: 0 30upx;
		margin-left: 24upx;
		text-align: center;
		line-height: 60upx;
		font-size: $font-sm + 2upx;
		color: $font-color-dark;
		background: #fff;
		border-radius: 100px;

		&:after {
			border-radius: 100px;
		}

		&.recom {
			background: $base-color;
			color: #fff;
		}

		&.disabled {
			background-color: $font-color-disabled;
			color: #fff;
		}
	}

	.sub-title {
		font-weight: 500;
		margin-bottom: 40upx;
	}

	.buttons {
		display: flex;
		justify-content: flex-end;
	}

	.cart-list {
		flex: 1;
		overflow: hidden;
		background: #ffffff;
		border-radius: 20upx;

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
			border-radius: 12upx;
			margin-bottom: 8upx;

			.start {
				flex: 1;
			}

			.sub-catename {
				padding-bottom: 10upx;
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

			.title {
				font-size: $font-base;
				color: $font-color-dark;
				line-height: 1.1;
				font-weight: 400;
				padding-right: 20upx;
			}

			.desc2 {
				padding: 4upx 0 0;
			}

			.buttons {
				margin-top: 12upx;

				.empty {
					flex: 1;
				}
			}
		}

		.prices {
			justify-content: space-between;
		}
	}

	.m-l {
		margin-left: 10upx;
	}

	.m-l2 {
		margin-left: 20upx;
	}

	.address {
		position: relative;
		padding-bottom: 14upx;

		.content {
			text-align: right;
			flex: 1;
		}

		.warning {
			color: $font-color-warning;
		}
	}

	.more-btn {
		background: #fff;
		text-align: center;
		padding: 20upx;
		position: relative;
	}

	.ab {
		.weui-flex {
			justify-content: space-between;
			margin-bottom: 14upx;
		}
	}

	.price {
		color: $font-color-dark;

		&.warning {
			color: $font-color-warning;
		}
	}

	.apply-list {
		.title {
			font-weight: 500;
			margin: 8rpx 0;
		}

		.apply-list-content {
			color: $font-color-disabled;
			padding-left: 20upx;
			font-size: $font-sm;

			.weui-flex {
				flex-direction: column;
				align-items: inherit;
				margin-bottom: 10upx;

				&:nth-child(1) {
					color: $base-color;
				}
			}
		}
	}

	.code-section {
		background: #ffffff;
		padding: 20rpx;
		border-radius: 10rpx;
		text-align: center;
	}

	.mix-list-cell {
		display: flex;
		align-items: baseline;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;

		&.imgs {
			padding-bottom: 0;
		}

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		.cell-icon {
			align-self: center;
			width: 56upx;
			max-height: 60upx;
			font-size: 38upx;
		}

		.cell-more {
			align-self: center;
			font-size: 30upx;
			color: $font-color-base;
			margin-left: $uni-spacing-row-sm;
		}

		.cell-tit {
			font-size: $font-base;
			color: $font-color-dark;
			margin-right: 20upx;
		}

		.cell-content {
			flex: 1;
			font-size: $font-sm + 2upx;

			&.content-right {
				text-align: right;
			}
		}

		.cell-tip {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
		}

	}

	.imgs {
		position: relative;
	}

	.h-list {
		white-space: nowrap;
		padding: 10upx 30upx 0;

	}

	.h-list-image {
		display: inline-block;
		margin-right: 20upx;

		image {
			width: 160upx;
			height: 160upx;
			border-radius: 4%;
		}
	}
</style>

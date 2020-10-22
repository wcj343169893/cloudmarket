<template>
	<view class="container">
		<!-- 标题栏和状态栏占位符 -->
		<view class="deliver-section">
			<view class="delivery-types" v-if="deliveryTypes.length > 1">
				<view class="items" :class="{ current: deliveryType == 'deliveryHome' }" v-if="deliveryTypes.indexOf('deliveryHome') != -1"
				 @click="changeDtype('deliveryHome')"><text>配送到家</text></view>
				<view class="items" :class="{ current: deliveryType == 'selfRaising' }" v-if="deliveryTypes.indexOf('selfRaising') != -1"
				 @click="changeDtype('selfRaising')"><text>到店自提</text></view>
			</view>
			<block v-if="deliveryType == 'deliveryHome'">
				<!-- 地址 -->
				<navigator v-if="addressData._id" url="/pages/address/address?source=settlement" class="address-section b-b">
					<view class="order-content">
						<text class="yticon icon-shouhuodizhi"></text>
						<view class="cen">
							<view class="top">
								<text class="name">{{ addressData.name }}</text>
								<text class="mobile">{{ addressData.mobile }}</text>
								<text v-if="addressData.default" class="tag">默认</text>
							</view>
							<text class="address">
								<text>{{ addressData.addressName }} {{ addressData.area }}</text>
								<text v-if="juli > 0" class="m-l">距离:{{ juli }}km</text>
							</text>
						</view>
						<text class="yticon icon-you"></text>
					</view>
				</navigator>
				<!-- 新增地址 -->
				<navigator v-else url="/pages/address/addressManage?type=new" class="address-section b-b">
					<view class="order-content">
						<text class="yticon icon-shouhuodizhi"></text>
						<view class="cen"><text>暂无收货地址，去添加</text></view>
						<text class="yticon icon-you"></text>
					</view>
				</navigator>
				<mix-list-cell title="预计送达时间" border="" :tips="deliveryHour.name + ' ' + deliveryHour.time" @eventClick="selectTime()"></mix-list-cell>
			</block>
			<block v-if="deliveryType == 'selfRaising'">
				<!-- 地址 -->
				<view class="address-section b-b" @click="navToLocation(shop)">
					<view class="order-content">
						<image :src="shop.src" mode="aspectFill" class="shoplogo"></image>
						<view class="cen">
							<view class="top">
								<text class="name">{{ shop.name }}</text>
								<text class="mobile">{{ shop.phone }}</text>
							</view>
							<text class="address">
								<text>{{ shop.address }}</text>
								<text v-if="zitiJuli > 0" class="m-l">距离:{{ zitiJuli }}km</text>
							</text>
						</view>
						<text class="yticon icon-you"></text>
					</view>
				</view>
				<mix-list-cell title="预约自提时间" border="" :tips="deliveryHour.name + ' ' + deliveryHour.time" @eventClick="selectTime()"></mix-list-cell>
			</block>
		</view>
		<view class="goods-section">
			<block v-if="dataList.length > 1">
				<view class="weui-flex goods-box-multi">
					<!-- 商品列表 -->
					<scroll-view scroll-x="true" class="goods_list">
						<view class="scoll-wrapper">
							<view class="g-item" v-for="(item, index) in dataList" :key="index">
								<image :src="item.src"></image>
							</view>
						</view>
					</scroll-view>
					<!-- 总计 -->
					<navigator url="/pages/order/goods" class="weui-flex__item">
						<view class="total">
							<text>共{{ cartCount }}件</text>
							<text class="yticon icon-you"></text>
						</view>
					</navigator>
				</view>
			</block>
			<block v-else>
				<view class="goods-box-single" v-for="(goodsItem, index) in dataList" :key="index">
					<image class="goods-img" :src="goodsItem.src" mode="aspectFill"></image>
					<view class="right">
						<view class="">
							<text class="title">{{ goodsItem.title }}</text>
						</view>
						<text class="attr-box" v-if="goodsItem.subName && goodsItem.subName.length > 0">{{ goodsItem.subName }}</text>
						<view class="attr-box">
							<text>{{ priceTitle }}:</text>
							<text class="price">{{ (goodsItem.originPrice > 0 ? goodsItem.originPrice : goodsItem.price) | toFixed }}</text>
							<text>数量:</text>
							<text>{{ goodsItem.amount }}</text>
						</view>
					</view>
				</view>
			</block>
		</view>

		<!-- 优惠明细 -->
		<view class="yt-list">
			<!-- <view class="yt-list-cell b-b" @click="toggleMask('show')">
				<view class="cell-icon">券</view>
				<text class="cell-tit clamp">优惠券</text>
				<text class="cell-tip active">选择优惠券</text>
				<text class="cell-more wanjia wanjia-gengduo-d"></text>
			</view> -->
			<view class="yt-list-cell ">
				<view class="cell-icon hb">减</view>
				<text class="cell-tit clamp">优惠券</text>
				<text class="cell-tip disabled">暂无可用优惠</text>
			</view>
		</view>
		<!-- 金额明细 -->
		<view class="yt-list">
			<block v-if="yuding">
				<view class="yt-list-cell b-b" v-if="yuding.price">
					<text class="cell-tit clamp">阶段1：定金</text>
					<text class="cell-tip">
						<text class="price">{{ (yuding?yuding.price:"") | toFixed }}</text>
					</text>
				</view>
				<view class="yt-list-cell b-b" v-if="yuding.finishPaymentPrice">
					<text class="cell-tit clamp">阶段2：尾款</text>
					<text class="cell-tip">
						<text class="price">{{ (yuding?yuding.finishPaymentPrice:"") | toFixed}}</text>
					</text>
				</view>
			</block>
			<block v-else>
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">商品金额</text>
					<text class="cell-tip">
						<text class="price">{{ (totalMoney + totalDiscount) | toFixed}}</text>
					</text>
				</view>
			</block>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">优惠金额</text>
				<text class="cell-tip red">
					<text>-</text>
					<text class="price">{{ totalDiscount }}</text>
				</text>
			</view>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">运费</text>
				<text class="cell-tip" v-if="freight > 0">
					<text class="price">{{ freight }}</text>
				</text>
				<text class="cell-tip" v-else>{{freightTitle}}</text>
			</view>
			<view class="yt-list-cell desc-cell">
				<text class="cell-tit clamp">备注</text>
				<input class="desc" type="text" v-model="remark" placeholder="请填写备注信息" placeholder-class="placeholder" />
			</view>
		</view>

		<!-- 底部 -->
		<view class="footer" v-if="!isOutOfRange">
			<view class="price-content">
				<text>{{ totalTitle }}</text>
				<text v-if="yuding" class="price warning">{{ totalMoney | toFixed }}</text>
				<text v-else class="price warning">{{ (totalMoney + freight) | toFixed }}</text>
			</view>
			<text class="submit" @click="submit">提交订单</text>
		</view>
		<!-- 底部 -->
		<view class="footer" v-else>
			<view class="price-content"><text>超出配送范围，请更改收货地址！</text></view>
		</view>

		<!-- 优惠券面板 -->
		<view class="mask" :class="maskState === 0 ? 'none' : maskState === 1 ? 'show' : ''" @click="toggleMask">
			<view class="mask-content" @click.stop.prevent="stopPrevent">
				<!-- 优惠券页面，仿mt -->
				<view class="coupon-item" v-for="(item, index) in couponList" :key="index">
					<view class="con">
						<view class="left">
							<text class="title">{{ item.title }}</text>
							<text class="time">有效期至</text>
						</view>
						<view class="right">
							<text class="price">{{ item.price }}</text>
							<text>满30可用</text>
						</view>

						<view class="circle l"></view>
						<view class="circle r"></view>
					</view>
					<text class="tips">限新用户使用</text>
				</view>
			</view>
		</view>
		<uni-popup type="bottom" ref="selectTimePopup">
			<view class="specsTitlesBtn selectCategory b-b">
				<text class="add-btn cancel" @click="cancelSelectTime">取消</text>
				<text class="add-btn" @click="savaSelectTime">确定</text>
			</view>
			<view class="times">
				<scroll-view scroll-y="true" class="days-scroll">
					<view v-for="(item, index) in deliveryDays" :key="index" class="days b-b" :class="{ current: item.checked }"
					 @click="checkDay(index)">
						<text>{{ item.name }}</text>
						<text class="m-l">{{ item.time }}</text>
					</view>
				</scroll-view>
				<scroll-view scroll-y="true" class="hours-scroll">
					<view class="hours b-b" v-for="(item, index) in deliveryHours" :class="{ current: item.checked }" :key="index"
					 @click="checkHour(index)">
						<text>{{ item.time }}</text>
						<text class="yticon icon-right" v-if="item.checked"></text>
					</view>
				</scroll-view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		cloudMall
	} from '@/common/request.js';
	import {
		navToLoginPage,
		mapDistance,
		dateFormat
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				maskState: 0, //优惠券面板显示状态
				remark: '', //备注
				couponList: [{
					title: '新用户专享优惠券',
					price: 5
				}],
				ids: [],
				dataList: [],
				priceTitle: '单价',
				totalTitle: '实付款',
				//库存不足商品
				stockNotEnough: [],
				cartCount: 0,
				totalMoney: 0,
				totalDiscount: 0,
				freight: 0, //运费
				freightTitle:"",
				isSubmit: false,
				yuding: false,
				addressData: {},
				isOutOfRange: false,
				shop: {},
				juli: 0,
				zitiJuli: 0,
				deliveryType: "deliveryHome", //配送类型，1配送deliveryHome，2自提selfRaising
				deliveryTypes: ["deliveryHome"], //店铺支持的配送类型，1配送，2自提，默认支持配送
				deliveryDays: [], //天列表
				deliveryDayIndex: 0, //选中的天index
				deliveryHour: {
					name: '',
					time: ''
				},
				deliveryHourTmp: {}, //临时选中的配送时间
				deliveryHours: [], //所有配送时段
				pickup: false,
			};
		},
		onLoad(option) {
			this.loadData();
		},
		computed: {
			...mapState(['hasLogin', 'shopId', 'stationId', 'location'])
		},
		methods: {
			async loadData() {
				this.ids = uni.getStorageSync('settlementCartsIds');
				if (!this.ids) {
					console.log('结算信息不存在');
					return;
				}
				cloudMall("order","settlement",{
					id: this.shopId, //对此变量依赖性太强
					addressid: this.location.id,
					stationId: this.stationId,
					...this.ids
				},true).then(
					res => {
						console.log(res);
						//默认收货地址
						this.addressData = res.address;
						this.shop = res.shop;
						//结算商品列表，写到本地临时缓存
						this.dataList = res.goods;
						uni.setStorage({
							key: 'create_order_goods',
							data: res.goods
						});
						this.cartCount = res.cartCount;
						this.totalMoney = res.totalMoney;
						this.totalDiscount = res.totalDiscount;
						this.stockNotEnough = res.stockNotEnough;
						//支持的配送方式
						this.deliveryTypes = res.shop.deliveryTypes;
						this.deliveryType = this.deliveryTypes[0];
						//this.freight = res.freight;
						this.yuding = res.yuding;
						if (this.yuding) {
							this.priceTitle = '预售价';
							this.totalTitle = '定金';
							this.totalMoney = this.yuding.price;
						}
						if (res.pickup) {
							this.pickup = res.pickup;
						}
						if (this.stockNotEnough.length > 0) {
							uni.showModal({
								title: '库存不足提醒',
								content: '商品:' +
									this.stockNotEnough
									.map(m => {
										return m.title;
									})
									.join(',') +
									' 库存不足\n是否移除后继续提交？',
								success: e => {
									if (e.confirm) {
										//更新库存不足的商品为未选中状态
										cloudMall("cart","selected",{
											id: this.shopId,
											stationId: this.stationId,
											checked: false,
											cartIds: this.stockNotEnough
												.map(m => {
													return m.cartId;
												})
												.join(',')
										},true).then(res => {
											console.log(res);
										});
									} else {
										uni.navigateBack();
									}
								}
							});
						}
						//检查收货地址是否在配送范围内
						this.checkAddress();
						//构造送达时间选项
						this.genDeliveryDayTime();
					},
					err => {
						//购物车没有需要结算的商品
						this.$api.msg(`商品不存在`);
						setTimeout(() => {
							uni.navigateBack();
						}, 3000);
					}
				);
			},
			//检查收货地址是否在配送范围内
			checkAddress() {
				if (!this.addressData || !this.addressData.latitude) {
					console.log("没有收货地址")
					return false;
				}
				//计算2点的距离
				let fromLng = [this.addressData.latitude + ',' + this.addressData.longitude, this.location.latitude + ',' + this.location
					.longitude
				];
				mapDistance(fromLng.join(';'), this.shop.latitude + ',' + this.shop.longitude).then(res => {
					//收货地址与店铺地址的距离
					let juli = Number(res[0].elements[0].distance);
					let zitiJuli = Number(res[1].elements[0].distance);
					if (juli > 0) {
						this.juli = juli / 1000;
						console.log('距离：', this.juli);
						//超出配送范围
						this.isOutOfRange = this.juli > this.shop.delivery.maxDistance;
						//计算运费
						this.getFreight();
					}
					if (zitiJuli > 0) {
						this.zitiJuli = zitiJuli / 1000;
					}
				});
			},
			//构造送达时间选项
			genDeliveryDayTime() {
				let delivery = this.shop.delivery;
				this.deliveryDays = [];
				let dayNames = ['今天', '明天', '后天'];
				let day = new Date();
				let baseDay = 0;
				//如果商品是预售，提货时间自动推迟到付尾款时间开始
				let todayTime = new Date(dateFormat(false, 'yyyy/MM/dd')).getTime();
				if (this.yuding) {
					//计算与今天差多少天
					let beginTime = new Date(dateFormat(this.yuding.finalPaymentBeginTime, 'yyyy/MM/dd')).getTime();
					baseDay = (beginTime - todayTime) / 1000 / 3600 / 24;
					day = new Date(this.yuding.finalPaymentBeginTime);
				} else if (this.pickup) {
					let beginTime = new Date(dateFormat(this.pickup, 'yyyy/MM/dd')).getTime();
					baseDay = (beginTime - todayTime) / 1000 / 3600 / 24;
					day = new Date(this.pickup);
				}
				if (baseDay < 0) {
					baseDay = 0;
					day = new Date();
				}
				for (let i = baseDay; i < delivery.deliveryDay + baseDay; i++) {
					let name = '';
					if (i < dayNames.length) {
						name = dayNames[i] + ' ';
					}
					//今日0时时间戳
					todayTime = new Date(dateFormat(day, 'yyyy/MM/dd')).getTime();
					let info = {
						id: dateFormat(day, 'yyyyMMdd'),
						name: name,
						time: dateFormat(day, 'MM月dd日'),
						checked: i == 0,
						children: []
					};
					//如果是今天，则需要过滤时段
					if (i == 0) {
						let isChecked = false;
						for (let dep of delivery.deliveryPeriod) {
							if (todayTime + dep.begin * 1000 > day.getTime()) {
								info.children.push({
									id: dep.begin * 1000 + todayTime,
									endTime: dep.end * 1000 + todayTime,
									checked: !isChecked,
									name: name == '' ? info.time : name,
									time: dateFormat(dep.begin * 1000 + todayTime, 'hh:mm') + '-' + dateFormat(dep.end * 1000 + todayTime,
										'hh:mm')
								});
								if (!isChecked) {
									isChecked = true;
								}
							}
						}
						if (info.children.length > 0) {
							this.deliveryDays.push(info);
						}
					} else {
						for (let dep of delivery.deliveryPeriod) {
							info.children.push({
								id: dep.begin * 1000 + todayTime,
								endTime: dep.end * 1000 + todayTime,
								checked: false,
								name: name == '' ? info.time : name,
								time: dateFormat(dep.begin * 1000 + todayTime, 'hh:mm') + '-' + dateFormat(dep.end * 1000 + todayTime,
									'hh:mm')
							});
						}
						this.deliveryDays.push(info);
					}
					//递增日期
					day.setDate(day.getDate() + 1);
				}
				//默认选中第一个
				this.checkDay(0);
				this.checkHour(0);
				this.savaSelectTime();
			},
			changeDtype(type) {
				console.log('changeDtype', type);
				this.deliveryType = type;
				this.getFreight();
			},
			//计算运费，请求网络
			getFreight() {
				cloudMall("order","getFreight",{
					deliveryType:this.deliveryType,
					juli:this.juli,
					totalMoney:this.totalMoney,
					shopid:this.shopId
				}).then(res=>{
					this.freight = res.freight;
					this.freightTitle = res.freightTitle;
				});
			},
			//显示优惠券面板
			toggleMask(type) {
				let timer = type === 'show' ? 10 : 300;
				let state = type === 'show' ? 1 : 0;
				this.maskState = 2;
				setTimeout(() => {
					this.maskState = state;
				}, timer);
			},
			//提交订单，并跳转到支付页面
			submit() {
				//判断收货地址
				if (this.deliveryType == "deliveryHome" && (!this.addressData || !this.addressData._id)) {
					this.$api.msg('请填写收货地址');
					return;
				}
				if (this.isSubmit) {
					return;
				}
				this.isSubmit = true;
				cloudMall("order","settlement",{
					id: this.shopId,
					stationId: this.stationId,
					type: 'submit',
					remark: this.remark,
					juli: this.juli,
					deliveryType: this.deliveryType,
					freight: this.deliveryType == "deliveryHome" ? this.freight : 0, //本机计算运费，如果交给服务器，还需要再去计算2点的距离,但是本地计算不靠谱
					deliveryHour: this.deliveryHour,
					addressid: this.addressData._id,
					...this.ids
				},true).then(
					res => {
						let id = res;
						let money = this.totalMoney + this.freight;
						//this.isSubmit = false;
						//刷新购物车列表
						/* try {
							this.$api.prePage().refreshList();
						} catch (e) {
							//TODO handle the exception
						} */
						uni.$emit("refreshCart");
						uni.redirectTo({
							url: `/pages/money/pay?id=${id}&money=${money}&comefrom=cart&module=mall`
						});
					},
					err => {
						this.isSubmit = false;
						this.$api.msg(err.message);
					}
				);
			},
			refreshList(data, type) {
				console.log(data, type);
				this.addressData = data;
				this.checkAddress();
			},
			selectTime() {
				this.$refs['selectTimePopup'].open();
			},
			cancelSelectTime() {
				this.$refs['selectTimePopup'].close();
			},
			savaSelectTime() {
				this.deliveryHour = this.deliveryHourTmp;
				this.$refs['selectTimePopup'].close();
			},
			checkDay(index) {
				this.deliveryDayIndex = index;
				this.deliveryHours = this.deliveryDays[index].children;
				this.deliveryDays.forEach(e => {
					e.checked = false;
				});
				this.deliveryDays[index].checked = true;
			},
			checkHour(index) {
				this.deliveryDays.forEach((e, i) => {
					if (i == this.deliveryDayIndex) {
						e.children.forEach((e2, i2) => {
							e2.checked = index == i2;
							if (e2.checked) {
								this.deliveryHourTmp = e2;
							}
						});
					} else {
						e.children.forEach(e2 => {
							e2.checked = false;
						});
					}
				});
			},
			//打开地图位置
			navToLocation(shop) {
				uni.openLocation({
					latitude: shop.latitude,
					longitude: shop.longitude,
					success: function() {
						console.log('success');
					}
				});
			},
			stopPrevent() {}
		}
	};
</script>

<style lang="scss">
	page {
		background: $page-color-base;
		padding-bottom: 100upx;
	}

	.address-section {
		padding: 32upx 0;
		background: #fff;
		position: relative;
		font-size: $font-base;

		.order-content {
			display: flex;
			align-items: center;
		}

		.icon-shouhuodizhi {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			justify-content: center;
			width: 90upx;
			color: #888;
			font-size: 44upx;
		}

		.cen {
			display: flex;
			flex-direction: column;
			flex: 1;
			font-size: $font-sm;
			color: $font-color-dark;
		}

		.name {
			font-size: $font-lg;
			margin-right: 24upx;
		}

		.address {
			margin-top: 8upx;
			margin-right: 20upx;
			color: $font-color-light;
		}

		.icon-you {
			font-size: 32upx;
			color: $font-color-light;
			margin-right: 30upx;
		}

		.a-bg {
			position: absolute;
			left: 0;
			bottom: 0;
			display: block;
			width: 100%;
			height: 5upx;
		}

		.tag {
			font-size: $font-sm;
			margin-left: 10upx;
		}

		.shoplogo {
			width: 80rpx;
			height: 80rpx;
			border-radius: 8rpx;
			margin-right: 16rpx;
		}
	}

	.time-section {
		position: relative;
		padding: 20rpx;
		font-size: $font-base;

		.order-content {
			display: flex;
			align-items: center;
		}

		.cen {
			flex: 1;
		}
	}

	.goods-section {
		margin-top: 16upx;
		background: #fff;
		padding-bottom: 1px;
		font-size: $font-base;

		.g-header {
			display: flex;
			align-items: center;
			height: 84upx;
			padding: 0 30upx;
			position: relative;
			margin-bottom: 12upx;
		}

		.goods_list {
			width: 80%;
		}

		.scoll-wrapper {
			display: inline-flex;
			align-items: flex-start;
		}

		.total {
			text-align: center;
			font-size: $font-sm;
		}

		.yticon {
			font-size: $font-sm;
		}

		.g-item {
			margin-left: 16upx;

			image {
				border-radius: 4%;
				width: 100upx;
				height: 100upx;
			}
		}
	}

	.weui-flex {
		display: flex;
		align-items: center;
	}

	.weui-flex__item {
		flex: 1;
	}

	.yt-list {
		margin-top: 16upx;
		background: #fff;

		&.pop {
			margin: 0;
		}
	}

	.yt-list-cell {
		display: flex;
		align-items: center;
		padding: 10upx 30upx 10upx 40upx;
		line-height: 70upx;
		position: relative;

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		.cell-icon {
			height: 32upx;
			width: 32upx;
			font-size: 22upx;
			color: #fff;
			text-align: center;
			line-height: 32upx;
			background: #f85e52;
			border-radius: 4upx;
			margin-right: 12upx;

			&.hb {
				background: #ffaa0e;
			}

			&.lpk {
				background: #3ab54a;
			}
		}

		.cell-more {
			align-self: center;
			font-size: 24upx;
			color: $font-color-light;
			margin-left: 8upx;
			margin-right: -10upx;
		}

		.cell-tit {
			flex: 1;
			font-size: 26upx;
			color: $font-color-light;
			margin-right: 10upx;
		}

		.cell-tip {
			font-size: 26upx;
			color: $font-color-dark;

			&.disabled {
				color: $font-color-light;
			}

			&.active {
				color: $base-color;
			}

			&.red {
				color: $base-color;
			}
		}

		&.desc-cell {
			.cell-tit {
				max-width: 90upx;
			}
		}

		.desc {
			flex: 1;
			font-size: $font-base;
			color: $font-color-dark;
		}
	}

	.footer {
		position: fixed;
		left: 30upx;
		right: 30upx;
		bottom: calc(30upx + var(--window-bottom));
		z-index: 99;
		display: flex;
		align-items: center;
		width: 92%;
		height: 90upx;
		justify-content: space-between;
		font-size: 30upx;
		background-color: #fff;
		color: $font-color-base;
		box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
		border-radius: 10upx;
		overflow: hidden;

		.price-content {
			padding-left: 30upx;
		}

		.price-tip {
			color: $base-color;
			margin-left: 8upx;
		}

		.price {
			font-size: 36upx;
		}

		.submit {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 280upx;
			height: 100%;
			color: #fff;
			font-size: 32upx;
			background-color: $base-color;
		}
	}

	/* 优惠券面板 */
	.mask {
		display: flex;
		align-items: flex-end;
		position: fixed;
		left: 0;
		top: var(--window-top);
		bottom: 0;
		width: 100%;
		background: rgba(0, 0, 0, 0);
		z-index: 9995;
		transition: 0.3s;

		.mask-content {
			width: 100%;
			min-height: 30vh;
			max-height: 70vh;
			background: #f3f3f3;
			transform: translateY(100%);
			transition: 0.3s;
			overflow-y: scroll;
		}

		&.none {
			display: none;
		}

		&.show {
			background: rgba(0, 0, 0, 0.4);

			.mask-content {
				transform: translateY(0);
			}
		}
	}

	/* 优惠券列表 */
	.coupon-item {
		display: flex;
		flex-direction: column;
		margin: 20upx 24upx;
		background: #fff;

		.con {
			display: flex;
			align-items: center;
			position: relative;
			height: 120upx;
			padding: 0 30upx;

			&:after {
				position: absolute;
				left: 0;
				bottom: 0;
				content: '';
				width: 100%;
				height: 0;
				border-bottom: 1px dashed #f3f3f3;
				transform: scaleY(50%);
			}
		}

		.left {
			display: flex;
			flex-direction: column;
			justify-content: center;
			flex: 1;
			overflow: hidden;
			height: 100upx;
		}

		.title {
			font-size: 32upx;
			color: $font-color-dark;
			margin-bottom: 10upx;
		}

		.time {
			font-size: 24upx;
			color: $font-color-light;
		}

		.right {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			font-size: 26upx;
			color: $font-color-base;
			height: 100upx;
		}

		.price {
			font-size: 44upx;
			color: $base-color;

			&:before {
				content: '￥';
				font-size: 34upx;
			}
		}

		.tips {
			font-size: 24upx;
			color: $font-color-light;
			line-height: 60upx;
			padding-left: 30upx;
		}

		.circle {
			position: absolute;
			left: -6upx;
			bottom: -10upx;
			z-index: 10;
			width: 20upx;
			height: 20upx;
			background: #f3f3f3;
			border-radius: 100px;

			&.r {
				left: auto;
				right: -6upx;
			}
		}
	}

	.goods-box-multi {
		padding: 20upx;
	}

	/* 单条商品 */
	.goods-box-single {
		display: flex;
		padding: 20upx;

		.goods-img {
			display: block;
			width: 120upx;
			height: 120upx;
			border-radius: 4%;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 0 30upx 0 24upx;
			overflow: hidden;

			.title {
				font-size: $font-base + 2upx;
				color: $font-color-dark;
				line-height: 1;
			}

			.attr-box {
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				padding: 8upx 0upx 0;
			}
		}
	}

	.specsTitlesBtn {
		display: flex;
		padding: 50upx 30upx 30upx;

		&.submit {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 98;
			background: #ffffff;
		}

		&.selectCategory {
			background: #ffffff;
			justify-content: space-between;
			padding: 20upx 30upx 20upx;
			position: relative;
			height: 90upx;

			.add-btn {
				color: #007aff;
				flex: none;
				background: none;
				margin: 0;

				&.cancel {
					color: #888888;
				}
			}
		}
	}

	.add-btn {
		flex: 1;
		margin: 0 30upx;
		font-size: $font-lg;
		color: #fff;
		background-color: $btn-color-light;
		border-radius: 10upx;

		&.cancel {
			background-color: $btn-color-spec;
		}
	}

	.times {
		background: #ffffff;
		display: flex;
		height: 500rpx;
		font-size: $font-base;

		.days-scroll {
			width: 360rpx;
			background: #f5f5f5;
			height: 500rpx;
			padding-bottom: 30rpx;

			.days {
				padding: 20rpx 0;
				text-align: center;
				position: relative;

				&.current {
					background: #ffffff;
				}
			}
		}

		.hours-scroll {
			height: 500rpx;
			padding-bottom: 30rpx;

			.hours {
				position: relative;
				padding: 20rpx;
				display: flex;
				justify-content: space-between;

				.content {
					flex: 1;
				}

				&.current {
					color: $base-color;
				}
			}
		}
	}

	.m-l {
		margin-left: 8rpx;
	}

	.deliver-section {
		margin: 20rpx;
		background: #ffffff;
		padding: 20rpx;
		border-radius: 20rpx;
	}

	.delivery-types {
		display: flex;
		font-size: $font-lg;
		text-align: center;

		.items {
			flex: 1;

			&.current {
				color: $base-color;
				font-weight: 500;
			}
		}
	}
</style>

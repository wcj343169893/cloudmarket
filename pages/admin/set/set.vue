<template>
	<view class="container">
		<view class="mix-list-cell b-b bg-white" @click="changeAvatar" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">图标</text>
			<view class="cell-content content-right">
				<image class="portrait" :src="src"></image>
			</view>
		</view>
		<mix-list-input title="名称" :defContent="name" placeholder="请输入名称" @blur="changeName"></mix-list-input>
		<mix-list-cell title="地址" navigateType="address" :tips="address" @eventClick="changeAddress()"></mix-list-cell>
		<mix-list-input title="电话" type="number" :defContent="phone" placeholder="请输入电话" @blur="changePhone"></mix-list-input>
		<mix-list-input title="公告" :defContent="notice" placeholder="请输入公告" @blur="changeNotice"></mix-list-input>
		<mix-list-input title="营业时间" :defContent="serviceTime" placeholder="请输入营业时间" @blur="changeServiceTime"></mix-list-input>
		<mix-list-checkbox title="配送方式" field="deliveryTypes" type="checkbox" :defaultOptions="deliveryTypes" :options="deliveryTypeMap"
		 @change="changeField"></mix-list-checkbox>
		<mix-list-checkbox title="首页选择自提点" v-if="deliveryTypes && deliveryTypes.indexOf('selfRaising') !=-1" field="selfRaising.enable"
		 :defContent="selfRaising.enable" @change="changeField"></mix-list-checkbox>
		<mix-list-input v-if="deliveryTypes && deliveryTypes.indexOf('selfRaising') !=-1" title="自提点覆盖半径" type="digit" :defContent="selfRaising.distance" field="selfRaising.distance"
		 placeholder="请输入自提点距离" @blur="changeFieldNumber">
			<text class="moreText">米</text></mix-list-input>
		<mix-list-input title="支付倒计时" type="digit" :defContent="lastPayTimeMinute" field="lastPayTimeMinute" placeholder="请输入倒计时"
		 @blur="changeFieldNumber">
			<text class="moreText">分钟</text></mix-list-input>
		<mix-list-input title="预定支付倒计时" type="digit" :defContent="yudingLastPayTimeMinute" field="yudingLastPayTimeMinute"
		 placeholder="请输入倒计时" @blur="changeFieldNumber">
			<text class="moreText">分钟</text>
		</mix-list-input>
		<mix-list-cell title="配送到家" :tips="delivery.minPrice+'元起送'" @eventClick="navTo('/pages/admin/set/delivery')" v-if="deliveryTypes.indexOf('deliveryHome') != -1"></mix-list-cell>
		<mix-list-checkbox title="开启打印机" field="isPrint" :defContent="isPrint" @change="changeField"></mix-list-checkbox>
		<mix-list-cell v-if="isPrint" title="打印终端" :tips="printersName" @eventClick="navTo('/pages/admin/set/printer/list')"></mix-list-cell>
		<mix-list-cell title="页面配置" @eventClick="navTo('/pages/admin/set/pages')" tips="首页"></mix-list-cell>
		<mix-list-select border="b-b" @eventClick="changeCurrency" title="货币" :options="currencys" :defaultOption="currency"></mix-list-select>
		<mix-list-input v-if="currency!='cny'" title="兑人民币汇率" :defContent="exchangeRate" field="exchangeRate" placeholder="请输入兑人民币汇率"
		 @blur="changeExchangeRate"></mix-list-input>
		<mix-list-input title="退换货周期" type="digit" :defContent="refund.days" field="refund.days" placeholder="请输入退换货周期" @blur="changeFieldNumber">
			<text class="moreText">天</text></mix-list-input>
		<mix-list-checkbox title="收货后退货" field="refund.afterReceived" :defContent="refund.afterReceived" @change="changeField"></mix-list-checkbox>
		<mix-list-checkbox title="启用优惠券" field="coupons.enable" :defContent="coupons.enable" @change="changeField"></mix-list-checkbox>
		<block v-if="coupons.enable">
			<mix-list-input title="优惠券标题" :defContent="coupons.title" field="coupons.title" placeholder="请输入优惠券标题" @blur="changeField"></mix-list-input>
			<mix-list-input title="占用位置" type="digit" :defContent="coupons.index" field="coupons.index" placeholder="请输入占用分类位置"
			 @blur="changeFieldNumber"></mix-list-input>
			<cloud-image title="优惠券入口图标" tips="最佳尺寸100*100" :value="coupons.icon" field="coupons.icon" @input="changeField"></cloud-image>
		</block>
		<mix-list-cell title="订单评论标签" @eventClick="navTo('/pages/admin/set/comment/tags')" :tips="tagResult"></mix-list-cell>
		<mix-list-cell title="店铺服务宗旨" @eventClick="navTo('/pages/admin/set/service')" :tips="serviceResult"></mix-list-cell>
		<mix-list-cell title="开分店" @eventClick="navTo('/pages/admin/set/copy')" tips="设置分类/商品/文档/广告"></mix-list-cell>
		<mix-list-checkbox title="视频功能" field="video" :defContent="video" @change="changeField"></mix-list-checkbox>
		<mix-list-checkbox title="是否启用" tips="店铺经营开关" field="state" :defContent="state" @change="changeField"></mix-list-checkbox>
	</view>
</template>
<script>
	import {
		shopAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				src: "",
				name: "",
				address: "",
				addressFull: "",
				phone: "",
				notice: "",
				delivery: {},
				serviceTime: "",
				deliveryTypeMap: {
					deliveryHome: "配送到家",
					selfRaising: "到店/自提点自提"
				},
				deliveryTypes: [],
				isPrint: false,
				state: false,
				video: false,
				goodsCommentTags: [],
				printers: [],
				printersName: "",
				exchangeRate: 1,
				selfRaisingPoint: false,
				selfRaising: {
					enable: false,
					distance: 5000
				},
				hasCoupons: false,
				coupons: {},
				lastPayTimeMinute: 5,
				refund: {
					days: 7,
					afterReceived: false
				},
				yudingLastPayTimeMinute: 30,
				currency: "cny",
				currencys: {
					cny: "￥人民币",
					aud: "A$澳币",
					usd: "$美金",
					cad: "C$加拿大元",
					eur: "€欧元",
					nzd: "NZ$新西兰元",
					jpy: "JP¥日元",
					krw: "₩韩元",
					gbp: "£英镑",
				},
			}
		},
		onLoad() {
			this.loadData();
		},
		computed: {
			tagResult() {
				if (this.goodsCommentTags && this.goodsCommentTags.length > 0) {
					return this.goodsCommentTags.slice(0, 3).join(",") + "...";
				}
				return "未设置"
			},
			serviceResult(){
				if (this.services && this.services.length > 0) {
					return this.services.slice(0, 3).join(",") + "...";
				}
				return "未设置"
			}
		},
		methods: {
			async loadData() {
				let info = uni.getStorageSync('adminShopInfo');
				for (let i in info) {
					this[i] = info[i];
				}
				let names = [];
				if (this.printers) {
					this.printers.map((e, index) => {
						if (e.enable) {
							names.push(e.name);
						}
					});
				}
				if (names.length == 0) {
					names.push("无可用终端")
				}
				this.printersName = names.join("\n")
			},
			changeName(e) {
				if (e.trim() == "") {
					this.$api.msg("店铺名称不能为空");
					return false;
				}
				if (e != this.name) {
					this.name = e;
					this.save({
						name: e,
					})
				}
			},
			changePhone(e) {
				if (e != this.phone) {
					this.phone = e;
					this.save({
						phone: e,
					})
				}
			},
			changeNotice(e) {
				if (e != this.notice) {
					this.notice = e;
					this.save({
						notice: e,
					})
				}
			},
			changeServiceTime(e) {
				if (e != this.serviceTime) {
					this.serviceTime = e;
					this.save({
						serviceTime: e
					})
				}
			},
			changeFieldNumber(e, field) {
				if (e != this[field]) {
					this[field] = +e;
					this.save({
						[field]: this[field],
					})
				}
			},
			/**
			 * 输入字段自动填充data，并自动保存
			 * @param {Object} val
			 * @param {Object} field
			 */
			changeField(val, field) {
				console.log(val, field)
				let fs = field.split(".");
				if (fs.length == 1) {
					if (val !== this[field]) {
						this[field] = val;
						this.save({
							[field]: this[field],
						})
					}
				} else if (fs.length == 2) {
					if (!this[fs[0]]) {
						this[fs[0]] = {};
					}
					if (this[fs[0]][fs[1]] !== val) {
						this[fs[0]][fs[1]] = val;
						this.save({
							[field]: this[fs[0]][fs[1]],
						})
					}
				}
			},
			changeExchangeRate(e) {
				if (e != this.exchangeRate) {
					if (this.currency == "cny") {
						e = 1;
					}
					this.exchangeRate = +e;
					this.save({
						exchangeRate: this.exchangeRate,
					})
				}
			},
			/**
			 * 切换店铺货币
			 * @param {Object} e
			 */
			changeCurrency(e) {
				if (e != this.currency) {
					this.currency = e;
					if (this.currency == "cny") {
						this.exchangeRate = 1;
					}
					this.save({
						exchangeRate: this.exchangeRate,
						currency: this.currency
					});
				}
			},
			changeAddress(e) {
				uni.chooseLocation({
					success: data => {
						let noNeedName = ["我的位置", "地图位置"];
						console.log(data, noNeedName.indexOf(data.name))
						if (noNeedName.indexOf(data.name) > -1) {
							this.$api.msg("所选地址无效");
							console.log("地址无效")
							return;
						}
						this.address = data.address;
						this.save({
							address: data.address,
							addressName: data.name,
							latitude: data.latitude,
							longitude: data.longitude,
						})
					}
				});
			},
			changeDeliveryTypes(e) {
				this.deliveryTypes = e.detail.value;
				this.save({
					deliveryTypes: e.detail.value
				})
			},
			changeAvatar() {
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album'], //从相册选择
					success: function(res) {
						console.log(res);
						if (res.tempFilePaths.length > 0) {
							uni.setStorage({
								key: 'avatar',
								data: res.tempFilePaths[0]
							});
							uni.navigateTo({
								url: '/pages/userinfo/avatar'
							});
						}
					}
				});
			},
			changePrinter(e) {
				console.log(e)
				this.isPrint = !!e.detail.value;
				this.save({
					isPrint: this.isPrint
				});
			},
			refreshFile(file) {
				this.src = file;
				this.save({
					src: file
				});
			},
			navTo(url) {
				uni.navigateTo({
					url: url
				})
			},
			save(data) {
				shopAdmin("save", data, true).then(res => {
					this.$api.success("修改成功");
					setTimeout(() => {
						//上一个页面刷新
						try {
							this.$api.prePage().refreshList();
						} catch (e) {
							//TODO handle the exception
						}
					}, 2000)
				}, err => {
					this.$api.msg("修改失败");
				})
			},
			refreshList() {
				this.loadData();
				//this.$api.prePage().refreshList();
			}
		}
	}
</script>

<style lang="scss" scoped>
	.container {
		padding-bottom: 40rpx;
	}

	.icon .mix-list-cell.b-b:after {
		left: 90upx;
	}

	.mix-list-cell {
		display: flex;
		align-items: baseline;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;
		background: #FFFFFF;

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
				color: $font-color-light;
			}
		}

		.cell-tip {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
		}
	}

	.m-r {
		margin-right: 16upx;
	}

	.portrait {
		width: 80rpx;
		height: 80rpx;
		border-radius: 10rpx;
	}

	.moreText {
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		margin-left: 4rpx;
	}

	.sub-menu {}
</style>

<template>
	<view class="container">
		<mix-list-avatar title="店铺logo" field="src" :defContent="src" @change="changeField"></mix-list-avatar>
		<mix-list-avatar title="营业执照" :needCut="false" field="business_license" size="lg" :defContent="business_license"
			@change="changeField">
		</mix-list-avatar>
		<mix-list-avatar title="食品经营许可" :needCut="false" field="food_license" size="lg" :defContent="food_license"
			@change="changeField">
		</mix-list-avatar>
		<mix-list-input title="名称" :defContent="name" placeholder="请输入名称" @blur="changeName"></mix-list-input>
		<mix-list-cell title="地址" navigateType="address" :tips="address" @eventClick="changeAddress()"></mix-list-cell>
		<mix-list-input title="电话" type="number" :defContent="phone" placeholder="请输入电话" @blur="changePhone">
		</mix-list-input>
		<mix-list-input title="公告" :defContent="notice" placeholder="请输入公告" @blur="changeNotice"></mix-list-input>
		<mix-list-input title="营业时间" :defContent="serviceTime" placeholder="请输入营业时间" @blur="changeServiceTime">
		</mix-list-input>
		<mix-list-checkbox title="配送方式" field="deliveryTypes" type="checkbox" :defaultOptions="deliveryTypes"
			:options="deliveryTypeMap" @change="changeField"></mix-list-checkbox>

		<button class="fixed-add-btn" @click="submit">提交申请</button>
	</view>
</template>
<script>
	import {
		shopAdmin
	} from '@/common/admin_request.js';
	const db = uniCloud.database();
	const dbName = "cloud_shop_apply"
	export default {
		data() {
			return {
				formData: {},
				src: "",
				name: "",
				address: "",
				business_license: "",
				food_license: "",
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
			serviceResult() {
				if (this.services && this.services.length > 0) {
					return this.services.slice(0, 3).join(",") + "...";
				}
				return "未设置"
			}
		},
		methods: {
			async loadData() {},
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
						this.address = data.name;
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
				this.formData = Object.assign(this.formData, data)
				console.log("this.formData", this.formData)
				/* shopAdmin("save", data, true).then(res => {
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
				}) */
			},
			submit() {
				let fields = ["address", "name", "business_license", "phone", "deliveryTypes"]
				//验证名称，营业执照必填  state=false
				let enable = fields.map(e => !!this.formData[e]).filter(e => !e);
				if (enable.length > 0) {
					this.$api.msg("资料不全");
					return;
				}
				uni.showLoading({
					title: "提交中"
				})
				this.formData.state = 1;
				db.action("genId").collection(dbName).add(this.formData).then(res => {
					this.$api.success("申请成功");
					setTimeout(() => {
						uni.navigateBack({

						})
						uni.hideLoading()
					}, 2000)
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

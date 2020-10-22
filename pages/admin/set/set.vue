<template>
	<view class="container">
		<view class="mix-list-cell b-b" @click="changeAvatar" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">图标</text>
			<view class="cell-content content-right">
				<image class="portrait" :src="src"></image>
			</view>
		</view>
		<mix-list-input title="名称" :defContent="name" placeholder="请输入名称" @blur="changeName"></mix-list-input>
		<mix-list-cell title="地址" navigateType="address" :tips="address" @eventClick="changeAddress()"></mix-list-cell>
		<mix-list-input title="电话" :defContent="phone" placeholder="请输入电话" @blur="changePhone"></mix-list-input>
		<mix-list-input title="公告" :defContent="notice" placeholder="请输入公告" @blur="changeNotice"></mix-list-input>
		<mix-list-input title="营业时间" :defContent="serviceTime" placeholder="请输入营业时间" @blur="changeServiceTime"></mix-list-input>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">配送方式</text>
			<view class="cell-content content-right">
				<checkbox-group name="deliveryTypes" @change="changeDeliveryTypes">
					<label class="m-r">
						<checkbox value="deliveryHome" :checked="deliveryTypes.indexOf('deliveryHome') != -1" />
						<text>配送到家</text>
					</label>
					<label>
						<checkbox value="selfRaising" :checked="deliveryTypes.indexOf('selfRaising') != -1" />
						<text>到店自提</text>
					</label>
				</checkbox-group>
			</view>
		</view>
		<mix-list-cell title="配送到家" :tips="delivery.minPrice+'元起送'" @eventClick="navTo('/pages/admin/set/delivery')" v-if="deliveryTypes.indexOf('deliveryHome') != -1"></mix-list-cell>
		<view class="mix-list-cell b-b" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit">是否开启打印机</text>
			<view class="cell-content content-right">
				<switch :checked="isPrint" @change="changePrinter" />
			</view>
		</view>
		<mix-list-cell v-if="isPrint" title="打印终端" :tips="printersName" @eventClick="navTo('/pages/admin/set/printer/list')"></mix-list-cell>
		<mix-list-cell title="页面配置" @eventClick="navTo('/pages/admin/set/pages')" tips="首页"></mix-list-cell>
		<mix-list-cell title="订单评论标签" @eventClick="navTo('/pages/admin/set/comment/tags')" tips=""></mix-list-cell>
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
				delivery:{},
				serviceTime: "",
				deliveryTypes: [],
				isPrint: false,
				printers: [],
				printersName: "",
			}
		},
		onLoad() {
			this.loadData();
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
						this.$api.prePage().refreshList();
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
	.container{
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

	.sub-menu {}
</style>

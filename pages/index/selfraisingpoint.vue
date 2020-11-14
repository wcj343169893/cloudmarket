<template>
	<view class="container">
		<view class="location">
			<view class="left">
				<view class="">
					<text>当前位置</text>
				</view>
				<view class="">
					<text class="taobaofont icon-locationfill"></text><text>{{location.name}}</text>
				</view>
			</view>
			<view class="more">
				<button type="default" @click="chooseLocation">修改地址</button>
			</view>
		</view>
		<takeaddressPage :dataList="selectedAddress"></takeaddressPage>
		<view class="title">
			<text>当前定位附近的自提点</text>
		</view>
		<block v-if="loaded">
			<takeaddressPage :dataList="nearestData" v-if="nearestData.length>0" @change="setSelfRaisingPoint"></takeaddressPage>
			<view class="empty_address" v-else>
				<image src="/static/store-face.png" class="img" mode="aspectFit"></image>
				<text>当前定位1公里范围内，没有自提点~</text>
				<text>可用切换其他地址看看~</text>
				<!-- <text>或申请成为该位置的团长，足不出户，轻松赚钱！</text>
				<button type="primary" class="button">我要成为团长</button> -->
			</view>
		</block>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import takeaddressPage from './components/takeaddress.vue';
	import {
		cloudMall,
		cloudUser,
	} from '@/common/request.js';
	import {
		mapDistance
	} from '@/common/functions.js';
	export default {
		components: {
			takeaddressPage
		},
		data() {
			return {
				selectedAddress: [],
				nearestData: [],
			};
		},
		onLoad() {
			this.loadData();
		},
		computed: {
			...mapState(['raisingPoint', 'location'])
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		methods: {
			...mapMutations(["setStateAttr"]),
			async loadData() {
				this.page++;
				this.loaded = false;
				cloudMall("selfraising", "nearest", {
					page: this.page,
					limit: this.limit,
					latitude: this.location.latitude,
					longitude: this.location.longitude
				}).then(res => {
					//this.nearestData = res;
					let fromLats = [];
					res.map(addr => {
						fromLats.push([addr.latitude, addr.longitude].join(","))
					})
					//计算距离
					mapDistance(fromLats.join(";"), [this.location.latitude,
							this.location.longitude
						].join(","))
						.then(res1 => {
							res.forEach((addr, index) => {
								addr.isChecked = addr._id == this.raisingPoint._id;
								addr.juli = Number(res1[index].elements[0].distance)
							})
							this.nearestData = this.nearestData.concat(res);
							this.loaded = true;
						})
					if (res.length < this.limit) {
						this.loadingType = 'noMore';
					}
				}, err => {
					this.loaded = true;
					this.loadingType = 'noMore';
				})
				if (this.raisingPoint._id) {
					//计算距离
					mapDistance([this.raisingPoint.latitude, this.raisingPoint.longitude].join(","), [this.location.latitude,
							this.location.longitude
						].join(","))
						.then(res => {
							let juli = Number(res[0].elements[0].distance);
							this.selectedAddress = [{
								...this.raisingPoint,
								juli: juli,
								isChecked: true
							}]
						})
				}
			},
			//地图选择地址
			chooseLocation() {
				uni.chooseLocation({
					success: data => {
						let noNeedName = ["我的位置", "地图位置"];
						console.log(data, noNeedName.indexOf(data.name))
						if (noNeedName.indexOf(data.name) > -1) {
							this.$api.msg("所选地址无效");
							console.log("地址无效")
							return;
						}
						this.setStateAttr({
							location: {
								name: data.address,
								latitude: data.latitude,
								longitude: data.longitude,
							}
						})
						console.log(this.location)
					}
				});
			},
			setSelfRaisingPoint(item) {
				cloudUser("info", "setSelfRaisingPoint", {
					raisingPoint: item
				}, true).then(res => {
					this.nearestData.forEach(addr => {
						addr.isChecked = false;
					})
					item.isChecked = true;
					console.log(res)
					this.setStateAttr({
						raisingPoint: items
					})
					this.selectedAddress = [item]
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	page,
	.container {
		background: $background-color;
		font-size: $font-base;
		height: 100%;
	}

	.location {
		display: flex;
		align-items: center;
		padding: 20rpx;

		.left {
			flex: 1;
		}
	}

	.title {
		padding: 20rpx;
		font-size: $font-base;
	}

	.empty_address {
		margin: 0rpx 20rpx 0;
		border-radius: 20rpx;
		background: #FFFFFF;
		display: flex;
		flex-direction: column;
		align-items: center;
		font-size: $font-sm;
		color: $font-color-light;
		padding: 50rpx 20rpx 50rpx;
		line-height: 50rpx;

		.img {
			width: 120rpx;
			height: 120rpx;
			margin-bottom: 50rpx;
		}

		.button {
			margin-top: 50rpx;
		}
	}
</style>

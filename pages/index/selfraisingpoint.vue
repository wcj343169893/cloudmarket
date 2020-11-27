<template>
	<view class="container">
		<view class="cu-list menu solid-bottom">
			<view class="cu-item">
				<view class="content padding-tb-sm">
					<view>
						<text class="">当前位置</text>
					</view>
					<view class="text-gray text-sm">
						<text class="cuIcon-location margin-right-xs"></text>
						<text>{{location.name}}</text>
					</view>
				</view>
				<view class="action">
					<button class="cu-btn bg-green" @click="chooseLocation">修改地址</button>
				</view>
			</view>
		</view>
		<takeaddressPage :dataList="selectedAddress"></takeaddressPage>
		<view class="cu-bar bg-white solid-bottom margin-top">
			<view class="action">
				<text>当前定位附近的自提点</text>
			</view>
		</view>
		<block v-if="loaded">
			<takeaddressPage :dataList="nearestData" v-if="nearestData.length>0" @change="setSelfRaisingPoint"></takeaddressPage>
			<view class="flex flex-column align-center bg-white padding-xl " v-else>
				<text>当前定位{{selfraisingDistance | formatDistance}}范围内，</text>
				<text class="margin-top-xs">没有自提点</text>
				<text class="margin-top-xs">可用切换其他地址看看</text>
				<block v-if="applyTuanZhang">
					<text class="margin-top-xs">或申请成为该位置的团长，</text>
					<text class="margin-top-xs">足不出户，轻松赚钱！</text>
					<button class="cu-btn bg-green margin-top" @click="navTo('/pages/selfraisingpoint/add')">我要成为团长</button>
				</block>
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
			...mapState(['raisingPoint', 'location']),

			applyTuanZhang() {
				if (!this.$config.selfRaising) {
					return false;
				}
				return this.$config.selfRaising.apply;
			},
			selfraisingDistance() {
				if (!this.$config.selfRaising) {
					return 1000;
				}
				return this.$config.selfRaising.distance;
			}
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
				if (this.page == 1) {
					this.nearestData = [];
				}
				cloudMall("selfraising", "nearest", {
					page: this.page,
					limit: this.limit,
					distance: this.selfraisingDistance,
					latitude: this.location.latitude,
					longitude: this.location.longitude
				}).then(res => {
					res.forEach(addr => {
						addr.isChecked = this.raisingPoint && addr._id == this.raisingPoint._id;
						addr.juli = "";
					})
					this.nearestData = this.nearestData.concat(res);
					this.loaded = true;
					if (res.length < this.limit) {
						this.loadingType = 'noMore';
					}
					this.getMapDistance();
				}, err => {
					this.loaded = true;
					this.loadingType = 'noMore';
					if (this.page == 1) {
						this.getMapDistance();
					}
				})
				if (this.raisingPoint._id) {
					this.selectedAddress = [{
						...this.raisingPoint,
						juli: "",
						isChecked: true
					}]
				}
			},
			getMapDistance() {
				if (!this.location.latitude || !this.location.longitude) {
					return;
				}
				let fromLats = [];
				if (this.raisingPoint._id) {
					fromLats.push([this.raisingPoint.latitude, this.raisingPoint.longitude].join(","));
				}
				this.nearestData.map(addr => {
					fromLats.push([addr.latitude, addr.longitude].join(","))
				})
				let index = 0;
				//计算距离
				mapDistance(fromLats.join(";"), [this.location.latitude,
						this.location.longitude
					].join(","))
					.then(res1 => {
						if (this.raisingPoint._id) {
							this.selectedAddress[0].juli = Number(res1[index].elements[0].distance);
							index++;
						}
						this.nearestData.forEach((addr) => {
							addr.juli = Number(res1[index].elements[0].distance)
							index++;
						})
					})
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
								name: data.name || data.address,
								latitude: data.latitude,
								longitude: data.longitude,
							}
						})
						this.page = 0;
						this.loadData();
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
						raisingPoint: item
					})
					this.$api.success("设置提货点成功")
					this.selectedAddress = [item]
					this.navTimeBack();
				})
			}
		}
	}
</script>

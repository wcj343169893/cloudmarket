<template>
	<view class="">
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view class="cu-list menu-avatar">
			<view class="cu-item" v-for="(item,index) in dataList" :key="index">
				<image class="cu-avatar round lg" :src="item.src" mode="aspectFill"></image>
				<view class="content">
					<view class="text-black">
						<text>{{ item.name }}</text>
						<text class="margin-left-sm cuIcon-phone" v-if="item.mobile" @click="tel(item.mobile)"></text>
						<text class="margin-left-sm text-sm text-gray" v-if="item.juli">{{item.juli | formatDistance}}</text>
					</view>
					<view class="text-gray text-sm flex flex-direction">
						<view class="text-cut">
							<text class="cuIcon-addressbook margin-right-xs"></text>
							<text>{{ item.address }}</text>
						</view>
					</view>
				</view>
				<view class="flex align-center margin-right-xs">
					<!-- <button class="cu-btn bg-green sm " @click="change(item)">下载订单</button> -->
				</view>
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
		adminNetwork,
	} from '@/common/admin_request.js';
	import {
		mapDistance
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				dataList: []
			};
		},
		onLoad() {
			this.loadData()
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		methods: {
			async loadData() {
				let info = uni.getStorageSync('adminShopInfo');
				this.page++;
				this.loaded = false;
				adminNetwork("selfraising", "nearest", {
					page: this.page,
					limit: this.limit,
					latitude: info.latitude,
					longitude: info.longitude
				}).then(res => {
					let fromLats = [];
					res.map(addr => {
						fromLats.push([addr.latitude, addr.longitude].join(","))
					})
					//计算与店铺的距离
					mapDistance(fromLats.join(";"), [info.latitude,
							info.longitude
						].join(","))
						.then(res1 => {
							res.forEach((addr, index) => {
								addr.juli = Number(res1[index].elements[0].distance)
							})
							this.dataList = this.dataList.concat(res);
							this.loaded = true;
						})
					if (res.length < this.limit) {
						this.loadingType = 'noMore';
					}
				}, err => {
					this.loaded = true;
					this.loadingType = 'noMore';
				})
			},
			tel(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},
		}
	}
</script>

<style lang="scss">

</style>

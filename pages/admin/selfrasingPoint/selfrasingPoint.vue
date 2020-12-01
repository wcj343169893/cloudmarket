<template>
	<view class="">
		<empty v-if="loaded === true && dataList.length === 0"></empty>
		<view class="cu-list custom">
			<view class="panel" v-for="(item,index) in dataList" :key="index">
				<view class="cu-item" @click="navToLocation(item)">
					<image class="cu-avatar round lg" :src="item.src" mode="aspectFill"></image>
					<view class="content">
						<view class="text-black">
							<text>{{ item.name }}</text>
							<text class="margin-left-sm" v-if="item.mobile" @click.stop="tel(item.mobile)">{{item.mobile}}</text>
							<block v-if="item.commission">
								<text class="margin-left-sm">佣金</text>
								<text class="price">{{item.commission}}</text>
							</block>

						</view>
						<view class="text-gray text-sm flex flex-direction">
							<view class="text-desc">
								<text class="cuIcon-addressbook margin-right-xs"></text>
								<text>{{ item.address }}</text>
								<text class="margin-left-sm text-sm text-gray" v-if="item.juli">{{item.juli | formatDistance}}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="buttons">
					<button v-if="!item.state" class="cu-btn bg-red sm " @click="approved(item,index)">审核通过</button>
					<block v-else>
						<button class="cu-btn bg-red sm " @click="approved(item,index)"><text>分成比例</text><text class="margin-left-xxs text-white"
							 v-if="item.rate">{{item.rate}}%</text></button>
						<button class="cu-btn bg-olive sm " @click="download(item,index,1)"><text>待发货</text><text class="margin-left-xxs text-white"
							 v-if="item.rate">{{item.payup}}</text></button>
						<button class="cu-btn bg-cyan sm " @click="download(item,index,2)"><text>已发货</text><text class="margin-left-xxs text-white"
							 v-if="item.rate">{{item.delivered}}</text></button>
						<button class="cu-btn bg-orange sm " @click="delivery(item,index)"><text>一键发货</text><text class="margin-left-xxs text-white"
							 v-if="item.rate">{{item.payup}}</text></button>
					</block>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
		<uni-popup ref="ratePopup" type="dialog">
			<uni-popup-dialog mode="input" title="设置分成比例" placeholder="请输入分成比例" type="input" message="成功消息" :duration="2000"
			 @confirm="confirmRatePopup"></uni-popup-dialog>
		</uni-popup>
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
	import uniPopup from '@/components/uni-popup/uni-popup.vue'
	import uniPopupMessage from '@/components/uni-popup/uni-popup-message.vue'
	import uniPopupDialog from '@/components/uni-popup/uni-popup-dialog.vue'
	export default {
		components: {
			uniPopup,
			uniPopupMessage,
			uniPopupDialog
		},
		data() {
			return {
				dataList: [],
				item: false,
				index: 0,
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
			approved(item, index) {
				this.item = item;
				this.index = index;
				this.$refs.ratePopup.open()
			},
			confirmRatePopup(done, val) {
				if (val > 80) {
					this.$api.msg("分成比例太大");
					return false;
				}
				done();
				if (val < 0) {
					val = 0
				}
				let rate = +val;
				adminNetwork("selfraising", "approved", {
					id: this.item._id,
					rate
				}).then(res => {
					this.dataList[this.index].state = 1;
					this.dataList[this.index].rate = rate;
					this.$api.success("修改成功")
				});
			},
			navToLocation(shop) {
				uni.openLocation({
					name: shop.name,
					address: shop.address,
					latitude: shop.latitude,
					longitude: shop.longitude,
					success: function() {
						console.log('success');
					}
				});
			},
			download(item, index, state) {
				let domain = uni.getStorageSync("web_domain");
				let url = `${domain}/databases/exports/selfraising?id=${item._id}&state=${state}`;
				console.log(url)
				//#ifdef APP-PLUS
				uni.setClipboardData({
					data: url,
					success: () => {
						this.$api.success('下载地址已复制')
					}
				});
				//#endif
				//#ifdef H5
				// window.open(url);
				//#endif
			},
			delivery(item, index) {
				uni.showModal({
					title: "发货提醒",
					content: "是否已经下载订单？",
					success: (res) => {
						if (res.confirm) {
							adminNetwork("orders", "selftakebyraising", {
								id: item._id
							}).then(res => {
								if (res.updated > 0) {
									this.$api.success(`发货成功${res.updated}单`);
									this.dataList[this.index].delivered = item.payup + item.delivered;
									this.dataList[this.index].payup = 0;
								} else {
									this.$api.msg("没有订单")
								}
							});
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss">
</style>

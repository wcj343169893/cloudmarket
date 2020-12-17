<template>
	<view>
		<view class="bg-white padding-sm flex">
			<image :src="user.avatar" mode="aspectFill" class="cu-avatar round"></image>
			<view class="margin-left-sm ">
				<text class="">{{ user.nickname }}</text>
				<view class="text-sm align-center flex">
					<text class="taobaofont icon-likefill"></text>
					<text>{{ user.like | formatNumber }}</text>
					<text class="margin-left-sm">播放{{ user.play | formatNumber }}次</text>
				</view>
			</view>
		</view>
		<view class="videos">
			<view v-for="(item, index) in dataList" :id="'main_' + item.id" :key="index" class="padding-sm bg-white margin-sm video-item">
				<view class="video-section">
					<video v-if="item.loaded" :id="item.id" class="video" :show-center-play-btn="showCenterPlayBtn" :object-fit="objectFit"
					 :src="item.url" :loop="loop" :poster="item.poster" :controls="false" :enable-play-gesture="true" controls
					 @loadedmetadata="loadedmetadata(item, index)" @play="play(item, index)" @waiting="waiting(item, index)"
					 @fullscreenclick="fullscreenclick(item, index)" @ended="ended(item, index)" @pause="pause(item, index)" @error="error(item, index)"
					 @click="clickPause(item, index)"></video>
					<!-- <cover-image v-if="!item.play" src="/static/play.png" class="btn-play" @click="clickPause(item, index)"></cover-image> -->
					<!-- <text v-if="!item.play" class="taobaofont icon-playfill text-white text-xxl btn-play" @click="clickPause(item, index)"></text> -->
				</view>
				<view class="bottom margin-top-sm">
					<text>{{ item.title }}</text>
					<text class="text-sm margin-left-sm">{{ item.statistics.play | formatNumber }}次播放</text>
				</view>
				<view class="flex align-center justify-between margin-top-sm">
					<view class="header flex-sub flex align-center " v-if="item.goods && item.goods._id" @click="navToGoodsPage(item.goods)">
						<image :src="item.goods.src" mode="aspectFill" class="cu-avatar round"></image>
						<view class="margin-left-sm flex flex-column flex-sub">
							<text>{{ item.goods.title }}</text>
							<text class="text-sm">{{ item.goods.subTitle }}</text>
						</view>
					</view>
					<view class="" v-else>
					</view>
					<view class="state margin-top-xs align-center margin-left-sm" @click="like(item)">
						<text class="margin-left-sm taobaofont icon-likefill" :class="{'text-red':item.isLike}"></text>
						<text class="margin-left-xxs">{{ item.statistics.like | formatNumber }}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		cloudVideo
	} from '@/common/request.js';
	import {
		navToGoodsItemPage,
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				user: {
					_id: "",
					avatar: "",
					nickname: "",
					play: 0,
					like: 0
				},
				first: {},
				showCenterPlayBtn: true,
				objectFit: 'cover',
				loop: true,
				dataList: [],
				videoContentList: []
			};
		},
		onLoad() {
			this.init();
			this.loadData();
		},
		onHide() {
			this.pauseAll();
		},
		//下拉刷新,不会更新底部附近的店铺
		onPullDownRefresh() {
			//this.loadData('refresh');
			console.log('刷新整页');
			uni.stopPullDownRefresh();
			this.page = 0;
			this.loadData();
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		methods: {
			init() {
				this.getItemData(true);
				//#ifdef APP-PLUS
				this.showCenterPlayBtn = true;
				this.scrollWithAnimation = false;
				if (this.systemInfo.platform == 'ios') {
					this.objectFit = 'fill';
				}
				//#endif
				this.videoContentList = [];
				this.dataList = [];
				this.loadUser();
			},
			async loadUser() {
				cloudVideo("info", "user", {
					shopid: this.shopId,
					id: this.user._id,
				}).then(res => {
					console.log(res)
					this.user.play = res.play;
					this.user.like = res.like;
				});
			},
			async loadData() {
				this.loadingType = "loading";
				this.page++;
				cloudVideo("info", "square", {
					shopid: this.shopId,
					vuid: this.user._id,
					page: this.page,
					limit: this.limit,
					extIds: [this.first._id]
				}).then(res => {
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					} else {
						this.loadingType = "more";
					}
					this.buildData(res, this.page)
				}, err => {
					this.loadingType = "noMore";
					this.buildData([], this.page)
				});
			},
			navToGoodsPage(item) {
				console.log("navToGoodsPage main")
				navToGoodsItemPage(item);
			},
			/**
			 * 跳转用户视频列表
			 * @param {Object} item
			 */
			navToUserPage(item) {
				this.navToItem("/pages/video/list", {
					user: item.user
				})
			},
			buildData(data, page) {
				if (page == 1) {
					this.videoContentList = [];
					this.dataList = [];
					if (this.first._id) {
						data.unshift(this.first);
					}
				}
				if (data.length < 1) {
					return false;
				}
				data.forEach((ele, index) => {
					ele.id = 'video_' + index;
					ele.play = false;
					ele.loaded = false;
					ele.loadTimes = 1;
					ele.top = 0;
					ele.bottom = 0;
					ele.poster = this.getPosterUrl(ele);
				});

				this.dataList = this.dataList.concat(data);
				this.loadOthers((page - 1) * this.limit);
				data.map(ele => {
					this.videoContentList.push(uni.createVideoContext(ele.id));
				});
				if (page == 1) {
					this.$nextTick(() => {
						this.videoContentList[0].play();
					});
				}
			},
			loadOthers(index) {
				if (index < this.dataList.length) {
					this.dataList[index].loaded = true;
				}
				setTimeout(() => {
					this.loadOthers(index + 1);
				}, 1000);
			},
			getPosterUrl(item) {
				if (item.poster) {
					return item.poster;
				}
				if (item.url.indexOf('bspapp.com') > 0) {
					return item.url + '?x-oss-process=video/snapshot,t_1000,f_jpg,w_750,m_fast';
				}
				return '';
			},
			error(item, index) {
				//this.$api.msg('错误' + item.loadTimes);
				item.loaded = false;
				item.loadTimes++;
				if (item.loadTimes > 2) {
					return false;
				}
				setTimeout(() => {
					item.loaded = true;
				}, 1000);
			},
			ended(item, index) {
				console.log('ended', index);
			},
			play(item, index) {
				item.play = true;
				console.log('play', index);
				this.videoContentList.forEach((video, i) => {
					if (index != i) {
						video.pause();
						if (this.dataList[i]) {
							this.dataList[i].play = false;
						}
					}
				});
				if (!item.isPlay) {
					cloudVideo("info", "play", {
						id: item._id
					}).then(res => {}, err => {});
					item.isPlay = true;
				}
			},
			like(item) {
				cloudVideo("info", "like", {
					id: item._id,
				}).then(res => {
					item.isLike = res.isLike;
					if (res.isLike) {
						item.statistics.like++
					} else {
						item.statistics.like--
					}
				}, err => {});
			},
			pauseAll() {
				console.log('pauseAll');
				this.videoContentList.forEach((video, i) => {
					video.pause();
				});
			},
			pause(item) {
				item.play = false;
			},
			loadedmetadata(item, index) {
				console.log('loadedmetadata', index);
				if (index < this.dataList.length - 1) {
					this.dataList[index + 1].loaded = true;
				}
			},
			waiting(item, index) {
				console.log('waiting', index);
			},
			fullscreenclick(item, index) {
				console.log('fullscreenclick');
			},
			clickPause(item, index) {
				return false;
				console.log('clickPause', index);
				this.dataList[index].loaded = true;
				if (!item.play) {
					this.pauseAll();
					this.videoContentList[index].play();
				} else {
					this.videoContentList[index].pause();
				}
			},
		}
	}
</script>


<style lang="scss">
	page,
	.container {}

	.videos {}

	.video-item {
		border-radius: 20rpx;
		position: relative;
	}

	.btn-play {
		position: absolute;
		z-index: 999;
		left: calc(50% - 40rpx);
		top: 210rpx;
		border: 2rpx solid #ffffff;
		border-radius: 50%;
		padding: 8rpx 8rpx 8rpx 12rpx;
		width: 80rpx;
		height: 80rpx;
	}

	.video-section {
		position: relative;
		width: 100%;
		height: 600rpx;
		border-radius: 14rpx;
		background: #000000;
		margin-top: 12rpx;
	}

	.video {
		width: 100%;
		height: 600rpx;
		border-radius: 14rpx;
	}
</style>

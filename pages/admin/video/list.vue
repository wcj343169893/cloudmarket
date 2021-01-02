<template>
	<view class="container">
		<!-- <scroll-view scroll-y :scroll-with-animation="scrollWithAnimation" enable-back-to-top class="videos" :scroll-top="tabScrollTop"> -->
		<view class="videos">
			<view v-for="(item, index) in dataList" :id="'main_' + item.id" :key="index" class="padding-sm bg-white margin-sm video-item">
				<view class="header" @click="navToUserPage(item)">
					<image :src="item.user.avatar" mode="aspectFill" class="cu-avatar round"></image>
					<text class="margin-left-sm">{{ item.user.nickname }}</text>
				</view>
				<view class="video-section">
					<video v-if="item.loaded" :id="item.id" class="video" :show-center-play-btn="showCenterPlayBtn" :object-fit="objectFit"
					 :src="item.url" :loop="loop" :poster="item.poster" :controls="false" :enable-play-gesture="true" controls
					 @loadedmetadata="loadedmetadata(item, index)" @play="play(item, index)" @waiting="waiting(item, index)"
					 @fullscreenclick="fullscreenclick(item, index)" @ended="ended(item, index)" @pause="pause(item, index)" @error="error(item, index)"></video>
					<!-- <cover-image v-if="!item.play" src="/static/play.png" class="btn-play" @click="clickPause(item, index)"></cover-image> -->
					<!-- <text v-if="!item.play" class="taobaofont icon-playfill text-white text-xxl btn-play" @click="clickPause(item, index)"></text> -->
				</view>
				<view class="bottom margin-top-sm">
					<text>{{ item.title }}</text>
					<text class="text-sm margin-left-sm">{{ item.statistics.play | formatNumber }}次播放</text>
				</view>
				<view class="flex align-center justify-between margin-top-sm">
					<view class="header flex-sub flex align-center" v-if="item.goods && item.goods._id" @click="navToGoodsPage(item.goods)">
						<image :src="item.goods.src | thumbImg('120x120')" mode="aspectFill" class="cu-avatar round"></image>
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
				<view class="buttons flex align-center justify-end margin-top-sm">
					<button class="action-btn warning" @click.stop="verify(item,index,-1)">拒绝</button>
					<button class="action-btn recom" v-if="item.state == 0" @click.stop="verify(item,index,1)">审核通过</button>
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
		adminNetwork
	} from '@/common/admin_request.js';
	import {
		navToGoodsItemPage,
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				state: false,
				tabs: [{
						title: '推荐'
					},
					{
						title: '关注'
					},
					{
						title: '点赞'
					}
				],
				uid: false,
				showCenterPlayBtn: true,
				objectFit: 'cover',
				tabCurrent: 0,
				tabScrollTop: 0,
				sizeCalcState: false,
				scrollWithAnimation: true,
				loop: true,
				autoNext: false,
				dataList: [],
				videoContentList: []
			};
		},
		watch: {
			shopId(id) {
				console.log('watch 店铺id改变,刷新当前页面', id);
				this.pauseAll();
				this.page = 0;
				this.loadData();
			}
		},
		onLoad(options) {
			this.state = options.state;
			if (options.uid) {
				this.uid = options.uid;
				uni.setNavigationBarTitle({
					title: "他的视频"
				})
			}
			this.init();
			this.loadData();
		},
		onHide() {
			this.pauseAll();
		},
		onShow() {
			this.playAgain();
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
			tabSelect(index) {
				this.tabCurrent = index;
			},
			init() {
				//#ifdef APP-PLUS
				this.showCenterPlayBtn = true;
				this.scrollWithAnimation = false;
				if (this.systemInfo.platform == 'ios') {
					this.objectFit = 'fill';
				}
				//#endif
				this.videoContentList = [];
				this.dataList = [];
			},
			async loadData() {
				this.loadingType = "loading";
				this.page++;
				adminNetwork("video", "list", {
					state: this.state,
					vuid: this.uid,
					page: this.page,
					limit: this.limit
				}).then(res => {
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					} else {
						this.loadingType = "more";
					}
					this.buildData(res, this.page)
				}, err => {
					this.loadingType = "noMore";
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
				if (!this.uid) {
					this.navTo(`/pages/admin/video/list?uid=${item.user._id}&state=${this.state}`)
				}
			},
			buildData(data, page) {
				const {
					windowHeight,
					windowWidth
				} = this.systemInfo;
				//页面的比例
				let winRate = windowWidth / windowHeight;
				data.forEach((ele, index) => {
					ele.id = 'video_' + index;
					ele.play = false;
					ele.loaded = false;
					ele.loadTimes = 1;
					ele.top = 0;
					ele.bottom = 0;
					ele.poster = this.getPosterUrl(ele);
				});

				if (page == 1) {
					this.videoContentList = [];
					this.dataList = data;
					this.dataList[0].loaded = true;
					this.$nextTick(() => {
						this.videoContentList[0].play();
						this.loadOthers(0);
						//this.calcSize();
					});
				} else {
					this.dataList = this.dataList.concat(data);
					this.$nextTick(() => {
						this.loadOthers((page - 1) * this.limit);
					});
				}
				data.map(ele => {
					this.videoContentList.push(uni.createVideoContext(ele.id));
				});
			},
			loadOthers(index) {
				if (index < this.dataList.length - 1) {
					this.dataList[index + 1].loaded = true;
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
				console.log(item);
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
				//自动播放下一个
				if (this.autoNext && index < this.dataList.length - 2) {
					this.videoContentList[index + 1].play();
					this.tabScrollTop = this.dataList[index + 1].top;
					console.log(this.tabScrollTop);
				}
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
			playAgain() {
				this.dataList.map((video, index) => {
					if (video.play) {
						this.videoContentList[index].play();
					}
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
			//计算右侧栏每个tab的高度等信息
			calcSize() {
				let h = 0;
				this.dataList.forEach(item => {
					let view = uni.createSelectorQuery().select('#main_' + item.id);
					view.fields({
							size: true
						},
						data => {
							if (data) {
								item.top = h;
								h += data.height + uni.upx2px(20);
								item.bottom = h;
							}
						}
					).exec();
				});
				this.sizeCalcState = true;
			},
			verify(item, index, state) {
				adminNetwork("video", "verify", {
					state: state,
					id: item._id
				}).then(res => {
					this.$api.success("操作成功");
					if (this.state == "verify") {
						this.dataList.splice(index, 1);
						this.videoContentList.splice(index, 1);
					} else {
						item.state = state;
					}
				}, err => {
					this.$api.msg("操作失败")
				});
			}
		}
	};
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

		.time {
			width: 72upx;
			display: inline-block;
		}

		&:after {
			border-radius: 100px;
		}

		&.recom {
			background: $base-color;
			color: #fff;
		}

		&.warning {
			background: $btn-color-warning;
			color: #fff;
		}
	}
</style>

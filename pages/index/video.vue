<template>
	<view class="container">
		<!-- #ifdef MP -->
		<!-- 顶部栏 -->
		<page-header :showFillView="true" :showLocationView="false"></page-header>
		<!-- #endif -->
		<!-- <scroll-view scroll-y :scroll-with-animation="scrollWithAnimation" enable-back-to-top class="videos" :scroll-top="tabScrollTop"> -->
		<view class="videos">
			<view v-for="(item, index) in dataList" :id="'main_' + item.id" :key="index" class="padding-sm bg-white margin-sm video-item">
				<view class="header">
					<image :src="item.user.avatar" mode="aspectFill" class="cu-avatar round"></image>
					<text class="margin-left-sm">{{ item.user.nickname }}</text>
				</view>
				<view class="video-section">
					<video
						v-if="item.loaded"
						:id="item.id"
						class="video"
						:show-center-play-btn="showCenterPlayBtn"
						:object-fit="objectFit"
						:src="item.url"
						:loop="loop"
						:poster="item.poster"
						:controls="false"
						:enable-play-gesture="true"
						controls
						@loadedmetadata="loadedmetadata(item, index)"
						@play="play(item, index)"
						@waiting="waiting(item, index)"
						@fullscreenclick="fullscreenclick(item, index)"
						@ended="ended(item, index)"
						@pause="pause(item, index)"
						@error="error(item, index)"
						@click="clickPause(item, index)"
					></video>
					<cover-image v-if="!item.play" src="/static/play.png" class="btn-play" @click="clickPause(item, index)"></cover-image>
					<!-- <text v-if="!item.play" class="taobaofont icon-playfill text-white text-xxl btn-play" @click="clickPause(item, index)"></text> -->
				</view>
				<view class="bottom margin-top-sm">
					<text>{{ item.title }}</text>
					<text v-if="item.play">正在播放</text>
				</view>
				<view class="state flex justify-end margin-top-xs align-center">
					<text>{{ item.statistics.play | formatNumber }}次播放</text>
					<text class="margin-left-sm taobaofont icon-likefill text-red"></text>
					<text class="margin-left-xxs">{{ item.statistics.like | formatNumber }}</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import pageHeader from './components/page-header.vue';
export default {
	components: {
		pageHeader
	},
	data() {
		return {
			tabs: [
				{
					title: '推荐'
				},
				{
					title: '关注'
				},
				{
					title: '点赞'
				}
			],
			showCenterPlayBtn: false,
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
	computed: {
		swiperStyle() {
			let height = this.systemInfo.windowHeight;
			return `height:${height}px;`;
		}
	},
	onLoad() {
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
		this.loadData();
	},
	methods: {
		tabSelect(index) {
			this.tabCurrent = index;
		},
		async loadData() {
			//#ifdef APP-PLUS
			this.showCenterPlayBtn = true;
			this.scrollWithAnimation = false;
			//#endif
			if (this.systemInfo.platform == 'ios') {
				this.objectFit = 'fill';
			}
			this.videoContentList = [];
			this.dataList = [];
			let data = [
				{
					duration: 13,
					height: 960,
					size: 3266693,
					url: 'https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200f080000bv5idj84civdn5l69ol0&ratio=720p&line=0',
					poster: 'https://p26-dy.byteimg.com/img/tos-cn-p-0015/d528d10b0f024a3b808b6135bb39eba0~c5_300x400.jpeg?from=2563711402_large',
					width: 544,
					title: '还没见面，就不见面',
					statistics: {
						play: 2343534,
						like: 3455
					},
					user: {
						_id: 'b4f7b7d25fb3775d00b0de4f5d854ee2',
						nickname: '乡村小兵',
						avatar: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598667275028.jpg'
					}
				},
				{
					duration: 5,
					height: 544,
					size: 3266693,
					url: 'http://image.xsyxsc.com/item/utv/20201205/UnoxTg%3D%3D.mp4',
					width: 544,
					title: '还没见面，就不见面',
					statistics: {
						play: 2343534,
						like: 3455
					},
					user: {
						_id: 'b4f7b7d25fb3775d00b0de4f5d854ee2',
						nickname: '乡村小兵',
						avatar: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598667275028.jpg'
					}
				},
				{
					duration: 13,
					height: 960,
					size: 3266693,
					url: 'https://aweme.snssdk.com/aweme/v1/playwm/?video_id=v0200f080000bv5idj84civdn5l69ol0&ratio=720p&line=0',
					poster: 'https://p26-dy.byteimg.com/img/tos-cn-p-0015/d528d10b0f024a3b808b6135bb39eba0~c5_300x400.jpeg?from=2563711402_large',
					width: 544,
					title: '还没见面，就不见面',
					statistics: {
						play: 2343534,
						like: 3455
					},
					user: {
						_id: 'b4f7b7d25fb3775d00b0de4f5d854ee2',
						nickname: '乡村小兵',
						avatar: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598667275028.jpg'
					}
				},
				{
					duration: 13,
					height: 960,
					size: 3266693,
					url: 'http://image.xsyxsc.com/item/utv/20201205/Uno1ZQ%3D%3D.mp4',
					width: 544,
					title: '还没见面，就不见面',
					statistics: {
						play: 2343534,
						like: 3455
					},
					user: {
						_id: 'b4f7b7d25fb3775d00b0de4f5d854ee2',
						nickname: '乡村小兵',
						avatar: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598667275028.jpg'
					}
				},
				{
					duration: 5,
					height: 640,
					size: 3266693,
					url: 'http://image.xsyxsc.com/item/utv/20201205/Uno1cQ%3D%3D.mp4',
					width: 480,
					title: '还没见面，就不见面',
					statistics: {
						play: 23433534,
						like: 34525
					},
					user: {
						_id: 'b4f7b7d25fb3775d00b0de4f5d854ee2',
						nickname: '乡村小兵',
						avatar: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598667275028.jpg'
					}
				},
				{
					duration: 13,
					height: 960,
					size: 3266693,
					url: 'http://image.xsyxsc.com/item/utv/20201205/UnoyRg%3D%3D.mp4',
					width: 544,
					title: '还没见面，就不见面',
					statistics: {
						play: 23435434,
						like: 345566
					},
					user: {
						_id: 'b4f7b7d25fb3775d00b0de4f5d854ee2',
						nickname: '乡村小兵',
						avatar: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598667275028.jpg'
					}
				},
				{
					duration: 5,
					height: 544,
					size: 3266693,
					url: 'http://image.xsyxsc.com/item/utv/20201205/UnoyNg%3D%3D.mp4',
					width: 544,
					title: '还没见面，就不见面',
					statistics: {
						play: 234353498,
						like: 34557778
					},
					user: {
						_id: 'b4f7b7d25fb3775d00b0de4f5d854ee2',
						nickname: '乡村小兵',
						avatar: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/user/images/2020/8/29/1598667275028.jpg'
					}
				}
			];
			console.log(this.systemInfo);
			const { windowHeight, windowWidth } = this.systemInfo;
			//页面的比例
			let winRate = windowWidth / windowHeight;
			data.forEach((ele, index) => {
				ele.id = 'video_' + index;
				ele.play = false;
				ele.loaded = false;
				ele.loadTimes = 1;
				ele.top = 0;
				ele.bottom = 0;
				let vRate = ele.width / ele.height;
				if (ele.width >= ele.height || vRate - winRate > 0.2) {
				} else {
					console.log(winRate + ' ' + vRate);
					if (winRate > vRate) {
						let outHeight = (windowWidth / ele.width) * ele.height;
						console.log('windowWidth', windowWidth);
						ele.style = `width:${windowWidth}px;height:${outHeight}px`;
					} else {
						let outWidth = (ele.width * windowHeight) / ele.height;
						let left = 0;
						if (outWidth > windowWidth) {
							left = (windowWidth - outWidth) / 2;
						} else {
							outWidth = windowWidth;
						}
						ele.style = `width:${outWidth}px;height:${windowHeight}px;left:${left}px`;
					}
				}
				ele.poster = this.getPosterUrl(ele);
			});
			this.dataList = data;
			this.dataList.map(ele => {
				this.videoContentList.push(uni.createVideoContext(ele.id));
			});
			this.dataList[0].loaded = true;
			this.$nextTick(() => {
				this.videoContentList[0].play();
				this.loadOthers(0);
				//this.calcSize();
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
			this.$api.msg('错误' + index);
			item.loaded = false;
			item.loadTimes++;
			if (item.loadTimes > 5) {
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
					this.dataList[i].play = false;
				}
			});
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
				view.fields(
					{
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
		}
	}
};
</script>

<style lang="scss">
page,
.container {
}
.videos {
}
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
	height: 500rpx;
	border-radius: 14rpx;
	background: #000000;
	margin-top: 12rpx;
}

.video {
	width: 100%;
	height: 500rpx;
	border-radius: 14rpx;
}
</style>

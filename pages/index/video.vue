<template>
	<view class="container">
		<cu-custom :tabs="tabs" :current="tabCurrent" @tabClick="tabSelect" :fixed="true"></cu-custom>
		<swiper :vertical="true" :style="swiperStyle" @change="change">
			<swiper-item v-for="(item, index) in dataList" :key="index" style="overflow: hidden;" @click="clickPause(item, index)">
				<video
					class="video"
					:id="item.id"
					:poster-for-crawler="item.poster"
					:poster="item.poster"
					:style="item.style"
					:loop="true"
					:controls="false"
					@play="play(item, index)"
					@pause="pause(item, index)"
					@error="error(item, index)"
					@ended="ended(item, index)"
					@waiting="waiting(item, index)"
					:autoplay="false"
					:show-center-play-btn="false"
					:src="item.url"
				></video>
				<view class="pauseIcon" v-if="item.pause"><text class="taobaofont icon-video_light"></text></view>
				<view class="right">
					<view class="avatar"><image class="image" :src="item.user.avatar" mode="aspectFill"></image></view>
					<view class="like margin-top"><text class="taobaofont icon-likefill"></text></view>
					<view class="like">
						<text>{{ item.statistics.like }}</text>
					</view>
				</view>
				<view class="bottom">
					<view class="playPanel">
						<text class="taobaofont icon-sound"></text>
						<text>{{ item.statistics.play }}次播放</text>
					</view>
					<view class="uname">
						<text>@{{ item.user.nickname }}</text>
					</view>
					<view class="title">
						<text>{{ item.title }}</text>
					</view>
				</view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
export default {
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
			tabCurrent: 0,
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
	methods: {
		tabSelect(index) {
			this.tabCurrent = index;
		},
		async loadData() {
			let data = [
				{
					duration: 13,
					height: 960,
					size: 3266693,
					url: 'https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-btgorwvhvem50683c0/5ffc5e80-3615-11eb-b997-9918a5dda011.mp4',
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
					poster: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods/src/0/5786823106700687.jpg',
					url: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/video/5929447737237924.mp4',
					width: 480,
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
					poster: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods/src/0/5786823106700687.jpg',
					url: 'https://limitao.myuan.cn/gongyong/shangchuan/yinpin/33/2020/05/kiWKkG17OY0522ySS50SiL2NBWNi01.mp4',
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
					poster: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods/src/0/5786823106700687.jpg',
					url: 'https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/video/WeChat_20201203174023.mp4',
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
				}
			];
			console.log(this.systemInfo);
			const { windowHeight, windowWidth } = this.systemInfo;
			//页面的比例
			let winRate = windowWidth / windowHeight;
			data.forEach((ele, index) => {
				ele.id = 'video_' + index;
				ele.pause = true;
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
						console.log(outWidth);
						ele.style = `width:${outWidth}px;height:${windowHeight}px;left:${left}px`;
					}
				}
				ele.poster = this.getPosterUrl(ele);
			});
			this.dataList = data;
			this.$nextTick(() => {
				data.map(ele => {
					this.videoContentList.push(uni.createVideoContext(ele.id));
				});
				setTimeout(() => {
					this.videoContentList[0].play();
				}, 500);
			});
		},
		getPosterUrl(item) {
			if (item.poster) {
				return item.poster;
			}
			if (item.url.indexOf('bspapp.com') > 0) {
				return item.url + '?x-oss-process=video/snapshot,t_1000,f_jpg,w_750,m_fast';
			}
			return false;
		},
		error(item, index) {
			console.log(item);
		},
		ended(item, index) {
			console.log('ended', index);
		},
		change(e) {
			const { current } = e.detail;
			this.videoContentList.map(video => {
				video.pause();
			});
			setTimeout(() => {
				this.videoContentList[current].play();
			}, 500);
		},
		play(item) {
			item.pause = false;
		},
		pause(item) {
			item.pause = true;
		},
		waiting(item, index) {
			console.log('waiting', index);
		},
		clickPause(item, index) {
			if (item.pause) {
				this.videoContentList[index].play();
			} else {
				this.videoContentList[index].pause();
			}
		}
	}
};
</script>

<style lang="scss">
.container {
	height: 100%;
	background: #000000;
}

.video {
	width: 100%;
	height: 100%;
}
.pauseIcon {
	position: absolute;
	left: calc(50% - 50rpx);
	top: calc(50% - 50rpx);
	.taobaofont {
		font-size: 100rpx;
		color: #ffffff;
	}
}
.right {
	position: absolute;
	z-index: 90;
	right: 30rpx;
	top: calc(50% - 50rpx);
	color: #ffffff;
	text-align: center;
	.avatar {
		.image {
			width: 80rpx;
			height: 80rpx;
			border-radius: 50%;
			border: 1rpx solid #ffffff;
		}
	}
	.icon-likefill {
		font-size: 60rpx;
	}
}
.bottom {
	position: absolute;
	z-index: 90;
	bottom: 50rpx;
	left: 30rpx;
	color: #ffffff;
	.playPanel {
		background: rgba(0, 0, 0, 0.47);
		padding: 8rpx 20rpx;
		border-radius: 20rpx;
	}
	.uname {
		margin-top: 20rpx;
		padding-left: 20rpx;
		font-size: 32rpx;
	}
	.title {
		padding-left: 20rpx;
		margin-top: 8rpx;
		font-size: 28rpx;
	}
}
</style>

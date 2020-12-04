<template>
	<view class="container">
		<cu-custom :tabs="tabs" :current="tabCurrent" @tabClick="tabSelect" :fixed="true"></cu-custom>
		<swiper :vertical="true" :style="swiperStyle">
			<swiper-item v-for="(item,index) in dataList" :key="index" style="overflow: hidden;">
				<video class="video" :poster-for-crawler="item.poster" :poster="item.poster" :style="item.style"
				 :controls="false" @error="error(item,index)" @ended="ended(item,index)" :autoplay="false" :src="item.url"></video>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				tabs: [{
					title: "推荐"
				}, {
					title: "关注"
				}, {
					title: "点赞"
				}],
				tabCurrent: 0,
				dataList: []
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
			loadData() {
				let data = [{
						duration: 13,
						height: 960,
						size: 3266693,
						poster: "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods/src/0/5786823106700687.jpg",
						url: "https://limitao.myuan.cn/gongyong/shangchuan/yinpin/33/2020/05/kiWKkG17OY0522ySS50SiL2NBWNi01.mp4",
						width: 544
					}, {
						duration: 13,
						height: 960,
						size: 3266693,
						url: "https://vkceyugu.cdn.bspapp.com/VKCEYUGU-aliyun-btgorwvhvem50683c0/5ffc5e80-3615-11eb-b997-9918a5dda011.mp4",
						width: 544
					},
					{
						duration: 5,
						height: 640,
						size: 3266693,
						poster: "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods/src/0/5786823106700687.jpg",
						url: "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/video/5929447737237924.mp4",
						width: 480
					}, {
						duration: 5,
						height: 544,
						size: 3266693,
						poster: "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/goods/src/0/5786823106700687.jpg",
						url: "https://636c-cloud-market-3c5868-1302181076.tcb.qcloud.la/video/WeChat_20201203174023.mp4",
						width: 544
					}
				];
				const {
					windowHeight,
					windowWidth
				} = this.systemInfo;
				//页面的比例
				let winRate = windowWidth / windowHeight;
				data.forEach(ele => {
					let vRate = ele.width / ele.height;
					if (ele.width >= ele.height || vRate - winRate > 0.2) {

					} else {
						console.log(winRate + " " + vRate);
						if (winRate > vRate) {
							let outHeight = windowWidth / ele.width * ele.height;
							ele.style = `width:${windowWidth}px;height:${outHeight}px`;
						} else {
							let outWidth = ele.width * windowHeight / ele.height;
							let left = 0;
							if (outWidth > windowWidth) {
								left = windowWidth - outWidth;
							}
							ele.style = `width:${outWidth}px;height:${windowHeight}px;left:${left}px`;
						}
					}
					ele.poster = this.getPosterUrl(ele);
				})
				this.dataList = data;
			},
			getPosterUrl(item) {
				if (item.poster) {
					return item.poster;
				}
				if (item.url.indexOf("bspapp.com") > 0) {
					return item.url + '?x-oss-process=video/snapshot,t_1000,f_jpg,w_750,m_fast'
				}
				return false;
			},
			error(item, index) {
				console.log(item)
			},
			ended(item, index) {
				console.log(item)
			}
		}
	}
</script>

<style lang="scss">
	.container {
		height: 100%;
	}

	.video {
		width: 100%;
		height: 100%;
	}
</style>

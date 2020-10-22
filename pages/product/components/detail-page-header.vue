<template>
	<view
		class="mix-page-header row"
		:style="{
			height: navigationBarHeight + statusBarHeight + 'px',
			paddingTop: statusBarHeight + 'px',
			backgroundColor: 'rgba(255,255,255, ' + headerOpacity + ')'
		}"
	>
		<view class="btn center" @click="navBack"><text class="yticon icon-zuo" :class="{ dark: headerOpacity < 0.5 }"></text></view>
		<view class="cen center">
			<view
				class="cen-item"
				:class="{ active: index === currentAnchor }"
				:style="{ opacity: headerOpacity }"
				v-for="(item, index) in anchorList"
				:key="index"
				@click="navToAnchor(index)"
			>
				<text>{{ item.name }}</text>
			</view>
		</view>
		<view class="btn"></view>
	</view>
</template>

<script>
let _disableScroll = false;
export default {
	name: 'ProductPageHeader',
	data() {
		return {
			headerOpacity: 0,
			currentAnchor: 0,
			anchorList: [{ id: 1, name: '商品', top: 0 }, { id: 2, name: '评价', top: 0 }, { id: 3, name: '详情', top: 0 }]
		};
	},
	props: {
		referer: {
			type: String,
			default: ''
		}
	},
	computed: {
		statusBarHeight() {
			return this.systemInfo.statusBarHeight;
		},
		navigationBarHeight() {
			return this.systemInfo.navigationBarHeight;
		}
	},
	methods: {
		//转到锚点
		navToAnchor(index) {
			const { headerOpacity, anchorList, statusBarHeight, navigationBarHeight } = this;
			if (this.headerOpacity == 0) {
				return;
			}
			_disableScroll = true;
			uni.pageScrollTo({
				scrollTop: anchorList[index].top - 1,
				duration: 200
			});
			this.currentAnchor = index;
			setTimeout(() => {
				_disableScroll = false;
			}, 400);
		},
		pageScroll(e) {
			//头部渐变
			this.headerOpacity = e.scrollTop / 150;
			//锚点切换
			if (_disableScroll) {
				return;
			}
			const { currentAnchor, anchorList } = this;
			const cur = e.scrollTop >= anchorList[2].top ? 2 : e.scrollTop >= anchorList[1].top ? 1 : 0;
			if (cur !== currentAnchor) {
				this.currentAnchor = cur;
			}
		},
		navBack() {
			if(this.referer == "share"){
				uni.reLaunch({
				    url: '/pages/index/fruit'
				});
			}else{
				uni.navigateBack();
			}
		}
	}
};
</script>

<style scoped lang="scss">
.mix-page-header {
	position: fixed;
	left: 0;
	top: 0;
	z-index: 90;
	justify-content: space-between;
	width: 100%;
}
.btn {
	width: 80rpx;
}
.icon-zuo {
	width: 52rpx;
	height: 52rpx;
	border-radius: 100rpx;
	font-size: 36rpx;
	color: #333;
	text-align: center;
	line-height: 52rpx;

	&.dark {
		background-color: rgba(0, 0, 0, 0.5);
		color: #fff;
	}
}
.cen {
	flex: 1;
	height: 100%;
	position: relative;

	.cen-item {
		width: 50px;
		height: 36px;
		font-size: 15px;
		color: #333;
		text-align: center;
		line-height: 36px;
		position: relative;
	}
	.active {
		font-size: 17px;
		font-weight: 700;

		&:after {
			position: absolute;
			left: 50%;
			bottom: 0;
			transform: translateX(-50%);
			content: '';
			width: 30px;
			height: 2px;
			background-color: $base-color;
			border-radius: 10rpx;
		}
	}
}
</style>

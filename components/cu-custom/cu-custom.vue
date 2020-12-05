<template>
	<view>
		<view
			class="cu-custom"
			:class="{ fixed: fixed }"
			:style="{
				paddingRight: headerPaddingRight + 'px',
				paddingTop: statusBarHeight + 'px',
				height: navigationBarHeight + statusBarHeight + 'px',
				backgroundColor: bgColor
			}"
		>
			<view :class="[bgImage != '' ? 'none-bg text-white bg-img' : '', bgColor]">
				<view class="action" @tap="BackPage" v-if="isBack">
					<text class="cuIcon-back"></text>
					<slot name="backText"></slot>
				</view>
				<scroll-view scroll-x class="nav text-center" v-if="tabs && tabs.length > 0" :style="[{ top: barHeight + 'px' }]">
					<view class="cu-item text-lg" :class="{ current: index == current }" v-for="(item, index) in tabs" :key="index" @tap="tabSelect(index)">
						<text>{{ item.title }}</text>
					</view>
				</scroll-view>
				<view v-else class="content" :style="[{ top: barHeight + 'px' }]"><slot name="content"></slot></view>
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {};
	},
	name: 'cu-custom',
	computed: {
		statusBarHeight() {
			return this.systemInfo.statusBarHeight;
		},
		navigationBarHeight() {
			return this.systemInfo.navigationBarHeight;
		},
		customWidth() {
			return this.systemInfo.custom.width;
		},
		customHeight() {
			return this.systemInfo.custom.height;
		},
		//小程序右侧需要留出气泡空间
		headerPaddingRight() {
			// #ifndef MP
			return 0;
			// #endif
			// #ifdef MP
			return this.customWidth + 20;
			// #endif
		},
		barHeight() {
			return this.systemInfo.navigationBarHeight;
		}
	},
	props: {
		bgColor: {
			type: String,
			default: ''
		},
		isBack: {
			type: [Boolean, String],
			default: false
		},
		fixed: {
			type: [Boolean, String],
			default: false
		},
		bgImage: {
			type: String,
			default: ''
		},
		current: {
			type: Number,
			default: 0
		},
		tabs: {
			type: [Object, Array, Boolean],
			default: false
		}
	},
	methods: {
		BackPage() {
			uni.navigateBack({
				delta: 1
			});
		},
		tabSelect(index) {
			this.tabCurrent = index;
			this.$emit('tabClick', index);
		}
	}
};
</script>

<style lang="scss" scoped>
.cu-custom {
	width: 100%;
	.cu-item{
		color: #e2e2e2;
		position: relative;
		&.current{
			color: #FFFFFF;
			&:after{
				content: " ";
				position: absolute;
				border-bottom: 2rpx solid #fff;
				left: 25%;
				bottom: 10rpx;
				width: 50%;
			}
		}
	}
	&.fixed {
		z-index: 90;
		position: fixed;
	}
}
</style>

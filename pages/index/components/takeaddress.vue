<template>
	<view class="">
		<view class="cu-list menu-avatar">
			<view class="cu-item" v-for="(item,index) in dataList" :key="index">
				<image class="cu-avatar round lg" :src="item.src | thumbImg('120x120')" mode="aspectFill"></image>
				<view class="content">
					<view class="text-black">
						<text>{{ item.name }}</text>
						<text class="margin-left-sm text-sm text-gray" v-if="item.juli">{{item.juli | formatDistance}}</text>
					</view>
					<view class="text-gray text-sm flex">
						<view class="text-cut">
							<text class="cuIcon-addressbook margin-right-xs"></text>
							<text>{{ item.address }}</text>
						</view>
					</view>
				</view>
				<view class="action margin-right-xs" v-if="item.isChecked">
					<view class="text-grey text-sm">已选择</view>
				</view>
				<view class="flex-wrap justify-between align-center margin-right-xs" v-else>
					<button class="cu-btn bg-green" @click="change(item)">选这个</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {};
		},
		props: {
			dataList: {
				type: Array,
				default: []
			}
		},
		methods: {
			change(item) {
				this.$emit("change", item)
			}
		}
	}
</script>

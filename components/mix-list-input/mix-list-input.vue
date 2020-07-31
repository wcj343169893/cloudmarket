<template>
	<view class="input-container">
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">
				<text v-if="isMust">*</text>
				{{ title }}
			</text>
			<input v-if="type == 'text'" type="text" class="cell-content" @input="changeContent" v-model="content" :placeholder="placeholder" />
			<input v-else-if="type == 'digit'" type="digit" class="cell-content" @input="changeContent" v-model="content" :placeholder="placeholder" />
			<input v-else-if="type == 'number'" type="number" class="cell-content" @input="changeContent" v-model="content" :placeholder="placeholder" />
			<input v-else-if="type == 'idcard'" type="idcard" class="cell-content" @input="changeContent" v-model="content" :placeholder="placeholder" />
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			content: ''
		};
	},
	props: {
		title: {
			type: String,
			default: '标题'
		},
		type: {
			type: String,
			default: 'text'
		},
		isMust: {
			type: Boolean,
			default: false
		},
		placeholder: {
			type: String,
			default: '请输入'
		},defContent:{
			type:String,
			default:""
		}
	},
	created() {
		if(this.defContent){
			this.content = this.defContent;
		}
	},
	methods: {
		changeContent(e) {
			//console.log('changeContent', e);
			this.$emit('change', e.detail.value);
		}
	}
};
</script>

<style lang="scss">
.input-container {
	.mix-list-cell {
		display: flex;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;

		&.b-b:after {
			left: 30upx;
		}

		&.cell-hover {
			background: #fafafa;
		}
		.cell-tit {
			font-size: $font-base;
			color: $font-color-dark;
			margin-right: 20upx;
		}
		.cell-content {
			flex: 1;
			font-size: $font-sm + 2upx;
			&.content-right {
				text-align: right;
			}
		}
	}
}
</style>

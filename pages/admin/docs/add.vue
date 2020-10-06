<template>
	<view class="container">
		<mix-list-select border="b-b" @eventClick="changeTypes" title="类型" :options="types" :defaultOption="type"></mix-list-select>
		<block v-if="type == 'mp_share'">
			<mix-list-input :isMust="!0" title="分享页面" :defContent="pageLink" placeholder="请输入分享页面地址" @change="changePageLink"></mix-list-input>
			<mix-list-input title="分享参数" :defContent="pageLinkQuery" placeholder="请输入分享页面默认参数" @change="changePageLinkQuery"></mix-list-input>
		</block>
		<mix-list-input title="排序" type="number" :defContent="posid" placeholder="请输入排序" @change="changePosid"></mix-list-input>
		<mix-list-input :isMust="!0" title="标题" :defContent="title" placeholder="请输入标题" @change="changeTitle"></mix-list-input>
		<mix-list-input :defContent="content" type="textarea" :isMust="!0" title="内容" placeholder="请输入内容" @change="changeContent"></mix-list-input>
		<view class="specsTitlesBtn"><button class="add-btn" @click="save">提交保存</button></view>
	</view>
</template>

<script>
	import {
		docsAdmin
	} from '@/common/admin_request.js';
	import docType from '../mixin/docType.js';
	export default {
		mixins: [docType],
		data() {
			return {
				_id: '',
				type: 'normal',
				pageLink: '',
				pageLinkQuery: '',
				posid: 0,
				title: '',
				content: '',
				submiting: false
			};
		},
		onLoad(options) {
			if (options.type == 'edit') {
				this._id = options.id;
				this.loadData();
				uni.setNavigationBarTitle({
					title: '修改文档'
				});
			}
		},
		methods: {
			async loadData() {
				docsAdmin('detail', {
					_id: this._id
				}).then(
					res => {
						console.log(res);
						this.title = res.title;
						this.content = res.content;

						this.pageLink = res.pageLink;
						this.pageLinkQuery = res.pageLinkQuery;
						if (res.type) {
							this.type = res.type;
						}
					},
					err => {
						console.log(err);
					}
				);
			},
			changeTypes(val) {
				this.type = val
			},
			changeTitle(val) {
				this.title = val;
			},
			changePosid(val) {
				this.posid = val;
			},
			changeContent(val) {
				this.content = val;
			},
			changePageLink(val) {
				this.pageLink = val;
			},
			changePageLinkQuery(val) {
				this.pageLinkQuery = val;
			},
			save() {
				if (this.submiting) {
					return;
				}
				this.submiting = true;
				docsAdmin('add', {
					_id: this._id,
					type: this.type,
					posid: this.posid,
					pageLink: this.pageLink,
					pageLinkQuery: this.pageLinkQuery,
					title: this.title,
					content: this.content
				},true).then(
					res => {
						this.$api.msg('提交成功', 2000, true, 'success');
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							});
						}, 2000);
						this.$api.prePage().refreshList();
					},
					err => {
						this.submiting = false;
						this.$api.msg(err.message || '提交失败');
					}
				);
			}
		}
	};
</script>

<style lang="scss" scoped>
	.specsTitlesBtn {
		display: flex;
		padding: 50upx 30upx 30upx;

		&.submit {
			position: fixed;
			bottom: 0;
			left: 0;
			right: 0;
			z-index: 98;
			background: #ffffff;
		}
	}

	.add-btn {
		flex: 1;
		margin: 0 30upx;
		font-size: $font-lg;
		color: #fff;
		background-color: $btn-color-light;
		border-radius: 10upx;

		&.cancel {
			background-color: $btn-color-spec;
		}
	}
</style>

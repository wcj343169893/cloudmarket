'use strict';
/**
 * 消息推送处理
 */
const models = {
	/**
	 * 订单状态数据推送
	 * @param {Object} content
	 */
	async SendOrderState(content) {
		let titles = {
			1: "已处理",
			10: "已接单",
			22: "已分配骑手",
			23: "已取货",
			100: "同意退款",
			101: "拒绝退款",
			254: "已完成",
			255: "已关闭",
		};
		let contents = {
			1: "已处理",
			10: "商家已接单，等待分配骑手",
			22: "已分配骑手，正在取货路上",
			23: "骑手已取货，正在配送途中",
			100: "同意退款",
			101: "拒绝退款",
			254: "已完成",
			255: "已关闭",
		};
		let result = {
			delivery: {
				state: content.OrderState,
				stateTitle: titles[content.OrderState],
				stateContent: titles[contents.OrderState],
			}
		}
		switch (content.OrderState) {
			case 23:
				//代表商家已发货，商家不用手动点发货
				result.deliveredTime = Date.now();
				result.deliveredUid = "rider";
				result.state = 2;
				break;
			case 254:
				//代表用户已收货，用户不需要手动点收货
				result.makesureTime = Date.now();
				result.makesureUid = "rider";
				result.state = 3;
				break;
			default:
				break;
		}
		return {
			orderid: content.OrderId,
			result
		}
	},
	/**
	 * 骑手信息推送
	 * @param {Object} content
	 */
	async SendWLUserInfo(content) {
		/* UserName	string	骑手姓名
		UserSex	int	骑手性别（0为女，1为男）
		UserPhone	string	骑手手机号码
		IsIDCard	int	骑手是否认证了身份证（0为没有认证，1为已认证）
		UserPhoto	string	骑手照片链接（完整的Url链接）
		Lat	float	纬度
		Lng	float	经度
		PositionUrl	string	骑手位置URL */
		return {
			orderid: content.OrderId,
			result: {
				delivery: {
					user: {
						name: content.UserName,
						sex: content.UserSex,
						phone: content.UserPhone,
						isIDCard: content.IsIDCard,
						avatar: content.UserPhoto,
						latitude: content.Lat,
						longitude: content.Lng,
						positionUrl: content.PositionUrl
					}
				}
			}
		}
	},
	/**
	 * 骑手位置推送
	 * @param {Object} content
	 */
	async SendWLUserLocation(content) {
		return {
			orderid: content.OrderId,
			result: {
				delivery: {
					user: {
						latitude: content.Lat,
						longitude: content.Lng,
					}
				}
			}
		}
	},
	/**
	 * 用户物流评价推送
	 * @param {Object} content
	 */
	async SendWLComment(content) {
		/* PSSD	int	配送速度（最低1分，最高5分）
		FWTD	int	服务态度（最低1分，最高5分）
		BZWZ	int	包装是否完整（1为不完整，3为完整）
		Comment	string	用户评论内容 */
		return {
			orderid: content.OrderId,
			result: {
				delivery: {
					score: {
						pssd: content.PSSD,
						fwtd: content.FWTD,
						bzwz: content.BZWZ,
						comment: content.Comment,
					}
				}
			}
		}
	},
}
module.exports = models;

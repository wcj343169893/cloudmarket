const {
    Controller
} = require('uni-cloud-router')
module.exports = class UserController extends Controller {
    async init() {
        return {
            userInfo: {
                ...this.ctx.auth.userInfo,
                token: undefined,
                password: undefined,
                permission: this.ctx.auth.permission
            },
			shops: await this.service.user.getAdminShops(this.ctx.auth.userInfo),
            navMenu: await this.service.menu.getMenu()
        }
    }
}

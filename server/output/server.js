"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const await_to_js_1 = __importDefault(require("await-to-js"));
const login_1 = require("./login");
const utils_1 = require("./utils");
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_router_1 = __importDefault(require("koa-router"));
const order_1 = require("./order");
// 导入登录和下单功能模块
// 定义请求体接口
const app = new koa_1.default();
const router = new koa_router_1.default();
// 使用 bodyparser 中间件
app.use((0, koa_bodyparser_1.default)());
// 获取所有已登录账号
router.get('/accounts', async (ctx) => {
    const accounts = (0, utils_1.getAllLoggedInAccounts)();
    ctx.status = 200;
    ctx.body = { accounts };
});
// 获取指定账号的cookies
router.get('/account/:mobile/cookies', async (ctx) => {
    const { mobile } = ctx.params;
    const cookies = (0, utils_1.getAccountCookies)(mobile);
    if (!cookies) {
        ctx.status = 404;
        ctx.body = { error: '账号未登录或cookies不存在' };
        return;
    }
    ctx.status = 200;
    ctx.body = { cookies };
});
// 删除指定账号
router.delete('/account/:mobile', async (ctx) => {
    const { mobile } = ctx.params;
    const success = (0, utils_1.removeAccount)(mobile);
    if (!success) {
        ctx.status = 404;
        ctx.body = { error: '账号不存在' };
        return;
    }
    ctx.status = 200;
    ctx.body = { message: '账号删除成功' };
});
// 添加新账号
// 第一步：发送手机号，触发获取验证码
router.post('/login/step1', async (ctx) => {
    console.log('ctx.request', ctx.request.body);
    const { mobile } = ctx.request.body;
    const [err, result] = await (0, await_to_js_1.default)((0, login_1.initLogin)(mobile));
    if (err) {
        ctx.status = 500;
        ctx.body = { error: '初始化登录失败', details: err.message };
    }
    else {
        ctx.status = 200;
        ctx.body = { message: '请输入验证码' };
    }
});
// 第二步：完成登录
router.post('/login/step2', async (ctx) => {
    const { mobile, captcha } = ctx.request.body;
    const [err, result] = await (0, await_to_js_1.default)((0, login_1.completeLogin)(mobile, captcha));
    if (err) {
        ctx.status = 500;
        ctx.body = { error: '登录失败', details: err.message };
    }
    else {
        ctx.status = 200;
        ctx.body = { message: '登录成功' };
    }
});
// 下单接口
router.post('/order', async (ctx) => {
    const { mobile, url, payType } = ctx.request.body;
    const [err, result] = await (0, await_to_js_1.default)((0, order_1.order)({
        mobile,
        url,
        payType,
    }));
    if (err) {
        ctx.status = 500;
        ctx.body = {
            details: err.message,
            err_no: -1,
        };
    }
    else {
        ctx.status = 200;
        ctx.body = { err_no: 0, data: result };
    }
});
// batchOrder
router.post('/batchOrder', async (ctx) => {
    const { mobile, url, payType, count } = ctx.request.body;
    const results = [];
    for (let i = 0; i < count; i++) {
        const [err, result] = await (0, await_to_js_1.default)((0, order_1.order)({
            mobile,
            url,
            payType,
        }));
        if (!err) {
            results.push(result);
        }
    }
    ctx.status = 200;
    ctx.body = { err_no: 0, data: results };
});
// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());
// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器正在运行在 http://localhost:${PORT}`);
});

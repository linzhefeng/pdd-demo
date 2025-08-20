"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var await_to_js_1 = require("await-to-js");
var login_1 = require("./login");
var Koa = require("koa");
var bodyParser = require("koa-bodyparser");
var Router = require("koa-router");
var order_1 = require("./order");
// 导入登录和下单功能模块
// 定义请求体接口
var app = new Koa();
var router = new Router();
// 使用 bodyparser 中间件
app.use(bodyParser());
// 获取所有已登录账号
router.get('/accounts', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var accounts;
    return __generator(this, function (_a) {
        accounts = (0, login_1.getAllLoggedInAccounts)();
        ctx.status = 200;
        ctx.body = { accounts: accounts };
        return [2 /*return*/];
    });
}); });
// 获取指定账号的cookies
router.get('/account/:mobile/cookies', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var mobile, cookies;
    return __generator(this, function (_a) {
        mobile = ctx.params.mobile;
        cookies = (0, login_1.getAccountCookies)(mobile);
        if (!cookies) {
            ctx.status = 404;
            ctx.body = { error: '账号未登录或cookies不存在' };
            return [2 /*return*/];
        }
        ctx.status = 200;
        ctx.body = { cookies: cookies };
        return [2 /*return*/];
    });
}); });
// 删除指定账号
router.delete('/account/:mobile', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var mobile, success;
    return __generator(this, function (_a) {
        mobile = ctx.params.mobile;
        success = (0, login_1.removeAccount)(mobile);
        if (!success) {
            ctx.status = 404;
            ctx.body = { error: '账号不存在' };
            return [2 /*return*/];
        }
        ctx.status = 200;
        ctx.body = { message: '账号删除成功' };
        return [2 /*return*/];
    });
}); });
// 添加新账号
// 第一步：发送手机号，触发获取验证码
router.post('/login/step1', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var mobile, _a, err, result;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log('ctx.request', ctx.request.body);
                mobile = ctx.request.body.mobile;
                return [4 /*yield*/, (0, await_to_js_1.default)((0, login_1.initLogin)(mobile))];
            case 1:
                _a = _b.sent(), err = _a[0], result = _a[1];
                if (err) {
                    ctx.status = 500;
                    ctx.body = { error: '初始化登录失败', details: err.message };
                }
                else {
                    ctx.status = 200;
                    ctx.body = { message: '请输入验证码' };
                }
                return [2 /*return*/];
        }
    });
}); });
// 第二步：完成登录
router.post('/login/step2', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobile, captcha, _b, err, result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = ctx.request.body, mobile = _a.mobile, captcha = _a.captcha;
                return [4 /*yield*/, (0, await_to_js_1.default)((0, login_1.completeLogin)(mobile, captcha))];
            case 1:
                _b = _c.sent(), err = _b[0], result = _b[1];
                if (err) {
                    ctx.status = 500;
                    ctx.body = { error: '登录失败', details: err.message };
                }
                else {
                    ctx.status = 200;
                    ctx.body = { message: '登录成功' };
                }
                return [2 /*return*/];
        }
    });
}); });
// 下单接口
router.post('/order', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobile, url, payType, _b, err, result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = ctx.request.body, mobile = _a.mobile, url = _a.url, payType = _a.payType;
                return [4 /*yield*/, (0, await_to_js_1.default)((0, order_1.order)({
                        mobile: mobile,
                        url: url,
                        payType: payType,
                    }))];
            case 1:
                _b = _c.sent(), err = _b[0], result = _b[1];
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
                return [2 /*return*/];
        }
    });
}); });
// batchOrder
router.post('/batchOrder', function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, mobile, url, payType, count, results, i, _b, err, result;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _a = ctx.request.body, mobile = _a.mobile, url = _a.url, payType = _a.payType, count = _a.count;
                results = [];
                i = 0;
                _c.label = 1;
            case 1:
                if (!(i < count)) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, await_to_js_1.default)((0, order_1.order)({
                        mobile: mobile,
                        url: url,
                        payType: payType,
                    }))];
            case 2:
                _b = _c.sent(), err = _b[0], result = _b[1];
                if (!err) {
                    results.push(result);
                }
                _c.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4:
                ctx.status = 200;
                ctx.body = { err_no: 0, data: results };
                return [2 /*return*/];
        }
    });
}); });
// 注册路由
app.use(router.routes());
app.use(router.allowedMethods());
// 启动服务器
var PORT = process.env.PORT || 3000;
app.listen(PORT, function () {
    console.log("\u670D\u52A1\u5668\u6B63\u5728\u8FD0\u884C\u5728 http://localhost:".concat(PORT));
});

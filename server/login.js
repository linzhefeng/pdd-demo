"use strict";
// login.ts - 多账号管理系统
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
exports.initLogin = initLogin;
exports.completeLogin = completeLogin;
exports.getAllLoggedInAccounts = getAllLoggedInAccounts;
exports.getAccountCookies = getAccountCookies;
exports.removeAccount = removeAccount;
var fs = require("fs");
var path = require("path");
var puppeteer_1 = require("puppeteer");
var await_to_js_1 = require("await-to-js");
// 确保cookies目录存在
var COOKIES_DIR = path.join(__dirname, 'cookies');
if (!fs.existsSync(COOKIES_DIR)) {
    fs.mkdirSync(COOKIES_DIR, { recursive: true });
}
var instanceMap = new Map();
// 获取账号cookies文件路径
function getAccountCookiesPath(mobile) {
    return path.join(COOKIES_DIR, "".concat(mobile, ".json"));
}
// 第一步：打开登录页面并输入手机号
function initLogin(mobile) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, browser, page, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = instanceMap.get(mobile);
                    if (instance) {
                        return [2 /*return*/, instance];
                    }
                    return [4 /*yield*/, puppeteer_1.default.launch({
                            headless: false,
                            defaultViewport: null,
                        })];
                case 1:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newPage()];
                case 2:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto('https://mobile.pinduoduo.com/login.html', {
                            waitUntil: 'networkidle2',
                        })];
                case 3:
                    _a.sent();
                    // 等待登录按钮出现
                    return [4 /*yield*/, page.waitForSelector('.phone-login', { timeout: 3000 })];
                case 4:
                    // 等待登录按钮出现
                    _a.sent();
                    // 点击 .phone-login & sleep 1000ms
                    return [4 /*yield*/, page.click('.phone-login')];
                case 5:
                    // 点击 .phone-login & sleep 1000ms
                    _a.sent();
                    return [4 /*yield*/, (0, await_to_js_1.default)(page.waitForSelector('.internation-code-input', { timeout: 3000 }))];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, (0, await_to_js_1.default)(page.type('.internation-code-input', '86'))
                        // 等待手机号输入框出现
                    ];
                case 7:
                    _a.sent();
                    // 等待手机号输入框出现
                    return [4 /*yield*/, (0, await_to_js_1.default)(page.waitForSelector('#phone-number', { timeout: 3000 }))];
                case 8:
                    // 等待手机号输入框出现
                    _a.sent();
                    // 输入手机号
                    return [4 /*yield*/, (0, await_to_js_1.default)(page.type('#phone-number', mobile))];
                case 9:
                    // 输入手机号
                    _a.sent();
                    // 等待手机号输入框出现
                    return [4 /*yield*/, (0, await_to_js_1.default)(page.waitForSelector('#user-mobile', { timeout: 3000 }))];
                case 10:
                    // 等待手机号输入框出现
                    _a.sent();
                    // 输入手机号
                    return [4 /*yield*/, (0, await_to_js_1.default)(page.type('#user-mobile', mobile))];
                case 11:
                    // 输入手机号
                    _a.sent();
                    _a.label = 12;
                case 12:
                    _a.trys.push([12, 14, , 15]);
                    return [4 /*yield*/, page.click('button[type="button"]:not([disabled])')];
                case 13:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 14:
                    error_1 = _a.sent();
                    console.log('未找到获取验证码按钮或按钮不可点击');
                    return [3 /*break*/, 15];
                case 15:
                    instanceMap.set(mobile, { browser: browser, page: page });
                    console.log('请输入验证码');
                    return [2 /*return*/];
            }
        });
    });
}
// 第二步：输入验证码并完成登录
function completeLogin(mobile, code) {
    return __awaiter(this, void 0, void 0, function () {
        var instance, browser, page, cookies, cookiesPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    instance = instanceMap.get(mobile);
                    if (!instance) {
                        throw new Error('请先调用initLogin初始化登录');
                    }
                    browser = instance.browser, page = instance.page;
                    // 等待验证码输入框出现 id input-code
                    return [4 /*yield*/, page.waitForSelector('#input-code', {
                            timeout: 10000,
                        })];
                case 1:
                    // 等待验证码输入框出现 id input-code
                    _a.sent();
                    // 输入验证码
                    return [4 /*yield*/, page.type('#input-code', code)];
                case 2:
                    // 输入验证码
                    _a.sent();
                    // click .agreement-icon
                    return [4 /*yield*/, page.click('.agreement-icon')];
                case 3:
                    // click .agreement-icon
                    _a.sent();
                    // 点击登录按钮
                    return [4 /*yield*/, page.click('button[type="submit"]')];
                case 4:
                    // 点击登录按钮
                    _a.sent();
                    // 等待登录完成
                    return [4 /*yield*/, page.waitForNavigation({ waitUntil: 'networkidle2' })];
                case 5:
                    // 等待登录完成
                    _a.sent();
                    return [4 /*yield*/, page.cookies()];
                case 6:
                    cookies = _a.sent();
                    cookiesPath = getAccountCookiesPath(mobile);
                    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
                    console.log("\u8D26\u53F7 ".concat(mobile, " \u7684 Cookie \u5DF2\u4FDD\u5B58"));
                    // 关闭浏览器
                    return [4 /*yield*/, browser.close()];
                case 7:
                    // 关闭浏览器
                    _a.sent();
                    // 清空实例
                    instanceMap.delete(mobile);
                    return [2 /*return*/];
            }
        });
    });
}
// 获取所有已登录账号
function getAllLoggedInAccounts() {
    if (!fs.existsSync(COOKIES_DIR)) {
        return [];
    }
    var files = fs.readdirSync(COOKIES_DIR);
    return files
        .filter(function (file) { return file.endsWith('.json'); })
        .map(function (file) { return path.basename(file, '.json'); });
}
// 获取指定账号的cookies
function getAccountCookies(mobile) {
    var cookiesPath = getAccountCookiesPath(mobile);
    if (!fs.existsSync(cookiesPath)) {
        return null;
    }
    var cookiesData = fs.readFileSync(cookiesPath, 'utf8');
    return JSON.parse(cookiesData);
}
// 删除指定账号的登录信息
function removeAccount(mobile) {
    var cookiesPath = getAccountCookiesPath(mobile);
    if (fs.existsSync(cookiesPath)) {
        fs.unlinkSync(cookiesPath);
        return true;
    }
    return false;
}

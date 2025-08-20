"use strict";
// order.js - 拼多多下单系统
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
exports.order = order;
var await_to_js_1 = require("await-to-js");
var path = require("path");
var puppeteer_1 = require("puppeteer");
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
var fs = require("fs");
function order(options) {
    return __awaiter(this, void 0, void 0, function () {
        var browser, mobile, url, payType, openPage, wxSchema, zfbSchema, _loop_1, _i, payType_1, type;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, puppeteer_1.default.launch({
                        headless: false,
                        defaultViewport: null,
                    })];
                case 1:
                    browser = _a.sent();
                    mobile = options.mobile, url = options.url, payType = options.payType;
                    console.log('🚀 ~ order ~ options:', options);
                    openPage = function () { return __awaiter(_this, void 0, void 0, function () {
                        var page, iPhone12, COOKIES_DIR, cookies;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, browser.newPage()];
                                case 1:
                                    page = _a.sent();
                                    iPhone12 = {
                                        name: 'iPhone 12',
                                        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                                        viewport: {
                                            width: 390,
                                            height: 844,
                                            deviceScaleFactor: 3,
                                            isMobile: true,
                                            hasTouch: true,
                                            isLandscape: false,
                                        },
                                    };
                                    return [4 /*yield*/, page.emulate(iPhone12)];
                                case 2:
                                    _a.sent();
                                    COOKIES_DIR = path.join(__dirname, 'cookies');
                                    cookies = JSON.parse(fs.readFileSync(path.join(COOKIES_DIR, "".concat(mobile, ".json"))).toString());
                                    // 如果没有
                                    if (!cookies) {
                                        throw new Error('请先登录');
                                    }
                                    return [4 /*yield*/, page.setCookie.apply(page, cookies)];
                                case 3:
                                    _a.sent();
                                    return [2 /*return*/, page];
                            }
                        });
                    }); };
                    wxSchema = '';
                    zfbSchema = '';
                    _loop_1 = function (type) {
                        var page, _b, payTypeBtn, _c, payBtnV1, _d, payBtnV2, _e, payTypeBtn, _f, payBtn, keyWord_1, aLinks, alipayLinks, pageUrl, imgSrcs, imgAlipayLinks, iframeSrcs, iframeAlipayLinks, bodyText, textAlipayLinks;
                        return __generator(this, function (_g) {
                            switch (_g.label) {
                                case 0: return [4 /*yield*/, openPage()];
                                case 1:
                                    page = _g.sent();
                                    return [4 /*yield*/, page.goto(url)];
                                case 2:
                                    _g.sent();
                                    if (!(type === 'wx')) return [3 /*break*/, 14];
                                    // 1. 拦截所有请求
                                    page.on('request', function (req) {
                                        var url = req.url();
                                        if (url.startsWith('weixin://')) {
                                            wxSchema = url;
                                        }
                                    });
                                    // 2. 拦截 frame 跳转
                                    page.on('framenavigated', function (frame) {
                                        var url = frame.url();
                                        if (url.startsWith('weixin://')) {
                                            wxSchema = url;
                                        }
                                    });
                                    // 3. 拦截新窗口（window.open）
                                    page.on('targetcreated', function (target) { return __awaiter(_this, void 0, void 0, function () {
                                        var url_1;
                                        return __generator(this, function (_a) {
                                            try {
                                                url_1 = target.url();
                                                if (url_1.startsWith('weixin://')) {
                                                    wxSchema = url_1;
                                                }
                                            }
                                            catch (_b) { }
                                            return [2 /*return*/];
                                        });
                                    }); });
                                    // 4. 拦截页面 console.log
                                    page.on('console', function (msg) {
                                        var text = msg.text();
                                        if (text.includes('weixin://')) {
                                            var match = text.match(/weixin:\/\/[\w\-\/?#=&%.]+/);
                                            if (match) {
                                                wxSchema = match[0];
                                            }
                                        }
                                    });
                                    // 5. 注入 JS 劫持所有 schema 跳转
                                    return [4 /*yield*/, page.evaluateOnNewDocument(function () {
                                            // 劫持 window.open
                                            var originOpen = window.open;
                                            window.open = function (url) {
                                                if (typeof url === 'string' && url.startsWith('weixin://')) {
                                                    console.log('window.open 捕获到微信schema:', url);
                                                    window._WX_SCHEMA = url;
                                                }
                                                // 使用扩展运算符传递参数
                                                return originOpen.apply(this, [url]);
                                            };
                                            // 劫持 location.assign/replace
                                            var originAssign = window.location.assign;
                                            window.location.assign = function (url) {
                                                if (typeof url === 'string' && url.startsWith('weixin://')) {
                                                    console.log('window.location.assign 捕获到微信schema:', url);
                                                    // 赋值给全局变量
                                                    window._WX_SCHEMA = url;
                                                }
                                                // 使用扩展运算符传递参数
                                                return originAssign.apply(this, [url]);
                                            };
                                            var originReplace = window.location.replace;
                                            window.location.replace = function (url) {
                                                if (typeof url === 'string' && url.startsWith('weixin://')) {
                                                    console.log('window.location.replace 捕获到微信schema:', url);
                                                    // 赋值给全局变量
                                                    window._WX_SCHEMA = url;
                                                }
                                                // 使用扩展运算符传递参数
                                                return originReplace.apply(this, [url]);
                                            };
                                            // 劫持 iframe.src
                                            var originSetAttribute = HTMLIFrameElement.prototype.setAttribute;
                                            HTMLIFrameElement.prototype.setAttribute = function (name, value) {
                                                if (name === 'src' &&
                                                    typeof value === 'string' &&
                                                    value.startsWith('weixin://')) {
                                                    console.log('iframe.src 捕获到微信schema:', value);
                                                    // 赋值给全局变量
                                                    window._WX_SCHEMA = value;
                                                }
                                                // 使用扩展运算符传递参数
                                                return originSetAttribute.apply(this, [name, value]);
                                            };
                                        })];
                                case 3:
                                    // 5. 注入 JS 劫持所有 schema 跳转
                                    _g.sent();
                                    // 打开商品下单页
                                    return [4 /*yield*/, page.goto(url, { waitUntil: 'networkidle2' })];
                                case 4:
                                    // 打开商品下单页
                                    _g.sent();
                                    return [4 /*yield*/, (0, await_to_js_1.default)(
                                        // span with text: 微信支付
                                        page.waitForSelector('span ::-p-text(微信支付)', { timeout: 3000 }))];
                                case 5:
                                    _b = _g.sent(), payTypeBtn = _b[1];
                                    console.log('type', payTypeBtn);
                                    // click 微信支付
                                    return [4 /*yield*/, (payTypeBtn === null || payTypeBtn === void 0 ? void 0 : payTypeBtn.click())];
                                case 6:
                                    // click 微信支付
                                    _g.sent();
                                    return [4 /*yield*/, (0, await_to_js_1.default)(page.waitForSelector('span ::-p-text(立即支付)', { timeout: 3000 }))];
                                case 7:
                                    _c = _g.sent(), payBtnV1 = _c[1];
                                    // click 立即支付
                                    return [4 /*yield*/, (payBtnV1 === null || payBtnV1 === void 0 ? void 0 : payBtnV1.click())];
                                case 8:
                                    // click 立即支付
                                    _g.sent();
                                    return [4 /*yield*/, (0, await_to_js_1.default)(page.waitForSelector('span ::-p-text(提交订单)', { timeout: 3000 }))];
                                case 9:
                                    _d = _g.sent(), payBtnV2 = _d[1];
                                    // click 立即支付
                                    return [4 /*yield*/, (payBtnV2 === null || payBtnV2 === void 0 ? void 0 : payBtnV2.click())];
                                case 10:
                                    // click 立即支付
                                    _g.sent();
                                    // 等待支付方式区域出现
                                    // 等待页面跳转和 schema 出现
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 8000); })];
                                case 11:
                                    // 等待支付方式区域出现
                                    // 等待页面跳转和 schema 出现
                                    _g.sent();
                                    if (!!wxSchema) return [3 /*break*/, 13];
                                    return [4 /*yield*/, page.evaluate(function () {
                                            // 先检查全局变量
                                            if (window._WX_SCHEMA)
                                                return window._WX_SCHEMA;
                                            // 检查所有a标签
                                            var aLinks = Array.from(document.querySelectorAll('a')).map(function (a) { return a.href; });
                                            var wxLink = aLinks.find(function (link) { return link.startsWith('weixin://'); });
                                            if (wxLink)
                                                return wxLink;
                                            // 检查文本
                                            var bodyText = document.body.innerText;
                                            var match = bodyText.match(/weixin:\/\/[\w\-\/?#=&%.]+/);
                                            if (match)
                                                return match[0];
                                            return null;
                                        })];
                                case 12:
                                    wxSchema = _g.sent();
                                    _g.label = 13;
                                case 13:
                                    if (wxSchema) {
                                        console.log('最终捕获到微信schema:', wxSchema);
                                    }
                                    else {
                                        console.log('未捕获到微信schema');
                                    }
                                    return [3 /*break*/, 25];
                                case 14:
                                    if (!(type === 'zfb')) return [3 /*break*/, 25];
                                    return [4 /*yield*/, (0, await_to_js_1.default)(
                                        // span with text: 支付宝
                                        page.waitForSelector('span ::-p-text(支付宝)', { timeout: 15000 }))];
                                case 15:
                                    _e = _g.sent(), payTypeBtn = _e[1];
                                    // click 支付宝
                                    return [4 /*yield*/, (payTypeBtn === null || payTypeBtn === void 0 ? void 0 : payTypeBtn.click())];
                                case 16:
                                    // click 支付宝
                                    _g.sent();
                                    return [4 /*yield*/, (0, await_to_js_1.default)(page.waitForSelector('span ::-p-text(立即支付)', { timeout: 10000 }))];
                                case 17:
                                    _f = _g.sent(), payBtn = _f[1];
                                    return [4 /*yield*/, (payBtn === null || payBtn === void 0 ? void 0 : payBtn.click())];
                                case 18:
                                    _g.sent();
                                    // 等待跳转到支付二维码页面
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                                case 19:
                                    // 等待跳转到支付二维码页面
                                    _g.sent();
                                    keyWord_1 = 'alipay://';
                                    return [4 /*yield*/, page.$$eval('a', function (as) {
                                            return as.map(function (a) { return a.href; });
                                        })];
                                case 20:
                                    aLinks = _g.sent();
                                    alipayLinks = aLinks.filter(function (link) {
                                        return link.includes(keyWord_1);
                                    });
                                    if (alipayLinks.length > 0) {
                                        zfbSchema = alipayLinks[0];
                                    }
                                    return [4 /*yield*/, page.evaluate(function () { return window.location.href; })];
                                case 21:
                                    pageUrl = _g.sent();
                                    if (pageUrl.includes(keyWord_1)) {
                                        zfbSchema = pageUrl;
                                    }
                                    return [4 /*yield*/, page.$$eval('img', function (imgs) {
                                            return imgs.map(function (img) { return img.src; });
                                        })];
                                case 22:
                                    imgSrcs = _g.sent();
                                    imgAlipayLinks = imgSrcs.filter(function (src) {
                                        return src.includes(keyWord_1);
                                    });
                                    if (imgAlipayLinks.length > 0) {
                                        console.log('图片src中发现支付宝支付链接：', imgAlipayLinks);
                                        zfbSchema = imgAlipayLinks[0];
                                    }
                                    return [4 /*yield*/, page.$$eval('iframe', function (iframes) {
                                            return iframes.map(function (f) { return f.src; });
                                        })];
                                case 23:
                                    iframeSrcs = _g.sent();
                                    iframeAlipayLinks = iframeSrcs.filter(function (src) {
                                        return src.includes(keyWord_1);
                                    });
                                    if (iframeAlipayLinks.length > 0) {
                                        console.log('iframe中发现支付宝支付链接：', iframeAlipayLinks);
                                        zfbSchema = iframeAlipayLinks[0];
                                    }
                                    return [4 /*yield*/, page.evaluate(function () { return document.body.innerText; })];
                                case 24:
                                    bodyText = _g.sent();
                                    textAlipayLinks = (bodyText.match(/alipay:\/\/[\w\-\/?#=&%.]+/g) || []).filter(function (link) { return link.includes(keyWord_1); });
                                    if (textAlipayLinks.length > 0) {
                                        console.log('页面文本中发现支付宝支付链接：', textAlipayLinks);
                                        zfbSchema = textAlipayLinks[0];
                                    }
                                    _g.label = 25;
                                case 25: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, payType_1 = payType;
                    _a.label = 2;
                case 2:
                    if (!(_i < payType_1.length)) return [3 /*break*/, 5];
                    type = payType_1[_i];
                    return [5 /*yield**/, _loop_1(type)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [4 /*yield*/, browser.close()];
                case 6:
                    _a.sent();
                    return [2 /*return*/, {
                            wxSchema: wxSchema,
                            zfbSchema: zfbSchema,
                        }];
            }
        });
    });
}
// 支付宝/微信分流逻辑

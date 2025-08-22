"use strict";
// order.js - 拼多多下单系统
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.order = order;
const await_to_js_1 = __importDefault(require("await-to-js"));
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const utils_1 = require("./utils");
async function order(options) {
    const browser = await (0, utils_1.initBrowser)();
    const { mobile, url, payType } = options;
    console.log('🚀 ~ order ~ options:', options);
    const openPage = async () => {
        const page = await (0, utils_1.createAndConfigurePage)(browser, true);
        await (0, utils_1.setPageCookies)(page, mobile);
        return page;
    };
    let wxSchema = '';
    let zfbSchema = '';
    for (const type of payType) {
        const page = await openPage();
        await page.goto(url);
        if (type === 'wx') {
            // 1. 拦截所有请求
            page.on('request', (req) => {
                const url = req.url();
                if (url.startsWith('weixin://')) {
                    wxSchema = url;
                }
            });
            // 2. 拦截 frame 跳转
            page.on('framenavigated', (frame) => {
                const url = frame.url();
                if (url.startsWith('weixin://')) {
                    wxSchema = url;
                }
            });
            // 3. 拦截新窗口（window.open）
            page.on('targetcreated', async (target) => {
                try {
                    const url = target.url();
                    if (url.startsWith('weixin://')) {
                        wxSchema = url;
                    }
                }
                catch { }
            });
            // 4. 拦截页面 console.log
            page.on('console', (msg) => {
                const text = msg.text();
                if (text.includes('weixin://')) {
                    const match = text.match(new RegExp('weixin://([\\w\\-\\/\\?#=&%.]+)'));
                    if (match) {
                        wxSchema = match[0];
                    }
                }
            });
            // 5. 注入 JS 劫持所有 schema 跳转
            await page.evaluateOnNewDocument(() => {
                // 劫持 window.open
                const originOpen = window.open;
                window.open = function (url) {
                    if (typeof url === 'string' && url.startsWith('weixin://')) {
                        console.log('window.open 捕获到微信schema:', url);
                        window._WX_SCHEMA = url;
                    }
                    // 使用扩展运算符传递参数
                    return originOpen.apply(this, [url]);
                };
                // 劫持 location.assign/replace
                const originAssign = window.location.assign;
                window.location.assign = function (url) {
                    if (typeof url === 'string' && url.startsWith('weixin://')) {
                        console.log('window.location.assign 捕获到微信schema:', url);
                        // 赋值给全局变量
                        window._WX_SCHEMA = url;
                    }
                    // 使用扩展运算符传递参数
                    return originAssign.apply(this, [url]);
                };
                const originReplace = window.location.replace;
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
                const originSetAttribute = HTMLIFrameElement.prototype.setAttribute;
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
            });
            // 打开商品下单页
            await page.goto(url, { waitUntil: 'networkidle2' });
            const [, payTypeBtn] = await (0, await_to_js_1.default)(
            // span with text: 微信支付
            page.waitForSelector('span ::-p-text(微信支付)', { timeout: 3000 }));
            console.log('type', payTypeBtn);
            // click 微信支付
            await payTypeBtn?.click();
            const [, payBtnV1] = await (0, await_to_js_1.default)(page.waitForSelector('span ::-p-text(立即支付)', { timeout: 3000 }));
            // click 立即支付
            await payBtnV1?.click();
            const [, payBtnV2] = await (0, await_to_js_1.default)(page.waitForSelector('span ::-p-text(提交订单)', { timeout: 3000 }));
            // click 立即支付
            await payBtnV2?.click();
            // 等待支付方式区域出现
            // 等待页面跳转和 schema 出现
            await new Promise((resolve) => setTimeout(resolve, 8000));
            // 兜底：在页面变量中查找 weixin://
            if (!wxSchema) {
                wxSchema = await page.evaluate(() => {
                    // 先检查全局变量
                    if (window._WX_SCHEMA)
                        return window._WX_SCHEMA;
                    // 检查所有a标签
                    const aLinks = Array.from(document.querySelectorAll('a')).map((a) => a.href);
                    const wxLink = aLinks.find((link) => link.startsWith('weixin://'));
                    if (wxLink)
                        return wxLink;
                    // 检查文本
                    const bodyText = document.body.innerText;
                    const match = bodyText.match(new RegExp('weixin://([\\w\\-\\/\\?#=&%.]+)'));
                    if (match)
                        return match[0];
                    return null;
                });
            }
            if (wxSchema) {
                console.log('最终捕获到微信schema:', wxSchema);
            }
            else {
                console.log('未捕获到微信schema');
            }
        }
        else if (type === 'zfb') {
            // 等待支付方式区域出现
            const [, payTypeBtn] = await (0, await_to_js_1.default)(
            // span with text: 支付宝
            page.waitForSelector('span ::-p-text(支付宝)', { timeout: 15000 }));
            // click 支付宝
            await payTypeBtn?.click();
            // 等待“立即支付”按钮出现并点击
            const [, payBtn] = await (0, await_to_js_1.default)(page.waitForSelector('span ::-p-text(立即支付)', { timeout: 10000 }));
            await payBtn?.click();
            // 等待跳转到支付二维码页面
            await new Promise((resolve) => setTimeout(resolve, 5000));
            const keyWord = 'alipay://';
            zfbSchema = await (0, utils_1.extractSchemaFromPage)(page, keyWord);
        }
    }
    await browser.close();
    return {
        wxSchema,
        zfbSchema,
    };
}
// 支付宝/微信分流逻辑

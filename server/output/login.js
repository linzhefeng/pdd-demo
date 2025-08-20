"use strict";
// login.ts - 多账号管理系统
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogin = initLogin;
exports.completeLogin = completeLogin;
exports.getAllLoggedInAccounts = getAllLoggedInAccounts;
exports.getAccountCookies = getAccountCookies;
exports.removeAccount = removeAccount;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const puppeteer_1 = __importDefault(require("puppeteer"));
const await_to_js_1 = __importDefault(require("await-to-js"));
// 确保cookies目录存在
const COOKIES_DIR = path.join(__dirname, 'cookies');
if (!fs.existsSync(COOKIES_DIR)) {
    fs.mkdirSync(COOKIES_DIR, { recursive: true });
}
const instanceMap = new Map();
// 获取账号cookies文件路径
function getAccountCookiesPath(mobile) {
    return path.join(COOKIES_DIR, `${mobile}.json`);
}
// 第一步：打开登录页面并输入手机号
async function initLogin(mobile) {
    const instance = instanceMap.get(mobile);
    if (instance) {
        return instance;
    }
    const browser = await puppeteer_1.default.launch({
        headless: false,
        defaultViewport: null,
    });
    const page = await browser.newPage();
    await page.goto('https://mobile.pinduoduo.com/login.html', {
        waitUntil: 'networkidle2',
    });
    // 等待登录按钮出现
    await page.waitForSelector('.phone-login', { timeout: 3000 });
    // 点击 .phone-login & sleep 1000ms
    await page.click('.phone-login');
    await (0, await_to_js_1.default)(page.waitForSelector('.internation-code-input', { timeout: 3000 }));
    await (0, await_to_js_1.default)(page.type('.internation-code-input', '86'));
    // 等待手机号输入框出现
    await (0, await_to_js_1.default)(page.waitForSelector('#phone-number', { timeout: 3000 }));
    // 输入手机号
    await (0, await_to_js_1.default)(page.type('#phone-number', mobile));
    // 等待手机号输入框出现
    await (0, await_to_js_1.default)(page.waitForSelector('#user-mobile', { timeout: 3000 }));
    // 输入手机号
    await (0, await_to_js_1.default)(page.type('#user-mobile', mobile));
    // 点击获取验证码按钮（如果存在）
    try {
        await page.click('button[type="button"]:not([disabled])');
    }
    catch (error) {
        console.log('未找到获取验证码按钮或按钮不可点击');
    }
    instanceMap.set(mobile, { browser, page });
    console.log('请输入验证码');
}
// 第二步：输入验证码并完成登录
async function completeLogin(mobile, code) {
    const instance = instanceMap.get(mobile);
    if (!instance) {
        throw new Error('请先调用initLogin初始化登录');
    }
    const { browser, page } = instance;
    // 等待验证码输入框出现 id input-code
    await page.waitForSelector('#input-code', {
        timeout: 10000,
    });
    // 输入验证码
    await page.type('#input-code', code);
    // click .agreement-icon
    await page.click('.agreement-icon');
    // 点击登录按钮
    await page.click('button[type="submit"]');
    // 等待登录完成
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    const cookies = await page.cookies();
    // 为每个账号单独保存cookies
    const cookiesPath = getAccountCookiesPath(mobile);
    fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
    console.log(`账号 ${mobile} 的 Cookie 已保存`);
    // 关闭浏览器
    await browser.close();
    // 清空实例
    instanceMap.delete(mobile);
}
// 获取所有已登录账号
function getAllLoggedInAccounts() {
    if (!fs.existsSync(COOKIES_DIR)) {
        return [];
    }
    const files = fs.readdirSync(COOKIES_DIR);
    return files
        .filter(file => file.endsWith('.json'))
        .map(file => path.basename(file, '.json'));
}
// 获取指定账号的cookies
function getAccountCookies(mobile) {
    const cookiesPath = getAccountCookiesPath(mobile);
    if (!fs.existsSync(cookiesPath)) {
        return null;
    }
    const cookiesData = fs.readFileSync(cookiesPath, 'utf8');
    return JSON.parse(cookiesData);
}
// 删除指定账号的登录信息
function removeAccount(mobile) {
    const cookiesPath = getAccountCookiesPath(mobile);
    if (fs.existsSync(cookiesPath)) {
        fs.unlinkSync(cookiesPath);
        return true;
    }
    return false;
}

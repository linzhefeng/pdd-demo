// login.ts - 多账号管理系统

import to from 'await-to-js';
import * as fs from 'fs';
import * as path from 'path';
import puppeteer from 'puppeteer';

// 确保cookies目录存在
const COOKIES_DIR = path.join(__dirname, 'cookies');
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
}

const instanceMap = new Map<string, { browser: any; page: any }>();

// 获取账号cookies文件路径
function getAccountCookiesPath(mobile: string): string {
  return path.join(COOKIES_DIR, `${mobile}.json`);
}

// 第一步：打开登录页面并输入手机号
export async function initLogin(mobile: string) {
  console.log(`[${mobile}] 开始初始化登录流程...`);

  const instance = instanceMap.get(mobile);
  if (instance) {
    console.log(`[${mobile}] 已存在实例，返回现有实例`);
    return instance;
  }

  console.log(`[${mobile}] 启动浏览器...`);
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-extensions',
      '--disable-plugins',
      '--disable-default-apps',
      '--no-first-run',
      '--no-default-browser-check',
      '--single-process',
      '--disable-crash-reporter',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update',
      '--disable-web-resources',
      '--remote-debugging-port=0'
    ],
  });
  console.log(`[${mobile}] 浏览器已启动`);

  const page = await browser.newPage();
  console.log(`[${mobile}] 新页面已创建`);

  console.log(`[${mobile}] 正在访问登录页面...`);
  await page.goto('https://mobile.pinduoduo.com/login.html', {
    waitUntil: 'networkidle2',
  });
  console.log(`[${mobile}] 登录页面已加载`);

  // 等待登录按钮出现
  console.log(`[${mobile}] 等待登录按钮出现...`);
  await page.waitForSelector('.phone-login', { timeout: 3000 });
  console.log(`[${mobile}] 登录按钮已出现`);

  // 点击 .phone-login & sleep 1000ms
  console.log(`[${mobile}] 点击登录按钮...`);
  await page.click('.phone-login');
  console.log(`[${mobile}] 登录按钮已点击`);

  console.log(`[${mobile}] 等待国际区号输入框...`);
  const [waitCodeError, waitCodeResult] = await to(
    page.waitForSelector('.internation-code-input', { timeout: 3000 })
  );
  if (waitCodeError) {
    console.error(`[${mobile}] 等待国际区号输入框失败:`, waitCodeError.message);
  } else {
    console.log(`[${mobile}] 国际区号输入框已出现`);
  }

  console.log(`[${mobile}] 输入国际区号...`);
  const [typeCodeError, typeCodeResult] = await to(
    page.type('.internation-code-input', '86')
  );
  if (typeCodeError) {
    console.error(`[${mobile}] 输入国际区号失败:`, typeCodeError.message);
  } else {
    console.log(`[${mobile}] 国际区号已输入`);
  }

  console.log(`[${mobile}] 等待手机号输入框(#phone-number)...`);
  const [waitPhoneError1, waitPhoneResult1] = await to(
    page.waitForSelector('#phone-number', { timeout: 3000 })
  );
  if (waitPhoneError1) {
    console.error(
      `[${mobile}] 等待手机号输入框(#phone-number)失败:`,
      waitPhoneError1.message
    );
  } else {
    console.log(`[${mobile}] 手机号输入框(#phone-number)已出现`);
  }

  console.log(`[${mobile}] 输入手机号到#phone-number...`);
  const [typePhoneError1, typePhoneResult1] = await to(
    page.type('#phone-number', mobile)
  );
  if (typePhoneError1) {
    console.error(
      `[${mobile}] 输入手机号到#phone-number失败:`,
      typePhoneError1.message
    );
  } else {
    console.log(`[${mobile}] 手机号已输入到#phone-number`);
  }

  console.log(`[${mobile}] 等待手机号输入框(#user-mobile)...`);
  const [waitPhoneError2, waitPhoneResult2] = await to(
    page.waitForSelector('#user-mobile', { timeout: 3000 })
  );
  if (waitPhoneError2) {
    console.error(
      `[${mobile}] 等待手机号输入框(#user-mobile)失败:`,
      waitPhoneError2.message
    );
  } else {
    console.log(`[${mobile}] 手机号输入框(#user-mobile)已出现`);
  }

  console.log(`[${mobile}] 输入手机号到#user-mobile...`);
  const [typePhoneError2, typePhoneResult2] = await to(
    page.type('#user-mobile', mobile)
  );
  if (typePhoneError2) {
    console.error(
      `[${mobile}] 输入手机号到#user-mobile失败:`,
      typePhoneError2.message
    );
  } else {
    console.log(`[${mobile}] 手机号已输入到#user-mobile`);
  }

  // 点击获取验证码按钮（如果存在）
  console.log(`[${mobile}] 尝试点击获取验证码按钮...`);
  try {
    await page.click('button[type="button"]:not([disabled])');
    console.log(`[${mobile}] 获取验证码按钮已点击`);
  } catch (error) {
    console.error(`[${mobile}] 点击获取验证码按钮失败:`, error.message);
  }

  instanceMap.set(mobile, { browser, page });
  console.log(`[${mobile}] 初始化登录完成，请输入验证码`);
}

// 第二步：输入验证码并完成登录
export async function completeLogin(mobile: string, code: string) {
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
export function getAllLoggedInAccounts(): string[] {
  if (!fs.existsSync(COOKIES_DIR)) {
    return [];
  }

  const files = fs.readdirSync(COOKIES_DIR);
  return files
    .filter((file) => file.endsWith('.json'))
    .map((file) => path.basename(file, '.json'));
}

// 获取指定账号的cookies
export function getAccountCookies(mobile: string): any[] | null {
  const cookiesPath = getAccountCookiesPath(mobile);
  if (!fs.existsSync(cookiesPath)) {
    return null;
  }

  const cookiesData = fs.readFileSync(cookiesPath, 'utf8');
  return JSON.parse(cookiesData);
}

// 删除指定账号的登录信息
export function removeAccount(mobile: string): boolean {
  const cookiesPath = getAccountCookiesPath(mobile);
  if (fs.existsSync(cookiesPath)) {
    fs.unlinkSync(cookiesPath);
    return true;
  }
  return false;
}

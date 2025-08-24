// login.ts - 多账号管理系统

import to from 'await-to-js';
import * as fs from 'fs';
import * as path from 'path';
import { Browser } from 'puppeteer';
import {
  createAndConfigurePage,
  initBrowser,
  saveAccountCookies,
} from './utils';

const instanceMap = new Map<
  string,
  { browser: Browser; page: any; timer: NodeJS.Timeout }
>();

// 第一步：打开登录页面并输入手机号
export async function initLogin(mobile: string) {
  console.log(`[${mobile}] 开始初始化登录流程...`);

  const instance = instanceMap.get(mobile);
  if (instance) {
    console.log(`[${mobile}] 已存在实例，返回现有实例`);
    return instance;
  }

  console.log(`[${mobile}] 启动浏览器...`);
  const browser = await initBrowser();
  console.log(`[${mobile}] 浏览器已启动`);

  const page = await createAndConfigurePage(browser, false);
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
  // 清空并重新输入国际区号
  const internationalCodeInput = '.internation-code-input';
  await to(page.focus(internationalCodeInput));
  await page.keyboard.down('Meta');
  await page.keyboard.press('KeyA');
  await page.keyboard.up('Meta');
  await page.keyboard.press('Backspace');
  const [typeCodeError, typeCodeResult] = await to(
    page.type(internationalCodeInput, '86')
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
    await page.click('#code-button');
    console.log(`[${mobile}] 获取验证码按钮已点击`);
  } catch (error) {
    console.error(`[${mobile}] 点击获取验证码按钮失败:`, error.message);
  }

  try {
    await page.click('#captcha-btn');
    console.log(`[${mobile}] 获取验证码按钮已点击`);
  } catch (error) {
    console.error(`[${mobile}] 点击获取验证码按钮失败:`, error.message);
  }

  // 设置3分钟后自动销毁浏览器实例
  const timer = setTimeout(() => {
    console.log(`[${mobile}] 浏览器实例已超时，正在自动销毁...`);
    browser.close();
    instanceMap.delete(mobile);
  }, 3 * 60 * 1000); // 3分钟

  instanceMap.set(mobile, { browser, page, timer });

  // 截图保存验证码输入页面
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }
  const screenshotPath = path.join(screenshotDir, `${mobile}_captcha.png`);
  await page.screenshot({
    path: screenshotPath as `${string}.png`,
    fullPage: true,
  });
  console.log(`[${mobile}] 验证码页面截图已保存至: ${screenshotPath}`);

  // 获取页面HTML内容
  const pageHtml = await page.content();

  console.log(`[${mobile}] 初始化登录完成，请输入验证码`);
  // 返回验证码图片地址和页面HTML
  return { browser, page, captchaImagePath: screenshotPath, pageHtml };
}

// 第二步：输入验证码并完成登录
export async function completeLogin(mobile: string, code: string) {
  const instance = instanceMap.get(mobile);
  if (!instance) {
    throw new Error('请先调用initLogin初始化登录');
  }
  const { browser, page, timer } = instance;

  // 清除定时器
  clearTimeout(timer);

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
  saveAccountCookies(mobile, cookies);
  console.log(`账号 ${mobile} 的 Cookie 已保存`);

  // 关闭浏览器
  await browser.close();

  // 清空实例
  instanceMap.delete(mobile);
}

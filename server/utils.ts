// utils.ts - 公共工具函数

import * as fs from 'fs';
import * as path from 'path';
import puppeteer, { Browser } from 'puppeteer';

// 确保cookies目录存在
const COOKIES_DIR = path.join(__dirname, 'cookies');
if (!fs.existsSync(COOKIES_DIR)) {
  fs.mkdirSync(COOKIES_DIR, { recursive: true });
}

// 获取账号cookies文件路径
export function getAccountCookiesPath(mobile: string): string {
  return path.join(COOKIES_DIR, `${mobile}.json`);
}

// 初始化浏览器实例
export async function initBrowser() {
  return await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
}

// 创建并配置页面
export async function createAndConfigurePage(
  browser: Browser,
  useConfig?: boolean
) {
  const page = await browser.newPage();

  if (useConfig) {
    // iPhone 12 参数
    const iPhone12 = {
      name: 'iPhone 12',
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      viewport: {
        width: 390,
        height: 844,
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        isLandscape: false,
      },
    };

    await page.emulate(iPhone12);
  }
  return page;
}

// 设置页面cookies
export async function setPageCookies(page: any, mobile: string) {
  const cookiesPath = getAccountCookiesPath(mobile);
  if (!fs.existsSync(cookiesPath)) {
    throw new Error('请先登录');
  }

  const cookies = JSON.parse(fs.readFileSync(cookiesPath).toString());
  await page.setCookie(...cookies);
}

// 保存账号cookies
export function saveAccountCookies(mobile: string, cookies: any[]) {
  const cookiesPath = getAccountCookiesPath(mobile);
  fs.writeFileSync(cookiesPath, JSON.stringify(cookies, null, 2));
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

// 删除指定账号
export function removeAccount(mobile: string): boolean {
  const cookiesPath = getAccountCookiesPath(mobile);
  if (fs.existsSync(cookiesPath)) {
    fs.unlinkSync(cookiesPath);
    return true;
  }
  return false;
}

// 提取页面中的schema链接
export async function extractSchemaFromPage(page: any, schemaPrefix: string) {
  let schema = '';

  // 1. 抓取所有 a 标签的 href
  const aLinks = await page.$$eval('a', (as: any) =>
    as.map((a: any) => a.href)
  );
  const schemaLinks = aLinks.filter((link: string) =>
    link.includes(schemaPrefix)
  );
  if (schemaLinks.length > 0) {
    schema = schemaLinks[0];
  }

  // 2. 检查 window.location.href
  if (!schema) {
    const pageUrl = await page.evaluate(() => window.location.href);
    if (pageUrl.includes(schemaPrefix)) {
      schema = pageUrl;
    }
  }

  // 3. 检查 img src
  if (!schema) {
    const imgSrcs = await page.$$eval('img', (imgs: any) =>
      imgs.map((img: any) => img.src)
    );
    const imgSchemaLinks = imgSrcs.filter((src: string) =>
      src.includes(schemaPrefix)
    );
    if (imgSchemaLinks.length > 0) {
      schema = imgSchemaLinks[0];
    }
  }

  // 4. 检查 iframe src
  if (!schema) {
    const iframeSrcs = await page.$$eval('iframe', (iframes: any) =>
      iframes.map((f: any) => f.src)
    );
    const iframeSchemaLinks = iframeSrcs.filter((src: string) =>
      src.includes(schemaPrefix)
    );
    if (iframeSchemaLinks.length > 0) {
      schema = iframeSchemaLinks[0];
    }
  }

  // 5. 检查页面内所有文本内容（兜底）
  if (!schema) {
    const bodyText = await page.evaluate(() => document.body.innerText);
    const textSchemaLinks = (
      bodyText.match(new RegExp(`${schemaPrefix}[\\w\\-\\/\\?#=&%.]+`, 'g')) ||
      []
    ).filter((link: string) => link.includes(schemaPrefix));
    if (textSchemaLinks.length > 0) {
      schema = textSchemaLinks[0];
    }
  }

  return schema;
}

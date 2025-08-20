// order.js - 拼多多下单系统

import to from 'await-to-js';
import path from 'path';
import puppeteer from 'puppeteer';

// const StealthPlugin = require('puppeteer-extra-plugin-stealth');

import fs from 'fs';

export async function order(options: {
  mobile: string;
  url: string;
  payType: Array<'wx' | 'zfb'>;
}) {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });
  const { mobile, url, payType } = options;

  console.log('🚀 ~ order ~ options:', options);

  const openPage = async () => {
    const page = await browser.newPage();

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

    const COOKIES_DIR = path.join(__dirname, 'cookies');
    // 读取 cookies
    const cookies = JSON.parse(
      fs.readFileSync(path.join(COOKIES_DIR, `${mobile}.json`)).toString()
    );
    // 如果没有
    if (!cookies) {
      throw new Error('请先登录');
    }
    await page.setCookie(...cookies);
    return page;
  };

  let wxSchema = '';
  let zfbSchema = '';

  for (const type of payType) {
    const page = await openPage();
    await page.goto(url);
    if (type === 'wx') {
      // 1. 拦截所有请求
      page.on('request', (req: any) => {
        const url = req.url();
        if (url.startsWith('weixin://')) {
          wxSchema = url;
        }
      });
      // 2. 拦截 frame 跳转
      page.on('framenavigated', (frame: any) => {
        const url = frame.url();
        if (url.startsWith('weixin://')) {
          wxSchema = url;
        }
      });
      // 3. 拦截新窗口（window.open）
      page.on('targetcreated', async (target: any) => {
        try {
          const url = target.url();
          if (url.startsWith('weixin://')) {
            wxSchema = url;
          }
        } catch {}
      });
      // 4. 拦截页面 console.log
      page.on('console', (msg: any) => {
        const text = msg.text();
        if (text.includes('weixin://')) {
          const match = text.match(/weixin:\/\/[\w\-\/?#=&%.]+/);
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
            (window as any)._WX_SCHEMA = url;
          }
          // 使用扩展运算符传递参数
          return originOpen.apply(this, [url] as any);
        };
        // 劫持 location.assign/replace
        const originAssign = window.location.assign;
        window.location.assign = function (url) {
          if (typeof url === 'string' && url.startsWith('weixin://')) {
            console.log('window.location.assign 捕获到微信schema:', url);
            // 赋值给全局变量
            (window as any)._WX_SCHEMA = url;
          }
          // 使用扩展运算符传递参数
          return originAssign.apply(this, [url] as any);
        };
        const originReplace = window.location.replace;
        window.location.replace = function (url) {
          if (typeof url === 'string' && url.startsWith('weixin://')) {
            console.log('window.location.replace 捕获到微信schema:', url);
            // 赋值给全局变量
            (window as any)._WX_SCHEMA = url;
          }
          // 使用扩展运算符传递参数
          return originReplace.apply(this, [url] as any);
        };
        // 劫持 iframe.src
        const originSetAttribute = HTMLIFrameElement.prototype.setAttribute;
        HTMLIFrameElement.prototype.setAttribute = function (name, value) {
          if (
            name === 'src' &&
            typeof value === 'string' &&
            value.startsWith('weixin://')
          ) {
            console.log('iframe.src 捕获到微信schema:', value);
            // 赋值给全局变量
            (window as any)._WX_SCHEMA = value;
          }
          // 使用扩展运算符传递参数
          return originSetAttribute.apply(this, [name, value] as any);
        };
      });

      // 打开商品下单页
      await page.goto(url, { waitUntil: 'networkidle2' });
      const [, payTypeBtn] = await to(
        // span with text: 微信支付
        page.waitForSelector('span ::-p-text(微信支付)', { timeout: 3000 })
      );
      console.log('type',payTypeBtn)
      // click 微信支付
      await payTypeBtn?.click();
      const [, payBtnV1] = await to(
        page.waitForSelector('span ::-p-text(立即支付)', { timeout: 3000 })
      );
      // click 立即支付
      await payBtnV1?.click();

       const [, payBtnV2] = await to(
        page.waitForSelector('span ::-p-text(提交订单)', { timeout: 3000 })
      );
      // click 立即支付
      await payBtnV2?.click();
      // 等待支付方式区域出现
      // 等待页面跳转和 schema 出现
      await new Promise((resolve) => setTimeout(resolve, 8000));
      // 兜底：在页面变量中查找 weixin://
      if (!wxSchema) {
        wxSchema = await page.evaluate(() => {
          // 先检查全局变量
          if ((window as any)._WX_SCHEMA) return (window as any)._WX_SCHEMA;
          // 检查所有a标签
          const aLinks = Array.from(document.querySelectorAll('a')).map(
            (a) => a.href
          );
          const wxLink = aLinks.find((link) => link.startsWith('weixin://'));
          if (wxLink) return wxLink;
          // 检查文本
          const bodyText = document.body.innerText;
          const match = bodyText.match(/weixin:\/\/[\w\-\/?#=&%.]+/);
          if (match) return match[0];
          return null;
        });
      }
      if (wxSchema) {
        console.log('最终捕获到微信schema:', wxSchema);
      } else {
        console.log('未捕获到微信schema');
      }
    } else if (type === 'zfb') {
      // 等待支付方式区域出现
      const [, payTypeBtn] = await to(
        // span with text: 支付宝
        page.waitForSelector('span ::-p-text(支付宝)', { timeout: 15000 })
      );
      // click 支付宝
      await payTypeBtn?.click();

      // 等待“立即支付”按钮出现并点击
      const [, payBtn] = await to(
        page.waitForSelector('span ::-p-text(立即支付)', { timeout: 10000 })
      );
      await payBtn?.click();
      // 等待跳转到支付二维码页面
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const keyWord = 'alipay://';
      // 1. 抓取所有 a 标签的 href
      const aLinks = await page.$$eval('a', (as: any) =>
        as.map((a: any) => a.href)
      );
      const alipayLinks = aLinks.filter((link: string) =>
        link.includes(keyWord)
      ); // 支付宝
      if (alipayLinks.length > 0) {
        zfbSchema = alipayLinks[0];
      }
      // 2. 检查 window.location.href
      const pageUrl = await page.evaluate(() => window.location.href);
      if (pageUrl.includes(keyWord)) {
        zfbSchema = pageUrl;
      }
      // 3. 检查 img src
      const imgSrcs = await page.$$eval('img', (imgs: any) =>
        imgs.map((img: any) => img.src)
      );
      const imgAlipayLinks = imgSrcs.filter((src: string) =>
        src.includes(keyWord)
      ); // 支付宝
      if (imgAlipayLinks.length > 0) {
        console.log('图片src中发现支付宝支付链接：', imgAlipayLinks);
        zfbSchema = imgAlipayLinks[0];
      }
      // 4. 检查 iframe src
      const iframeSrcs = await page.$$eval('iframe', (iframes: any) =>
        iframes.map((f: any) => f.src)
      );
      const iframeAlipayLinks = iframeSrcs.filter((src: string) =>
        src.includes(keyWord)
      );
      if (iframeAlipayLinks.length > 0) {
        console.log('iframe中发现支付宝支付链接：', iframeAlipayLinks);
        zfbSchema = iframeAlipayLinks[0];
      }
      // 5. 检查页面内所有文本内容（兜底）
      const bodyText = await page.evaluate(() => document.body.innerText);
      // alipay://
      const textAlipayLinks = (
        bodyText.match(/alipay:\/\/[\w\-\/?#=&%.]+/g) || []
      ).filter((link: string) => link.includes(keyWord));
      if (textAlipayLinks.length > 0) {
        console.log('页面文本中发现支付宝支付链接：', textAlipayLinks);
        zfbSchema = textAlipayLinks[0];
      }
    }
  }
  await browser.close();
  return {
    wxSchema,
    zfbSchema,
  };
}
// 支付宝/微信分流逻辑

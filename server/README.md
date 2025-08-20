# 拼多多多账号管理系统

本项目实现了拼多多的多账号管理与下单功能，支持账号切换、登录有效性检测以及下单操作。

## 功能特性

- 多账号登录与存储
- 账号切换
- 登录有效性检测
- 自动化下单（支持微信支付和支付宝）
- Web API 接口

## 安装依赖

```bash
npm install
```

## 使用方法

### 1. 命令行方式

- 登录新账号或切换账号：
  ```bash
  npm run account
  ```

- 测试账号存储：
  ```bash
  npm run test:accounts
  ```

### 2. Web API 方式

- 启动服务器：
  ```bash
  npm run server
  ```

- 服务器将运行在 `http://localhost:3000`

#### API 接口说明

- `GET /accounts` - 获取所有已保存的账号
- `POST /login/step1` - 触发获取验证码

  请求体参数：
  ```json
  {
    "mobile": "手机号"
  }
  ```
  
  响应：
  ```json
  {
    "message": "验证码已发送，请查收短信"
  }
  ```
  
- `POST /login/step2` - 完成登录

  请求体参数：
  ```json
  {
    "mobile": "手机号",
    "captcha": "验证码"
  }
  ```
  
  响应：
  ```json
  {
    "message": "登录成功"
  }
  ```
  
  或
  
  ```json
  {
    "error": "登录失败",
    "details": "错误详情"
  }
  ```
- `POST /switch-account/:phone` - 切换到指定手机号的账号
- `POST /order` - 提交下单请求

  请求体参数：
  ```json
  {
    "goodsId": "商品ID",
    "skuId": "SKU ID",
    "groupId": "组ID",
    "goodsNumber": "商品数量",
    "payType": "支付方式（微信或支付宝）"
  }
  ```

## 文件说明

- `login.js` - 多账号管理系统核心代码
- `order.js` - 下单系统核心代码
- `accounts.json` - 存储所有已登录账号的 cookies 信息
- `cookies.json` - 当前活动账号的 cookies 信息
- `server.js` - Koa 服务器，提供 Web API 接口

## 注意事项

1. 由于登录过程需要手动输入手机号和验证码，因此登录新账号时需要用户交互。
2. 微信支付需要在手机上打开微信客户端完成支付。
3. 请勿频繁请求接口，以免触发网站反爬机制。

## 贡献

欢迎提交 Issue 和 Pull Request 来改进本项目。
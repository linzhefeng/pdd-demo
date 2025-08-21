# 使用已经配置好puppeteer的镜像
FROM buildkite/puppeteer:latest

WORKDIR /app

# 设置Node.js版本为18
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && node --version \
    && npm --version

# 创建非root用户（buildkite镜像默认使用root）
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 拷贝项目文件
COPY . /app

# 切换用户
USER pptruser

# 安装依赖
RUN npm install --production && npm cache clean --force

# 暴露端口
EXPOSE 3000

# 启动应用
CMD ["npm", "start"]
    
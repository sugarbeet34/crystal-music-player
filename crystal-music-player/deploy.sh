#!/bin/bash

# 腾讯云部署脚本 - crystal-music-player

set -e

echo "🚀 开始部署水晶音乐播放器到腾讯云..."

# 检查Node.js版本
echo "📦 检查Node.js版本..."
node --version
npm --version

# 安装依赖
echo "📦 安装项目依赖..."
npm ci

# 构建应用
echo "🔨 构建应用..."
npm run build

# 检查构建结果
echo "✅ 构建完成，检查输出文件..."
ls -la out/

# 使用Serverless Framework部署
echo "☁️ 部署到腾讯云COS..."
npm install -g serverless
sls deploy

echo "🎉 部署完成！"
echo "🌐 应用地址：https://crystal-music-player-{appId}.cos-website.ap-guangzhou.myqcloud.com"
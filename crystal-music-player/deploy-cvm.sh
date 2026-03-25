#!/bin/bash

# 腾讯云CVM部署脚本

set -e

echo "🚀 开始部署到腾讯云CVM..."

# 更新系统
echo "🔄 更新系统包..."
sudo apt update
sudo apt upgrade -y

# 安装Node.js
echo "📦 安装Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
echo "✅ 验证Node.js安装..."
node --version
npm --version

# 安装Git
echo "📦 安装Git..."
sudo apt install -y git

# 克隆项目
echo "📥 克隆项目..."
git clone https://github.com/sugarbeet34/crystal-music-player.git
cd crystal-music-player

# 安装依赖
echo "📦 安装项目依赖..."
npm ci

# 构建应用
echo "🔨 构建应用..."
npm run build

# 安装PM2进程管理
echo "📦 安装PM2..."
sudo npm install -g pm2

# 启动应用
echo "🚀 启动应用..."
pm2 start npm --name "crystal-music-player" -- start
pm2 save
pm2 startup

echo "🎉 部署完成！"
echo "🌐 应用地址：http://服务器IP:3000/crystal-music-player"
echo "📊 查看应用状态：pm2 status"
echo "📝 查看应用日志：pm2 logs crystal-music-player"
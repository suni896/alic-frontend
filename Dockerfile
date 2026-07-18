# ALIC Frontend Dockerfile
# 单阶段构建：直接基于 nginx:alpine，复制 dist + nginx.conf + 证书
# 前置条件：dist/ 目录已由 npm run build 生成，ssl/ 目录已由 openssl 生成证书

FROM nginx:alpine

# 容器内 nginx 默认会把 80 和 443 暴露出去
EXPOSE 80 443

# 删除 nginx 自带的 default 配置（避免冲突）
RUN rm -f /etc/nginx/conf.d/default.conf

# 复制前端构建产物
COPY dist/ /usr/share/nginx/html/

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制 SSL 证书（核心：证书打入镜像，容器自带 HTTPS 能力）
COPY ssl/server-cert.crt /etc/nginx/ssl/server-cert.crt
COPY ssl/private-no-password.key /etc/nginx/ssl/private-no-password.key

# 确保证书文件权限正确（容器内 nginx worker 进程以 nginx 用户运行，需要可读）
RUN chmod 644 /etc/nginx/ssl/server-cert.crt \
    && chmod 600 /etc/nginx/ssl/private-no-password.key

# nginx 前台运行
CMD ["nginx", "-g", "daemon off;"]
/**
 * 群组头像生成工具
 * 使用 DiceBear API 根据群组名称生成唯一的机器人风格头像
 */

/**
 * 根据群组名称生成背景色
 * 使用简单的哈希算法确保同一群组始终生成相同颜色
 */
function generateBackgroundColor(name: string): string {
  // 预定义一组和谐的背景色
  const colors = [
    'e3f2fd', // 浅蓝
    'f3e5f5', // 浅紫
    'e8f5e9', // 浅绿
    'fff3e0', // 浅橙
    'fce4ec', // 浅粉
    'e0f7fa', // 浅青
    'f1f8e9', // 浅黄绿
    'ede7f6', // 浅紫灰
    'e8eaf6', // 浅靛蓝
    'fff8e1', // 浅琥珀
  ];
  
  // 使用名称的 charCode 总和来选取颜色
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

/**
 * 生成群组头像 URL
 * @param groupName 群组名称（作为种子，确保同一群组始终生成相同头像）
 * @param size 头像尺寸（像素）
 * @returns 头像图片 URL
 */
export function generateGroupAvatar(groupName: string, size: number = 128): string {
  const seed = encodeURIComponent(groupName);
  const backgroundColor = generateBackgroundColor(groupName);
  // colors=1 只生成一层圆环，避免多层彩色圆环
  return `https://api.dicebear.com/7.x/rings/svg?seed=${seed}&size=${size}&backgroundColor=${backgroundColor}&colors=1`;
}

/**
 * 生成用户头像 URL（使用另一种风格）
 * @param userName 用户名
 * @param size 头像尺寸
 * @returns 头像图片 URL
 */
export function generateUserAvatar(userName: string, size: number = 128): string {
  const seed = encodeURIComponent(userName);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&size=${size}`;
}

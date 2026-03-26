import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * 移动端键盘高度 Hook
 * 用于处理键盘弹起时的布局适配
 *
 * @returns [keyboardHeight, scrollToVisible] - 键盘高度和滚动函数
 *
 * @example
 * const [keyboardHeight, scrollToVisible] = useKeyboardInsets();
 *
 * // 在输入框获得焦点时调用
 * <input onFocus={scrollToVisible} />
 */
export function useKeyboardInsets(): [number, () => void] {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const scrollToVisible = useCallback(() => {
    // 延迟执行，确保键盘已经弹起
    setTimeout(() => {
      const viewport = window.visualViewport;
      if (!viewport) {
        return;
      }

      const currentKeyboardHeight = window.innerHeight - viewport.height;

      // 只有键盘弹起时才滚动
      if (currentKeyboardHeight > 100) {
        // 获取当前聚焦的输入元素
        const activeElement = document.activeElement as HTMLInputElement | HTMLTextAreaElement;
        if (activeElement) {
          inputRef.current = activeElement;
          // 计算元素位置，手动滚动
          const rect = activeElement.getBoundingClientRect();
          const elementBottom = rect.bottom;
          const visibleViewportHeight = viewport.height;
          const scrollMargin = 20; // 额外边距
          
          // 如果元素底部被键盘遮挡，滚动 main 容器
          if (elementBottom > visibleViewportHeight - scrollMargin) {
            // 找到 main 内容容器（Layout 中的 MainContent）
            const mainContent = document.querySelector('main');
            if (mainContent) {
              const scrollTarget = mainContent.scrollTop + elementBottom - visibleViewportHeight + currentKeyboardHeight + scrollMargin;
              mainContent.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
              });
            } else {
              // 回退到 body 滚动
              const scrollTarget = window.scrollY + elementBottom - visibleViewportHeight + currentKeyboardHeight + scrollMargin;
              window.scrollTo({
                top: scrollTarget,
                behavior: 'smooth'
              });
            }
          } else {
            // 使用默认 scrollIntoView
            activeElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        }
      }
    }, 100);
  }, []);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const handleResize = () => {
      const innerHeight = window.innerHeight;
      const viewportHeight = viewport.height;

      // 计算键盘高度
      const height = innerHeight - viewportHeight;

      // 只有当键盘高度大于 100px 时才认为是键盘弹起
      setKeyboardHeight(height > 100 ? height : 0);
    };

    // 初始调用一次
    handleResize();

    viewport.addEventListener('resize', handleResize);

    return () => {
      viewport.removeEventListener('resize', handleResize);
    };
  }, []);

  return [keyboardHeight, scrollToVisible];
}

/**
 * 带 ref 的版本 - 自动滚动到指定的元素
 */
export function useKeyboardInsetsWithRef<T extends HTMLInputElement | HTMLTextAreaElement>(
  inputRef: React.RefObject<T>
): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) {
      return;
    }

    const handleResize = () => {
      const innerHeight = window.innerHeight;
      const viewportHeight = viewport.height;
      const height = innerHeight - viewportHeight;
      setKeyboardHeight(height > 100 ? height : 0);
    };

    handleResize();

    // 监听键盘弹起
    const handleKeyboardShow = () => {
      // 键盘弹起后滚动到输入框
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 100);
    };

    viewport.addEventListener('resize', handleResize);
    // 监听 visualViewport 变化
    viewport.addEventListener('resize', handleKeyboardShow);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      viewport.removeEventListener('resize', handleKeyboardShow);
    };
  }, [inputRef]);

  return keyboardHeight;
}

export default useKeyboardInsets;

import { useState, useEffect } from 'react'

/**
 * 检测是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export const isMobileDevice = () => {
  return typeof window !== 'undefined' && window.innerWidth < 768
}

/**
 * 用于React组件的移动设备检测Hook
 * @returns {boolean} 是否为移动设备
 */
export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(isMobileDevice())

  useEffect(() => {
    // 监听窗口大小变化
    const handleResize = () => {
      setIsMobile(isMobileDevice())
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return isMobile
}

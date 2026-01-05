import { useState, useEffect } from 'react'

/**
 * 检测是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  
  // 检测移动设备的多种方法
  const isMobileWidth = window.innerWidth < 768
  const isMobileHeight = window.innerHeight < 600
  const hasMobileAspectRatio = window.innerWidth / window.innerHeight > 1.5 && window.innerWidth < 1024
  const userAgent = window.navigator.userAgent.toLowerCase()
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  
  // 综合判断：
  // 1. 屏幕宽度小于768px
  // 2. 或者屏幕高度小于600px（横屏情况）
  // 3. 或者宽高比大于1.5且宽度小于1024px（横屏平板）
  // 4. 或者通过user agent检测到是移动设备
  return isMobileWidth || isMobileHeight || hasMobileAspectRatio || isMobileUA
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

import { useState, useEffect } from 'react'

/**
 * 检测是否为移动设备
 * @returns {boolean} 是否为移动设备
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  
  const width = window.innerWidth
  const height = window.innerHeight
  const userAgent = window.navigator.userAgent.toLowerCase()
  
  // 检测是否为移动设备的 user agent
  const isMobileUA = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
  const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)
  
  // 基础判断：宽度小于768px
  if (width < 768) return true
  
  // 如果是移动设备或平板设备，且横屏时宽度小于1024px，仍然认为是移动端
  if ((isMobileUA || isTabletUA) && width < 1024) return true
  
  // 如果是移动设备，且高度小于500px（横屏情况），认为是移动端
  if (isMobileUA && height < 500) return true
  
  return false
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

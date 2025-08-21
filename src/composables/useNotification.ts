const NOTIFICATION_DURATION = {
  default: 3000,
  long: 5000
}

export function useNotification() {
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'warning', durationType: 'default' | 'long' = 'default') => {
    // Create container if it doesn't exist
    let container = document.getElementById('notification-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'notification-container'
      container.style.position = 'fixed'
      container.style.top = '20px'
      container.style.left = '50%'
      container.style.transform = 'translateX(-50%)'
      container.style.zIndex = '9999'
      container.style.maxWidth = '400px'
      document.body.appendChild(container)
    }

    // Create notification element
    const notificationElement = document.createElement('div')
    notificationElement.className = `notification notification-${type} slide-y-transition`
    notificationElement.style.cssText = `
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 8px;
      font-size: 14px;
      line-height: 1.4;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-100%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      position: relative;
      font-weight: 500;
      ${getTypeStyles(type)}
    `
    notificationElement.textContent = message
    
    container.appendChild(notificationElement)

    // Trigger slide-in animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notificationElement.style.transform = 'translateY(0)'
        notificationElement.style.opacity = '1'
      })
    })

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.style.transform = 'translateY(-100%)'
        notificationElement.style.opacity = '0'
        
        setTimeout(() => {
          if (notificationElement.parentNode) {
            container?.removeChild(notificationElement)
            if (container?.children.length === 0 && container.parentNode) {
              document.body.removeChild(container)
            }
          }
        }, 300)
      }
    }, NOTIFICATION_DURATION[durationType])
  }

  const getTypeStyles = (type: 'success' | 'error' | 'warning') => {
    switch (type) {
      case 'success':
        return 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
      case 'error':
        return 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      case 'warning':
        return 'background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7;'
      default:
        return 'background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;'
    }
  }

  return {
    showNotification
  }
}
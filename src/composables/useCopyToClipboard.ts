export function useCopyToClipboard() {
  const copyToClipboard = async (text: string, successMessage = '已複製到剪貼簿') => {
    try {
      await navigator.clipboard.writeText(text)
      showAlert(successMessage, 'success')
      return true
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
      
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        
        showAlert(successMessage, 'success')
        return true
      } catch (fallbackError) {
        showAlert('複製失敗，請手動複製', 'error')
        return false
      }
    }
  }

  const showAlert = (message: string, type: 'success' | 'error') => {
    // Create container if it doesn't exist
    let container = document.getElementById('copy-alert-container')
    if (!container) {
      container = document.createElement('div')
      container.id = 'copy-alert-container'
      container.style.position = 'fixed'
      container.style.top = '20px'
      container.style.left = '50%'
      container.style.transform = 'translateX(-50%)'
      container.style.zIndex = '9999'
      container.style.maxWidth = '300px'
      document.body.appendChild(container)
    }

    // Create simple alert element with Vuetify transition classes
    const alertElement = document.createElement('div')
    alertElement.className = `alert alert-${type} slide-y-transition`
    alertElement.style.cssText = `
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.4;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transform: translateY(-100%);
      opacity: 0;
      transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
      position: relative;
      ${type === 'success' 
        ? 'background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;'
        : 'background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
      }
    `
    alertElement.textContent = message
    
    container.appendChild(alertElement)

    // Trigger slide-in animation (Vuetify style)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        alertElement.style.transform = 'translateY(0)'
        alertElement.style.opacity = '1'
      })
    })

    // Auto remove after 3 seconds with slide-out animation
    setTimeout(() => {
      if (alertElement.parentNode) {
        alertElement.style.transform = 'translateY(-100%)'
        alertElement.style.opacity = '0'
        
        setTimeout(() => {
          if (alertElement.parentNode) {
            container?.removeChild(alertElement)
            if (container?.children.length === 0 && container.parentNode) {
              document.body.removeChild(container)
            }
          }
        }, 300)
      }
    }, 1000)
  }

  return {
    copyToClipboard
  }
}
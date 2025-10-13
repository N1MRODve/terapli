import { ref, computed, onMounted } from 'vue'

const visitorName = ref('')
const lastVisit = ref('')
const deviceType = ref('desktop')
const greeting = ref('')
const isFirstVisit = ref(true)

export function useVisitorContext() {
  // Inicializar en el cliente
  if (process.client) {
    const storedName = localStorage.getItem('visitorName')
    const storedLastVisit = localStorage.getItem('lastVisit')
    const hasVisited = localStorage.getItem('hasVisited')

    if (storedName) {
      visitorName.value = storedName
      isFirstVisit.value = false
    } else {
      isFirstVisit.value = !hasVisited
    }

    if (storedLastVisit) {
      lastVisit.value = storedLastVisit
    }
  }

  const setName = (name) => {
    if (!name || !name.trim()) return
    
    visitorName.value = name.trim()
    if (process.client) {
      localStorage.setItem('visitorName', visitorName.value)
      isFirstVisit.value = false
      localStorage.setItem('hasVisited', 'true')
    }
    updateGreeting()
  }

  const detectDevice = () => {
    if (process.client) {
      deviceType.value = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    }
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 19) return 'afternoon'
    return 'night'
  }

  const hasReturned = () => {
    if (!lastVisit.value) return false
    const lastVisitDate = new Date(lastVisit.value)
    const now = new Date()
    const daysSinceLastVisit = (now - lastVisitDate) / (1000 * 60 * 60 * 24)
    return daysSinceLastVisit > 1 // More than 24 hours
  }

  const updateGreeting = () => {
    const timeOfDay = getTimeOfDay()
    const isReturning = hasReturned()
    const name = visitorName.value

    let greetingText = ''

    // Build greeting based on context
    if (!name) {
      greetingText = 'Me alegra que estés aquí'
    } else if (isReturning) {
      greetingText = `Qué alegría verte de nuevo, ${name}`
    } else if (timeOfDay === 'morning') {
      greetingText = `${name}, espero que tu mañana esté siendo tranquila`
    } else if (timeOfDay === 'afternoon') {
      greetingText = `${name}, me alegra que estés aquí`
    } else {
      greetingText = `${name}, espero que tu día haya ido bien`
    }

    // Add mobile-specific message
    if (deviceType.value === 'mobile' && name) {
      greeting.value = `${greetingText}. Si lo prefieres, puedes escribirme directamente por WhatsApp 📱`
    } else {
      greeting.value = greetingText
    }

    // Update last visit timestamp
    if (process.client) {
      localStorage.setItem('lastVisit', new Date().toISOString())
    }
  }

  const clearVisitorData = () => {
    if (process.client) {
      localStorage.removeItem('visitorName')
      localStorage.removeItem('lastVisit')
      localStorage.removeItem('hasVisited')
      visitorName.value = ''
      lastVisit.value = ''
      isFirstVisit.value = true
      updateGreeting()
    }
  }

  // Helper function for easy personalization in templates
  const personalized = (neutral, withName) => {
    return visitorName.value ? withName.replace('{name}', visitorName.value) : neutral
  }

  onMounted(() => {
    if (process.client) {
      detectDevice()
      updateGreeting()
    }
  })

  return {
    visitorName: computed(() => visitorName.value),
    setName,
    greeting: computed(() => greeting.value),
    deviceType: computed(() => deviceType.value),
    isFirstVisit: computed(() => isFirstVisit.value),
    updateGreeting,
    clearVisitorData,
    getTimeOfDay,
    personalized
  }
}

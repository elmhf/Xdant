
export function parseJwt(token) {
    if (!token) return null
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }
  
  export function isTokenExpired(token) {
    if (!token) return true
    const payload = parseJwt(token)
    if (!payload || !payload.exp) return true
    const expiryTime = payload.exp * 1000 // بالـ ms
    return Date.now() > expiryTime
  }
  
  
  export function setHttpOnlyCookie(res, name, value, days = 7) {
    const maxAge = days * 24 * 60 * 60 * 1000 // تحويل الأيام إلى milliseconds
    
    res.setHeader('Set-Cookie', `${name}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge / 1000}`)
  }
  
  export function setMultipleHttpOnlyCookies(res, cookies) {
    const cookieStrings = cookies.map(({ name, value, days = 7 }) => {
      const maxAge = days * 24 * 60 * 60 * 1000
      return `${name}=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge / 1000}`
    })
    
    res.setHeader('Set-Cookie', cookieStrings)
  }
  
  export function deleteHttpOnlyCookie(res, name) {
    res.setHeader('Set-Cookie', `${name}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`)
  }
  
  export function getTokenFromRequest(cookieString) {
    if (!cookieString) return null
    
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = value
      }
      return acc
    }, {})
    
    return cookies.access_token || null
  }
  
  export function getRefreshTokenFromRequest(cookieString) {
    if (!cookieString) return null
    
    const cookies = cookieString.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      if (key && value) {
        acc[key] = value
      }
      return acc
    }, {})
    
    return cookies.refresh_token || null
  }
  
  export function saveTokensHttpOnly(res, { access_token, refresh_token }) {
    const cookies = [
      { name: 'access_token', value: access_token, days: 1 }, // يوم واحد للـ access token
      { name: 'refresh_token', value: refresh_token, days: 30 } // شهر للـ refresh token
    ]
    
    setMultipleHttpOnlyCookies(res, cookies)
  }
  
  export function clearTokensHttpOnly(res) {
    const cookieStrings = [
      'access_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0',
      'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    ]
    
    res.setHeader('Set-Cookie', cookieStrings)
  }

  const BACKEND_URL = 'http://localhost:5000';

  export async function fetchWithHttpOnlyAuth(url, options = {}) {
    // إضافة credentials للتأكد من إرسال الكوكيز
    const fetchOptions = {
      ...options,
      credentials: 'include', // مهم جداً لإرسال HttpOnly cookies
    }
    // Use full backend URL if not already absolute
    const fullUrl = url.startsWith('http') ? url : BACKEND_URL + url;
    const response = await fetch(fullUrl, fetchOptions)
    
    // إذا كانت الاستجابة 401، فهذا يعني أن التوكن منتهي الصلاحية
    if (response.status === 401) {
      // محاولة تجديد التوكن
      const refreshResponse = await fetch(BACKEND_URL + '/api/refresh-token', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (refreshResponse.ok) {
        // إعادة المحاولة بعد تجديد التوكن
        return fetch(fullUrl, fetchOptions)
      } else {
        // فشل في تجديد التوكن، إعادة توجيه للتسجيل
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        throw new Error('Authentication failed')
      }
    }
    
    return response
  }
  
  export async function checkAuthStatus() {
    try {
      const response = await fetch(BACKEND_URL + '/api/auth/status', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        return {
          isAuthenticated: data.isAuthenticated,
          user: data.user || null,
        }
      }
      
      return { isAuthenticated: false, user: null }
    } catch {
      return { isAuthenticated: false, user: null }
    }
  }
  
  export async function logout() {
    try {
      await fetch(BACKEND_URL + '/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }
  
  export async function login(email, password) {
    const response = await fetch(BACKEND_URL + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // مهم جداً باش يرسل الكوكيز تلقائياً
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      let err;
      try {
        err = await response.json();
      } catch {
        err = { error: await response.text() };
      }
      throw new Error(err.error || 'Login failed')
    }
  
    const data = await response.json()
    
    return data.user // معلومات المستخدم
  }

  
  // === مثال على API routes مطلوبة ===
  
  /*
  // pages/api/auth/login.js أو app/api/auth/login/route.js
  export async function POST(request) {
    try {
      // تسجيل الدخول والحصول على التوكنات
      const { email, password } = await request.json()
      const { access_token, refresh_token } = await authenticateUser(email, password)
      
      const response = NextResponse.json({ success: true })
      
      // حفظ التوكنات في HttpOnly cookies
      saveTokensHttpOnly(response, { access_token, refresh_token })
      
      return response
    } catch (error) {
      return NextResponse.json({ error: 'Login failed' }, { status: 401 })
    }
  }
  
  // pages/api/auth/status.js
  export async function GET(request) {
    try {
      const cookieHeader = request.headers.get('cookie')
      const token = getTokenFromRequest(cookieHeader)
      
      if (!token || isTokenExpired(token)) {
        return NextResponse.json({ isAuthenticated: false })
      }
      
      const payload = parseJwt(token)
      return NextResponse.json({ 
        isAuthenticated: true, 
        user: { id: payload.sub, email: payload.email } 
      })
    } catch {
      return NextResponse.json({ isAuthenticated: false })
    }
  }
  
  // pages/api/refresh-token.js
  export async function POST(request) {
    try {
      const cookieHeader = request.headers.get('cookie')
      const refreshToken = getRefreshTokenFromRequest(cookieHeader)
      
      if (!refreshToken) {
        throw new Error('No refresh token')
      }
      
      const { access_token, refresh_token } = await refreshUserToken(refreshToken)
      
      const response = NextResponse.json({ success: true })
      saveTokensHttpOnly(response, { access_token, refresh_token })
      
      return response
    } catch {
      const response = NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
      clearTokensHttpOnly(response)
      return response
    }
  }
  
  // pages/api/auth/logout.js
  export async function POST() {
    const response = NextResponse.json({ success: true })
    clearTokensHttpOnly(response)
    return response
  }
  */
const base = import.meta.env.BASE_URL  // always "/social-via-email/"

export function navigate(path) {
  window.history.pushState({}, '', base + path.replace(/^\//, ''))
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function getPath() {
  return window.location.pathname.slice(base.length - 1) || '/'
}

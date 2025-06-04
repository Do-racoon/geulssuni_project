// 성능 모니터링 유틸리티

interface PerformanceMetric {
  name: string
  startTime: number
  endTime?: number
  duration?: number
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map()
  private renderCounts: Map<string, number> = new Map()

  // 성능 측정 시작
  startMeasure(name: string) {
    const startTime = performance.now()
    this.metrics.set(name, {
      name,
      startTime,
    })
    console.log(`[Performance] Started measuring: ${name}`)
  }

  // 성능 측정 종료
  endMeasure(name: string) {
    const metric = this.metrics.get(name)
    if (!metric) {
      console.warn(`[Performance] No measurement found for: ${name}`)
      return
    }

    const endTime = performance.now()
    const duration = endTime - metric.startTime

    metric.endTime = endTime
    metric.duration = duration

    console.log(`[Performance] ${name} took ${duration.toFixed(2)}ms`)

    // 느린 작업 경고 (100ms 이상)
    if (duration > 100) {
      console.warn(`[Performance] Slow operation detected: ${name} (${duration.toFixed(2)}ms)`)
    }

    return duration
  }

  // 컴포넌트 렌더링 횟수 추적
  trackRender(componentName: string) {
    const currentCount = this.renderCounts.get(componentName) || 0
    const newCount = currentCount + 1
    this.renderCounts.set(componentName, newCount)

    console.log(`[Performance] ${componentName} rendered ${newCount} times`)

    // 과도한 렌더링 경고 (10회 이상)
    if (newCount > 10) {
      console.warn(`[Performance] Excessive renders detected: ${componentName} (${newCount} times)`)
    }

    return newCount
  }

  // 메모리 사용량 확인
  checkMemoryUsage() {
    if ("memory" in performance) {
      const memory = (performance as any).memory
      console.log(`[Performance] Memory usage:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`,
      })
    }
  }

  // 네트워크 요청 추적
  trackNetworkRequest(url: string, method = "GET") {
    const requestId = `${method} ${url}`
    this.startMeasure(`Network: ${requestId}`)

    return {
      end: () => this.endMeasure(`Network: ${requestId}`),
    }
  }

  // 모든 메트릭 출력
  printAllMetrics() {
    console.group("[Performance] All Metrics")

    console.log("Measurements:")
    this.metrics.forEach((metric) => {
      if (metric.duration) {
        console.log(`  ${metric.name}: ${metric.duration.toFixed(2)}ms`)
      }
    })

    console.log("Render Counts:")
    this.renderCounts.forEach((count, component) => {
      console.log(`  ${component}: ${count} renders`)
    })

    this.checkMemoryUsage()
    console.groupEnd()
  }

  // 메트릭 초기화
  reset() {
    this.metrics.clear()
    this.renderCounts.clear()
    console.log("[Performance] Metrics reset")
  }
}

// 싱글톤 인스턴스
export const performanceMonitor = new PerformanceMonitor()

// React Hook for performance tracking
export function usePerformanceTracking(componentName: string) {
  performanceMonitor.trackRender(componentName)
}

// API 요청 래퍼
export async function trackApiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const tracker = performanceMonitor.trackNetworkRequest(url, options?.method)

  try {
    const response = await fetch(url, options)
    const data = await response.json()
    tracker.end()
    return data
  } catch (error) {
    tracker.end()
    throw error
  }
}

// ui-status: approved
// ui-atom
// ui-behaviour: documents.md
import { useDelayedLoading } from '@design-pack/ui/hooks/use-delayed-loading'
import { Skeleton } from '@design-pack/ui/components/ui/skeleton'
import { logger } from '@design-pack/shared/logger'
import { useEffect, useRef, useState } from 'react'
import { ErrorState } from './ErrorState'

/**
 * A PDF drawn into the page, every page at the card's width — the document "as
 * printed", as the design shows it. Drawn with PDF.js rather than left to the
 * browser: an embedded PDF is not shown at all on Android's browser and only its
 * first page on iOS, and the phone is the primary target.
 *
 * Client-only; PDF.js and its worker load on first use. Its legacy build, never the
 * default: the default calls JavaScript built-ins too new for the Safari on iOS 18
 * (`Map.prototype.getOrInsertComputed`, `Math.sumPrecise`), so every PDF fails there.
 */
export function PdfPages({ src, title }: { src: string; title: string }) {
  const holder = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading')
  const showSkeleton = useDelayedLoading(state === 'loading')

  useEffect(() => {
    let cancelled = false
    const host = holder.current
    if (!host) return
    setState('loading')

    async function draw(container: HTMLDivElement) {
      const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
      const worker = await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default
      const pdf = await pdfjs.getDocument({ url: src, withCredentials: true }).promise
      const width = container.clientWidth
      const ratio = window.devicePixelRatio || 1
      const canvases: HTMLCanvasElement[] = []
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n)
        const base = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: (width / base.width) * ratio })
        const canvas = document.createElement('canvas')
        canvas.width = Math.floor(viewport.width)
        canvas.height = Math.floor(viewport.height)
        canvas.className = 'block w-full'
        canvas.setAttribute('role', 'img')
        canvas.setAttribute('aria-label', `${title}, page ${n} of ${pdf.numPages}`)
        await page.render({ canvas, viewport }).promise
        canvases.push(canvas)
      }
      if (cancelled) return
      container.replaceChildren(...canvases)
      setState('ready')
    }

    draw(host).catch((err: unknown) => {
      logger.error({ err, src }, 'drawing a PDF in the page failed')
      if (!cancelled) setState('failed')
    })
    return () => {
      cancelled = true
    }
  }, [src, title])

  return (
    <>
      {state === 'failed' && <ErrorState general="This document couldn't be shown here. Use Download to save it instead." />}
      {state === 'loading' && showSkeleton && <Skeleton className="aspect-[17/22] w-full" />}
      <div ref={holder} />
    </>
  )
}

'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from '@/components/ui/button'
import { Eraser, Check, RotateCcw, Pen, Hand } from 'lucide-react'

interface SignaturePadProps {
  onSignatureChange: (signatureData: string | null) => void
  width?: number
  height?: number
  className?: string
}

export default function SignaturePad({
  onSignatureChange,
  width = 500,
  height = 200,
  className = ''
}: SignaturePadProps) {
  const signatureRef = useRef<SignatureCanvas>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width, height })

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is IE specific
        navigator.msMaxTouchPoints > 0
      )
    }
    checkTouchDevice()
  }, [])

  // Handle responsive canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth
        const newWidth = Math.min(containerWidth - 2, width) // -2 for border
        const aspectRatio = height / width
        const newHeight = Math.round(newWidth * aspectRatio)
        setCanvasSize({ width: newWidth, height: Math.max(newHeight, 150) })
      }
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [width, height])

  const handleEnd = useCallback(() => {
    if (signatureRef.current) {
      const isCanvasEmpty = signatureRef.current.isEmpty()
      setIsEmpty(isCanvasEmpty)
      if (!isCanvasEmpty) {
        const signatureData = signatureRef.current.toDataURL('image/png')
        onSignatureChange(signatureData)
      } else {
        onSignatureChange(null)
      }
    }
  }, [onSignatureChange])

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear()
      setIsEmpty(true)
      onSignatureChange(null)
    }
  }

  const handleUndo = () => {
    if (signatureRef.current) {
      const data = signatureRef.current.toData()
      if (data && data.length > 0) {
        data.pop()
        signatureRef.current.fromData(data)
        handleEnd()
      }
    }
  }

  return (
    <div className={`space-y-3 ${className}`} ref={containerRef}>
      {/* Device indicator */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          {isTouchDevice ? (
            <>
              <Hand className="w-4 h-4 text-blue-500" />
              <span>Use your finger to sign</span>
            </>
          ) : (
            <>
              <Pen className="w-4 h-4 text-blue-500" />
              <span>Use your mouse to sign</span>
            </>
          )}
        </div>
        {!isEmpty && (
          <span className="flex items-center gap-1 text-green-600">
            <Check className="w-4 h-4" />
            Signed
          </span>
        )}
      </div>

      {/* Signature Canvas */}
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg bg-white overflow-hidden">
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            width: canvasSize.width,
            height: canvasSize.height,
            className: 'signature-canvas cursor-crosshair touch-none',
            style: {
              width: '100%',
              height: canvasSize.height,
              touchAction: 'none'
            }
          }}
          onEnd={handleEnd}
          dotSize={2}
          minWidth={1}
          maxWidth={3}
          throttle={16}
          velocityFilterWeight={0.7}
        />

        {/* Signature line */}
        <div className="absolute bottom-8 left-4 right-4 border-b border-gray-300" />
        <span className="absolute bottom-2 left-4 text-xs text-gray-400">
          Sign above the line
        </span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={isEmpty}
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty}
          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Eraser className="w-4 h-4 mr-1" />
          Clear
        </Button>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 text-center">
        {isTouchDevice
          ? 'Draw your signature using your finger on the canvas above'
          : 'Click and drag to draw your signature on the canvas above'}
      </p>
    </div>
  )
}

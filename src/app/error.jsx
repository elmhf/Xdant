'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import Lottie from 'lottie-react'
import errorAnimation from './Lottie/error.json'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('🧨 Unexpected Error:', error)
  }, [error])

  return (
    <div className="min-h-screen min-w-screen flex flex-col items-center justify-center bg-transparent px-4 py-10">
      <div className=" flex flex-col items-center rounded-2xl p-8 max-w-md text-center space-y-6">
        <Lottie
          animationData={errorAnimation}
          style={{ width: 300, height: 300 }}
          loop={true}
        />
        <h2 className="text-2xl font-bold">Une erreur inattendue s'est produite</h2>
        <p className="text-muted-foreground">
          Désolé, une erreur s'est produite lors du chargement de la page. Veuillez réessayer.
        </p>
        <Button onClick={() => reset()} className="w-full bg-[#7c5cff] text-white hover:bg-[#6a4ed8]">

          Réessayer
        </Button>
      </div>
    </div>
  )
}

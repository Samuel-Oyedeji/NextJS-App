"use client"

import { useEffect, useState } from "react"

interface LoadingScreenProps {
  cycleDuration?: number
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ cycleDuration = 5000 }) => {
  const [loaded, setLoaded] = useState<boolean>(false)
  const [animationState, setAnimationState] = useState<"hidden" | "entering" | "waving" | "exiting">("hidden")
  const text: string = "RealSocial"

  useEffect(() => {
    let isMounted = true

    // Simulate loading
    const timer = setTimeout(() => {
      if (isMounted) setLoaded(true)
    }, 3000)

    // Animation cycle management
    const enterDuration = 800 // Time to enter
    const waveDuration = 1500 // Time to complete one wave
    const exitDuration = 800 // Time to exit
    const pauseDuration = cycleDuration - (enterDuration + waveDuration + exitDuration)

    const animationCycle = async () => {
      while (isMounted) {
        setAnimationState("hidden")
        await new Promise((resolve) => setTimeout(resolve, 100)) // Brief pause in hidden state

        setAnimationState("entering")
        await new Promise((resolve) => setTimeout(resolve, enterDuration))

        setAnimationState("waving")
        await new Promise((resolve) => setTimeout(resolve, waveDuration))

        setAnimationState("exiting")
        await new Promise((resolve) => setTimeout(resolve, exitDuration))

        await new Promise((resolve) => setTimeout(resolve, pauseDuration))
      }
    }

    animationCycle()

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [cycleDuration])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-20 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 text-center">
        {/* Logo text with gradient and controlled animation */}
        <div className="h-24 md:h-32 flex justify-center overflow-hidden">
          {text.split("").map((char, index) => (
            <span
              key={index}
              className={`text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r 
                from-[#ff1493] via-[#800080] to-[#00b7eb] inline-block transition-all duration-500
                ${animationState === "hidden" ? "opacity-0 -translate-y-full" : ""}
                ${animationState === "entering" ? "opacity-100 translate-y-0 entering" : ""}
                ${animationState === "waving" ? "opacity-100 translate-y-0 waving" : ""}
                ${animationState === "exiting" ? "opacity-0 -translate-y-full exiting" : ""}
              `}
              style={{
                transitionDelay: `${index * 50}ms`,
                animationDelay: `${index * 80}ms`,
              }}
            >
              {char}
            </span>
          ))}
        </div>

        {/* Success message */}
        <p
          className={`mt-8 text-white text-xl transition-all duration-500 
            ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
        >
          Welcome to the social experience
        </p>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: scale(1) translate(0px, 0px); }
          33% { transform: scale(1.1) translate(30px, -50px); }
          66% { transform: scale(0.9) translate(-20px, 20px); }
          100% { transform: scale(1) translate(0px, 0px); }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .entering {
          transition: opacity 800ms ease-out, transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes singleWave {
          0% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
          100% { transform: translateY(0); }
        }
        
        .waving {
          animation: singleWave 1500ms cubic-bezier(0.45, 0, 0.55, 1) forwards;
        }
        
        .exiting {
          transition: opacity 800ms ease-in, transform 800ms cubic-bezier(0.7, 0, 0.84, 0);
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen

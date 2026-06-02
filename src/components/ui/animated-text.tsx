import * as React from "react"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"

interface AnimatedTextProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string
  duration?: number
  delay?: number
  replay?: boolean
  className?: string
  textClassName?: string
  underlineClassName?: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span"
  textStyle?: React.CSSProperties
  underlineStyle?: React.CSSProperties
}

const AnimatedText = React.forwardRef<HTMLDivElement, AnimatedTextProps>(
  ({
    text,
    duration = 0.5,
    delay = 0.1,
    replay = true,
    className = "",
    textClassName = "",
    underlineClassName = "",
    as: Component = "h1",
    textStyle = {},
    underlineStyle = {},
    ...props
  }, ref) => {
    const letters = Array.from(text)

    const container: Variants = {
      hidden: { 
        opacity: 0 
      },
      visible: (i: number = 1) => ({
        opacity: 1,
        transition: { 
          staggerChildren: duration, 
          delayChildren: i * delay 
        }
      })
    }

    const child: Variants = {
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 200
        }
      },
      hidden: {
        opacity: 0,
        y: 20,
        transition: {
          type: "spring",
          damping: 12,
          stiffness: 200
        }
      }
    }

    const lineVariants: Variants = {
      hidden: {
        width: "0%",
        left: "50%"
      },
      visible: {
        width: "100%",
        left: "0%",
        transition: {
          delay: letters.length * delay,
          duration: 0.8,
          ease: "easeOut"
        }
      }
    }

    return (
      <div 
        ref={ref} 
        className={className}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: '8px', ...props.style }}
        {...props}
      >
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <motion.div
            style={{ display: "flex", overflow: "hidden", ...textStyle }}
            variants={container}
            initial="hidden"
            animate={replay ? "visible" : "hidden"}
            className={textClassName}
          >
            {letters.map((letter, index) => (
              <motion.span key={index} variants={child}>
                {letter === " " ? "\u00A0" : letter}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            className={underlineClassName}
            style={{
              position: 'absolute',
              bottom: '-4px',
              height: '2px',
              background: 'linear-gradient(to right, #73020D, #116BAB, #73020D)',
              ...underlineStyle
            }}
          />
        </div>
      </div>
    )
  }
)
AnimatedText.displayName = "AnimatedText"

export { AnimatedText }

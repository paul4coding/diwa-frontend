import React from 'react';
import { motion } from 'framer-motion';

const LoadingDots = () => {
  const dotVariants = {
    initial: { opacity: 0.3 },
    animate: { opacity: 1 }
  };

  const containerVariants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatType: "reverse" as const,
        duration: 0.6
      }
    }
  };

  return (
    <motion.div 
      style={{ display: 'inline-flex', gap: '4px', alignItems: 'center', justifyContent: 'center' }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          variants={dotVariants}
          style={{
            width: '6px',
            height: '6px',
            backgroundColor: 'currentColor',
            borderRadius: '50%',
            display: 'inline-block'
          }}
        />
      ))}
    </motion.div>
  );
};

export default LoadingDots;

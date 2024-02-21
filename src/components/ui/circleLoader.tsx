import { motion } from 'framer-motion';

export function CircleLoader() {
  return (
    <div className="relative w-12 h-12 box-border">
      <motion.span
        className="block w-12 h-12 border-4 border-gray-300 border-t-4 border-t-blue-500 rounded-full absolute box-border top-0 left-0"
        animate={{ rotate: 360 }}
        transition={{
          loop: Infinity,
          ease: "linear",
          duration: 1000,
        }}
        style={{
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
}

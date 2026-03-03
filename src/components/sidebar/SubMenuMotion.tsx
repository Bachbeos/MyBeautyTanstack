import { motion, AnimatePresence } from "framer-motion";
import React from "react";

type SubMenuMotionProps = {
  open: boolean;
  children: React.ReactNode;
};

export default function SubMenuMotion({ open, children }: SubMenuMotionProps) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.ul
          initial="collapsed"
          animate="open"
          exit="collapsed"
          variants={{
            open: { height: "auto", opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
            collapsed: { height: 0, opacity: 0, transition: { duration: 0.2, ease: "easeIn" } }
          }}
          style={{ overflow: "hidden", display: "block" }}
        >
          {children}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}

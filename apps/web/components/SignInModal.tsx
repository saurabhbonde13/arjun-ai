"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import { Github, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SignInModal({ open, onClose }: Props) {
  const router = useRouter();

  function handleGuest() {
    onClose();                // close the modal
    router.push("/app");      // navigate to workspace
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* dark overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        {/* modal panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-sm rounded-2xl bg-[#0B1120] text-white p-6 shadow-glow border border-white/10">
              <Dialog.Title className="text-xl font-semibold text-center mb-4">
                Sign in to ArjunAI
              </Dialog.Title>

              <div className="flex flex-col gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center gap-2 bg-white text-black font-semibold py-2 rounded-xl"
                >
                  <Mail size={18} /> Continue with Google
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-2 rounded-xl"
                >
                  <Github size={18} /> Continue with GitHub
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleGuest}
                  className="flex items-center justify-center gap-2 bg-accent text-black py-2 rounded-xl font-semibold"
                >
                  <User size={18} /> Continue as Guest
                </motion.button>
              </div>

              <p className="text-xs text-center text-slate-400 mt-4">
                OAuth coming soon – Guest Mode active ✅
              </p>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

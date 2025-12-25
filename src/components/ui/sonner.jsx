import React from "react";
import { Toaster as Sonner } from "sonner";
import { Check, X } from "lucide-react";

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      closeButton
      icons={{
        success: (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#3C7A57]">
            <Check className="h-4 w-4 text-white" />
          </span>
        ),
      }}
      closeButtonIcon={<X className="h-5 w-5 text-red-500" />}
      toastOptions={{
        classNames: {
          toast:
            "!w-[380px] max-w-[92vw] !rounded-2xl !px-4 !py-3 !gap-3 !opacity-100 " +
            "!flex !items-start !border !border-[#DCEEE3] !bg-[#EAF7EE] " +
            "!shadow-[0_12px_28px_rgba(0,0,0,0.10)]",
          title: "!text-[#1F3A2A] !text-sm !font-semibold",
          description: "!text-[#1F3A2A]/70 !text-sm",
          closeButton:
            "!bg-transparent !border-0 hover:!bg-red-50 !p-1 !rounded-md",
          success: "",
        },
      }}
    />
  );
}

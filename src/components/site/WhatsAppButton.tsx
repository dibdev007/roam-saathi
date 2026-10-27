"use client";

import * as React from "react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { Button, type ButtonProps } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

type WhatsAppButtonProps = {
  message: string;
  phone?: string;
  children?: React.ReactNode;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  /** Open in a new tab (default true). */
  newTab?: boolean;
};

/**
 * A button that opens WhatsApp click-to-chat with a prefilled message.
 */
export function WhatsAppButton({
  message,
  phone,
  children = "Book on WhatsApp",
  variant = "default",
  size = "default",
  className,
  newTab = true,
}: WhatsAppButtonProps) {
  const href = buildWhatsAppUrl(message, phone);
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
    >
      <a
        href={href}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noopener noreferrer" : undefined}
        aria-label={typeof children === "string" ? children : "Open WhatsApp"}
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {children}
      </a>
    </Button>
  );
}

export default WhatsAppButton;

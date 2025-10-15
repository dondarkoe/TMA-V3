
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

export default function ChatInput({ onSendMessage, onSend, isLoading = false, disabled }) {
  const [value, setValue] = React.useState("");

  const handleSend = () => {
    const v = value.trim();
    if (!v || disabled || isLoading) return;
    const handler = onSendMessage || onSend;
    if (typeof handler === "function") {
      handler(v);
    }
    setValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        className="flex-1 backdrop-blur-xl bg-black/60 border-blue-500/40 text-white placeholder-gray-400 py-3 px-4 rounded-xl"
        disabled={disabled || isLoading}
      />
      <Button
        onClick={handleSend}
        disabled={disabled || isLoading || !value.trim()}
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-4 py-3 rounded-xl shadow"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </div>
  );
}

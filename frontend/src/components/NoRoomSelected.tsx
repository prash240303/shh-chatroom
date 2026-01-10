import { Globe, Copy, Sparkles, AppWindowIcon, Trash2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { useState } from 'react';
import { Button } from './ui/button';
import { Logo } from "../../public/Logo"
import { cn } from '@/lib/utils';
import RippleButton from './ui/RippleButton';

const NoRoomSelected = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  return (
    <div className="w-full shh my-auto max-w-md rounded-3xl p-8 space-y-6 bg-card text-card-foreground border border-border transition-colors">
      <div className="mx-auto w-[100px] text-primary h-[100px]">
        {/* Light mode logo */}
        <Logo />
      </div>

      <div className="space-y-3">
        <div className="w-full bg-muted hover:bg-accent text-muted-foreground hover:text-black dark:hover:text-white transition-colors rounded-xl p-4 flex items-center gap-3 cursor-pointer">
          <Sparkles className="w-5 h-5 text-primary" />
          <span>Instant encrypted chats 3 (Soon)</span>
        </div>

        <div className="w-full bg-muted hover:bg-accent text-muted-foreground hover:text-black dark:hover:text-white transition-colors rounded-xl p-4 flex items-center gap-3 cursor-pointer">
          <AppWindowIcon className="w-5 h-5 text-primary" />
          <span>Launch from any app</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">How it Works</h2>

        <div className="space-y-3">
          <div className="w-full bg-muted hover:bg-accent text-muted-foreground hover:text-black dark:hover:text-white transition-colors rounded-xl p-4 flex items-center gap-3 cursor-pointer">
            <Globe className="w-5 h-5 text-primary" />
            <span>Go to shh.com</span>
          </div>

          <div className="w-full bg-muted hover:bg-accent text-muted-foreground hover:text-black dark:hover:text-white transition-colors rounded-xl p-4 flex items-center gap-3 cursor-pointer">
            <Copy className="w-5 h-5 text-primary" />
            <span>Copy your new chat link</span>
          </div>

          <div className="w-full bg-muted hover:bg-accent text-muted-foreground hover:text-black dark:hover:text-white transition-colors rounded-xl p-4 flex items-center gap-3 cursor-pointer">
            <Trash2Icon className="w-5 h-5 text-primary" />
            <span>Instantly delete chats</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          className={cn(
            "relative overflow-hidden flex-1 h-full bg-chatPrimary text-white hover:bg-chatPrimary/90 hover:scale-[102%] ease-in-out duration-500 transition-all rounded-full py-3 px-3 text-lg ",
          )}
        >
          @shh
        </Button>


        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <RippleButton>
              Create Room
            </RippleButton>
          </DialogTrigger>
          <DialogContent className="bg-card border-border shadow-md">
            <DialogHeader>
              <DialogTitle className="text-card-foreground">Create a new room</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter a name for your new chat room.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter a room name"
              className="bg-input text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring transition-colors"
            />
            <DialogFooter>
              <Button
                variant="outline"
                className="bg-secondary border-border text-secondary-foreground hover:bg-accent"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setNewRoomName("")}
              >
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
export default NoRoomSelected;
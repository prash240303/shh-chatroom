import { Globe, Copy, Sparkles, AppWindowIcon, Trash2Icon } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
// import { ScrollArea } from "./ui/scroll-area";
import { Input } from "./ui/input";
import { useState } from 'react';
import { Button } from './ui/button';

const NoRoomSelected = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  return (
    <div className="w-full shh my-auto max-w-md rounded-3xl p-8 space-y-6 bg-neutral-200 dark:bg-neutral-800 text-white dark:text-white transition-colors">
      <div className="mx-auto w-[100px] h-[100px]">
        {/* Light mode logo */}
        <img
          src="/LogoLight.svg"
          className="block dark:hidden"
          width={100}
          height={100}
          alt="Light Mode Logo"
        />
        {/* Dark mode logo */}
        <img
          src="/LogoDark.svg"
          className="hidden dark:block"
          width={100}
          height={100}
          alt="Dark Mode Logo"
        />
      </div>

      <div className="space-y-3">
        <div className="w-full bg-neutral-300 pointer text-black hover:bg-neutral-400 dark:bg-[#2A2A2A] dark:text-neutral-200 dark:hover:bg-[#303030] transition-colors rounded-xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <span className="text-black dark:text-neutral-400">Instant encrypted chats</span>
        </div>

        <div className="w-full bg-neutral-300 pointer text-black hover:bg-neutral-400 dark:bg-[#2A2A2A] dark:text-neutral-200 dark:hover:bg-[#303030] transition-colors rounded-xl p-4 flex items-center gap-3">
          <AppWindowIcon className="w-5 h-5" />
          <span className="text-black dark:text-neutral-400">Launch from any app</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-black dark:text-white">How it Works</h2>

        <div className="space-y-3">
          <div className="w-full bg-neutral-300 text-black pointer-none hover:bg-neutral-400 dark:bg-[#2A2A2A] dark:text-neutral-200 dark:hover:bg-[#303030] transition-colors rounded-xl p-4 flex items-center gap-3">
            <Globe className="w-5 h-5" />
            <span className="text-black cursor-pointer dark:text-neutral-400">Go to shh.com</span>
          </div>

          <div className="w-full bg-neutral-300 text-black pointer-none hover:bg-neutral-400 dark:bg-[#2A2A2A] dark:text-neutral-200 dark:hover:bg-[#303030] transition-colors rounded-xl p-4 flex items-center gap-3">
            <Copy className="w-5 h-5" />
            <span className="text-black cursor-pointer dark:text-neutral-400">Copy your new chat link</span>
          </div>

          <div className="w-full bg-neutral-300 text-black  pointer-none hover:bg-neutral-400 dark:bg-[#2A2A2A] dark:text-neutral-200 dark:hover:bg-[#303030] transition-colors rounded-xl p-4 flex items-center gap-3">
            <Trash2Icon className="w-5 h-5" />
            <span className="text-black  cursor-pointer dark:text-neutral-400">Instantly delete chats</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button className="flex-1 h-full bg-neutral-900 text-white hover:bg-neutral-700 hover:scale-[102%] ease-in-out duration-500 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-all rounded-full py-3 px-3 text-lg">
          @shh
        </Button>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-black font-medium text-lg bg-white inline-block w-fit border hover:scale-[102%] ease-in-out duration-500 border-neutral-400 dark:border-neutral-600 rounded-full px-8 hover:text-black dark:hover:text-white py-3 h-full transition-all  hover:bg-neutral-200 dark:hover:bg-neutral-500">
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-neutral-800 border-none shadow-md rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-black dark:text-white">Create a new room</DialogTitle>
              <DialogDescription className="text-neutral-600 dark:text-neutral-400">
                Enter a name for your new chat room.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter a room name"
              className="bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-neutral-500 dark:focus:ring-neutral-400"
            />
            <DialogFooter>
              <Button
                variant="outline"
                className="bg-neutral-200 dark:bg-neutral-800 border border-neutral-400 dark:border-neutral-600 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                className="bg-neutral-900 dark:bg-black text-white hover:bg-neutral-800 dark:hover:bg-neutral-700"
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
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { TodoHeader } from "./TodoHeader";
import { TodoList } from "./TodoList";
import { TodoInput } from "./TodoInput";

export function TodoApp() {
  const [activeTab, setActiveTab] = useState<"personal" | "professional">(
    "personal",
  );

  return (
    <div className="flex flex-col min-h-screen w-screen bg-white">
      <TodoHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex items-start justify-center p-8 pb-0 md:pb-8">
        <div className="w-full max-w-3xl">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(value as "personal" | "professional")
            }
            className="w-full"
          >
            <TabsContent value="personal" className="mt-0">
              <TodoList category="personal" />
            </TabsContent>
            <TabsContent value="professional" className="mt-0">
              <TodoList category="professional" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile bottom input */}
      <div className="md:hidden sticky bottom-0 bg-white border-t border-border p-4 shadow-lg">
        <div className="w-full max-w-3xl mx-auto">
          <TodoInput category={activeTab} />
        </div>
      </div>
    </div>
  );
}

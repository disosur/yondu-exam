import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TodoHeaderProps {
  activeTab: "personal" | "professional";
  onTabChange: (tab: "personal" | "professional") => void;
}

export function TodoHeader({ activeTab, onTabChange }: TodoHeaderProps) {
  return (
    <div className="bg-card">
      <div className="max-w-3xl mx-auto px-8 py-6">
        <div className="text-center mb-6">
          <h1 className="text-5xl font-light tracking-wide">
            <span className="text-foreground">TO</span>
            <span className="text-primary">DO</span>
          </h1>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            onTabChange(value as "personal" | "professional")
          }
          className="w-full"
        >
          <TabsList
            variant="line"
            className="grid grid-cols-2 h-auto p-0 bg-transparent w-full"
          >
            <TabsTrigger
              value="personal"
              className="rounded-none bg-transparent pb-4 shadow-none text-base font-medium after:bg-primary after:h-1"
            >
              Personal
            </TabsTrigger>
            <TabsTrigger
              value="professional"
              className="rounded-none bg-transparent pb-4 shadow-none text-base font-medium after:bg-primary after:h-1"
            >
              Professional
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

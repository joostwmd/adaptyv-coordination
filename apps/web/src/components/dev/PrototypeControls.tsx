import { Button } from "@adaptyv-coordination/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@adaptyv-coordination/ui/components/card";
import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { RotateCcw, Database, Users, FlaskConical, CheckSquare, FileText } from "lucide-react";
import { 
  usePrototypeStore, 
  useExperimentCount, 
  useTaskCount, 
  useStaffCount, 
  useContextItemCount,
  usePendingTaskCount,
  useSuccessTaskCount,
  useFailedTaskCount
} from "@/stores/usePrototypeStore";
import { useState } from "react";

export function PrototypeControls() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const resetToSeeds = usePrototypeStore((state) => state.resetToSeeds);
  const experimentCount = useExperimentCount();
  const taskCount = useTaskCount();
  const staffCount = useStaffCount();
  const contextItemCount = useContextItemCount();
  const pendingCount = usePendingTaskCount();
  const successCount = useSuccessTaskCount();
  const failedCount = useFailedTaskCount();
  
  // Hide in production
  if (import.meta.env.PROD) return null;
  
  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsCollapsed(false)}
          size="sm"
          variant="outline"
          className="bg-card border shadow-lg"
        >
          <Database className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-sm">Prototype Data</CardTitle>
          </div>
          <Button
            onClick={() => setIsCollapsed(true)}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
        <CardDescription className="text-xs">
          Development controls for in-memory data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Data Overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-xs">
            <FlaskConical className="h-3 w-3 text-green-500" />
            <span className="text-muted-foreground">Experiments:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {experimentCount}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <CheckSquare className="h-3 w-3 text-blue-500" />
            <span className="text-muted-foreground">Tasks:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {taskCount}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3 w-3 text-purple-500" />
            <span className="text-muted-foreground">Staff:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {staffCount}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3 text-orange-500" />
            <span className="text-muted-foreground">Context:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {contextItemCount}
            </Badge>
          </div>
        </div>
        
        {/* Task Status Breakdown */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">Task Status</div>
          <div className="flex gap-2">
            <Badge 
              variant="outline" 
              className="h-5 text-xs text-yellow-600 border-yellow-200 bg-yellow-50"
            >
              Pending: {pendingCount}
            </Badge>
            <Badge 
              variant="outline" 
              className="h-5 text-xs text-green-600 border-green-200 bg-green-50"
            >
              Success: {successCount}
            </Badge>
            <Badge 
              variant="outline" 
              className="h-5 text-xs text-red-600 border-red-200 bg-red-50"
            >
              Failed: {failedCount}
            </Badge>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={resetToSeeds} 
            size="sm" 
            variant="outline"
            className="w-full h-8 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset to Seed Data
          </Button>
          
          <div className="text-xs text-muted-foreground text-center">
            All changes reset on page reload
          </div>
        </div>
        
        {/* Mode Indicator */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700">Prototype Mode</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
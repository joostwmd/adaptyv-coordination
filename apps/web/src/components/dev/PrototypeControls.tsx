import { Button } from "@adaptyv-coordination/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@adaptyv-coordination/ui/components/card";
import { Badge } from "@adaptyv-coordination/ui/components/badge";
import { RotateCcw, Database, Users, FlaskConical, CheckSquare, FileText } from "lucide-react";
import {
  usePrototypeStore,
  useExperimentCount,
  useStaffCount,
} from "@/stores/usePrototypeStore";
import {
  usePlanningStore,
  usePlanningTasks,
  usePlanningTickets,
  usePlanningWorkUnits,
} from "@/stores/usePlanningStore";
import { useState } from "react";

export function PrototypeControls() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const resetPrototype = usePrototypeStore((state) => state.resetToSeeds);
  const resetPlanning = usePlanningStore((state) => state.resetToSeed);
  const experimentCount = useExperimentCount();
  const staffCount = useStaffCount();
  const planningTaskCount = usePlanningTasks().length;
  const workUnitCount = usePlanningWorkUnits().length;
  const ticketCount = usePlanningTickets().length;
  
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
            <span className="text-muted-foreground">Planning tasks:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {planningTaskCount}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3 text-orange-500" />
            <span className="text-muted-foreground">Work units:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {workUnitCount}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <FileText className="h-3 w-3 text-amber-500" />
            <span className="text-muted-foreground">Tickets:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {ticketCount}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3 w-3 text-purple-500" />
            <span className="text-muted-foreground">Staff:</span>
            <Badge variant="secondary" className="h-5 text-xs">
              {staffCount}
            </Badge>
          </div>
        </div>
        
        {/* Actions */}
        <div className="space-y-2">
          <Button
            onClick={() => {
              resetPrototype();
              resetPlanning();
            }}
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
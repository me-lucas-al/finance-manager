import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AnalyticsLoading() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 bg-white min-h-screen">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <Skeleton className="h-9 w-[200px]" />
          <Skeleton className="h-5 w-[300px] mt-2" />
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Skeletons for Pie Charts */}
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full rounded-full" /></CardContent>
          </Card>
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent><Skeleton className="h-[300px] w-full rounded-full" /></CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-1">
          {/* Skeleton for Evolution Chart */}
          <Card>
            <CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader>
            <CardContent><Skeleton className="h-[350px] w-full" /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

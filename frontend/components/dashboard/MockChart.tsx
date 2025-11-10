'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MockChartProps {
  title: string;
  data: { label: string; value: number }[];
  type?: 'bar' | 'line';
}

export function MockChart({ title, data, type = 'bar' }: MockChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

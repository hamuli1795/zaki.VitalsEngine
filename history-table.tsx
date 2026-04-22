import React from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { VitalsHistoryResponse } from "@workspace/api-client-react/src/generated/api.schemas";

interface HistoryTableProps {
  data?: VitalsHistoryResponse;
  isLoading: boolean;
}

export function HistoryTable({ data, isLoading }: HistoryTableProps) {
  if (isLoading) {
    return (
      <Card className="border-border bg-card animate-pulse h-64" />
    );
  }

  const entries = data?.entries || [];

  return (
    <Card className="border-border bg-card shadow-lg">
      <CardHeader>
        <CardTitle className="font-display tracking-wider uppercase text-xl text-white">System Logs</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground font-display uppercase tracking-widest text-sm">
            No historical data found.
          </div>
        ) : (
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-background/50">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-display uppercase tracking-widest text-xs">Date</TableHead>
                  <TableHead className="font-display uppercase tracking-widest text-xs text-right">RPE</TableHead>
                  <TableHead className="font-display uppercase tracking-widest text-xs text-right">Pain</TableHead>
                  <TableHead className="font-display uppercase tracking-widest text-xs text-right">Scan</TableHead>
                  <TableHead className="font-display uppercase tracking-widest text-xs">Directive</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id} className="border-border hover:bg-secondary/50 transition-colors">
                    <TableCell className="font-mono text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(entry.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right font-display font-bold text-white">{entry.rpe}</TableCell>
                    <TableCell className="text-right font-display font-bold text-white">{entry.painScale}</TableCell>
                    <TableCell className="text-right font-display font-bold text-white">{entry.scanEfficiency}</TableCell>
                    <TableCell>
                      <IntensityBadge intensity={entry.intensity} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function IntensityBadge({ intensity }: { intensity: string }) {
  let colorClass = "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
  
  if (intensity === "LOW_IMPACT") {
    colorClass = "bg-amber-400/10 text-amber-400 border-amber-400/20";
  } else if (intensity === "LOCKOUT") {
    colorClass = "bg-rose-500/10 text-rose-500 border-rose-500/20";
  }

  return (
    <Badge variant="outline" className={`font-display tracking-widest uppercase text-[10px] ${colorClass}`}>
      {intensity.replace('_', ' ')}
    </Badge>
  );
}

"use client"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"

export function SessionsTable() {
  const data = useQuery(api.history.list, { limit: 25 })
  const rows = data?.items || []
  return (
    <Card className="overflow-hidden">
      <div className="border-b p-4 text-sm font-medium">All Sessions</div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Words</TableHead>
            <TableHead>Readability</TableHead>
            <TableHead className="text-right">Open</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r: any) => (
            <TableRow key={r._id}>
              <TableCell className="text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</TableCell>
              <TableCell>{r.metrics?.wordCount ?? '-'}</TableCell>
              <TableCell>{r.metrics?.readability ?? '-'}</TableCell>
              <TableCell className="text-right">
                <Link className="text-primary underline-offset-4 hover:underline" href={`/session/${r._id}`}>
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                No sessions yet.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  )
}

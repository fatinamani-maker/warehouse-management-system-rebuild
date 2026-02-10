import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
export function DataTable({ columns, data, pageSize = 10, searchable = true, searchPlaceholder = "Search...", onRowClick, actions }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState("asc");
    const filtered = data.filter(row => !search || Object.values(row).some(v => String(v ?? "").toLowerCase().includes(search.toLowerCase())));
    const sorted = sortKey
        ? [...filtered].sort((a, b) => {
            const av = a[sortKey] ?? "", bv = b[sortKey] ?? "";
            const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true });
            return sortDir === "asc" ? cmp : -cmp;
        })
        : filtered;
    const totalPages = Math.ceil(sorted.length / pageSize);
    const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);
    const handleSort = (key) => {
        if (sortKey === key)
            setSortDir(d => d === "asc" ? "desc" : "asc");
        else {
            setSortKey(key);
            setSortDir("asc");
        }
    };
    return (<div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        {searchable && (<div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input placeholder={searchPlaceholder} value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9 h-9 text-sm"/>
          </div>)}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map(col => (<TableHead key={col.key} className={col.sortable ? "cursor-pointer select-none hover:bg-accent" : ""} onClick={() => col.sortable && handleSort(col.key)}>
                  {col.label}
                  {sortKey === col.key && <span className="ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>}
                </TableHead>))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (<TableRow><TableCell colSpan={columns.length} className="text-center py-8 text-muted-foreground">No data found</TableCell></TableRow>) : paged.map((row, i) => (<TableRow key={i} className={onRowClick ? "cursor-pointer hover:bg-accent/50" : ""} onClick={() => onRowClick?.(row)}>
                {columns.map(col => (<TableCell key={col.key} className="text-sm">
                    {col.render ? col.render(row) : row[col.key] ?? "—"}
                  </TableCell>))}
              </TableRow>))}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (<div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{sorted.length} result{sorted.length !== 1 ? "s" : ""} · Page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}><ChevronLeft className="h-4 w-4"/></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}><ChevronRight className="h-4 w-4"/></Button>
          </div>
        </div>)}
    </div>);
}

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { DataTable } from "@/components/shared/DataTable";
import { skus, movementHistory, traceExceptions, simulateScanCodes } from "@/data/mockData";
import { QrCode, Radio, Camera, Keyboard, Play, Square, Send, AlertTriangle, MapPin, FileText, Clock, Printer, ShieldAlert, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TracePage = () => {
  const [scanMode, setScanMode] = useState<"qr" | "rfid">("qr");
  const [inputMethod, setInputMethod] = useState<"camera" | "reader" | "manual">("manual");
  const [scanInput, setScanInput] = useState("");
  const [scanning, setScanning] = useState(false);
  const [tracedSku, setTracedSku] = useState<typeof skus[0] | null>(null);
  const { toast } = useToast();

  const handleScan = (value?: string) => {
    const code = value || scanInput.trim();
    if (!code) return;

    // Try to match by QR payload, RFID EPC, or SKU ID
    const found = skus.find(s =>
      s.qrPayload === code || s.rfidEpc === code || s.id === code ||
      code.includes(s.id)
    );

    if (found) {
      setTracedSku(found);
      toast({ title: "Scan successful", description: `Found ${found.id} — ${found.description}` });
    } else {
      setTracedSku(null);
      toast({ title: "Scan result", description: "Unknown code — no SKU matched", variant: "destructive" });
    }
  };

  const handleSimulate = (simValue: string) => {
    setScanInput(simValue);
    handleScan(simValue);
  };

  const skuMovements = tracedSku ? movementHistory.filter(m => m.skuId === tracedSku.id) : [];
  const skuExceptions = tracedSku ? traceExceptions.filter(e => e.skuId === tracedSku.id) : [];

  const historyColumns = [
    { key: "skuId", label: "SKU", sortable: true },
    { key: "type", label: "Type", sortable: true, render: (r: any) => <StatusBadge status={r.type} /> },
    { key: "from", label: "From" },
    { key: "to", label: "To" },
    { key: "qty", label: "Qty" },
    { key: "docRef", label: "Document" },
    { key: "scanMethod", label: "Scan", render: (r: any) => r.scanMethod === "qr" ? <QrCode className="h-3.5 w-3.5" /> : <Radio className="h-3.5 w-3.5" /> },
    { key: "timestamp", label: "Time", render: (r: any) => new Date(r.timestamp).toLocaleString() },
  ];

  return (
    <AppLayout>
      <Breadcrumbs items={[{ label: "Trace (QR/RF)" }]} />
      <h1 className="text-2xl font-bold mb-4">Trace (QR / RFID)</h1>

      <Tabs defaultValue="scan">
        <TabsList>
          <TabsTrigger value="scan">Scan & Trace</TabsTrigger>
          <TabsTrigger value="history">History Search</TabsTrigger>
        </TabsList>

        <TabsContent value="scan" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Scan Console */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <QrCode className="h-4 w-4" /> Scan Console
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Toggle */}
                <div>
                  <Label className="text-xs mb-1.5 block">Scan Mode</Label>
                  <div className="flex gap-1">
                    <Button size="sm" variant={scanMode === "qr" ? "default" : "outline"} onClick={() => setScanMode("qr")} className="flex-1 gap-1.5">
                      <QrCode className="h-3.5 w-3.5" /> QR Code
                    </Button>
                    <Button size="sm" variant={scanMode === "rfid" ? "default" : "outline"} onClick={() => setScanMode("rfid")} className="flex-1 gap-1.5">
                      <Radio className="h-3.5 w-3.5" /> RFID
                    </Button>
                  </div>
                </div>

                {/* Input Method */}
                <div>
                  <Label className="text-xs mb-1.5 block">Input Method</Label>
                  <div className="flex gap-1">
                    {scanMode === "qr" && (
                      <Button size="sm" variant={inputMethod === "camera" ? "default" : "outline"} onClick={() => setInputMethod("camera")} className="flex-1 gap-1">
                        <Camera className="h-3.5 w-3.5" /> Camera
                      </Button>
                    )}
                    {scanMode === "rfid" && (
                      <Button size="sm" variant={inputMethod === "reader" ? "default" : "outline"} onClick={() => setInputMethod("reader")} className="flex-1 gap-1">
                        <Radio className="h-3.5 w-3.5" /> Reader
                      </Button>
                    )}
                    <Button size="sm" variant={inputMethod === "manual" ? "default" : "outline"} onClick={() => setInputMethod("manual")} className="flex-1 gap-1">
                      <Keyboard className="h-3.5 w-3.5" /> Manual
                    </Button>
                  </div>
                </div>

                {/* Scan Input */}
                <div>
                  <Label className="text-xs mb-1.5 block">
                    {scanMode === "qr" ? "QR Payload / SKU ID" : "EPC / Tag ID"}
                  </Label>
                  <Input
                    value={scanInput}
                    onChange={e => setScanInput(e.target.value)}
                    placeholder={scanMode === "qr" ? "QR:SKU000001:LOT2026A" : "EPC:300833B2DDD9014000000001"}
                    className="h-12 text-sm font-mono"
                    onKeyDown={e => e.key === "Enter" && handleScan()}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button size="sm" variant={scanning ? "secondary" : "default"} onClick={() => setScanning(true)} disabled={scanning} className="flex-1 gap-1">
                    <Play className="h-3.5 w-3.5" /> Start
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setScanning(false)} disabled={!scanning} className="flex-1 gap-1">
                    <Square className="h-3.5 w-3.5" /> Stop
                  </Button>
                  <Button size="sm" onClick={() => handleScan()} className="flex-1 gap-1">
                    <Send className="h-3.5 w-3.5" /> Submit
                  </Button>
                </div>

                {scanning && (
                  <div className="text-xs text-center py-2 px-3 bg-primary/5 rounded border border-primary/20 animate-pulse">
                    {scanMode === "qr" ? "📷 Camera active — waiting for QR..." : "📡 RFID reader listening..."}
                  </div>
                )}

                {/* Simulate Scan */}
                <div>
                  <Label className="text-xs mb-1.5 block">Simulate Scan (Test Data)</Label>
                  <Select onValueChange={handleSimulate}>
                    <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select a test code..." /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {simulateScanCodes.map(sc => (
                        <SelectItem key={sc.value} value={sc.value} className="text-xs">
                          {sc.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Right: Trace Result */}
            <div className="lg:col-span-3 space-y-4">
              {!tracedSku ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <QrCode className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground">No Trace Result</h3>
                    <p className="text-sm text-muted-foreground">Scan a QR code or RFID tag to view trace details</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* SKU Card */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Package className="h-4 w-4" /> SKU Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div><span className="text-muted-foreground text-xs block">SKU ID</span><span className="font-mono font-medium">{tracedSku.id}</span></div>
                        <div><span className="text-muted-foreground text-xs block">Description</span>{tracedSku.description}</div>
                        <div><span className="text-muted-foreground text-xs block">UOM</span>{tracedSku.uom}</div>
                        <div><span className="text-muted-foreground text-xs block">Status</span><StatusBadge status={tracedSku.status} /></div>
                        <div><span className="text-muted-foreground text-xs block">Lot</span>{tracedSku.lot || "—"}</div>
                        <div><span className="text-muted-foreground text-xs block">Serial</span>{tracedSku.serial || "—"}</div>
                        <div><span className="text-muted-foreground text-xs block">Category</span>{tracedSku.category}</div>
                        <div><span className="text-muted-foreground text-xs block">Hazardous</span>{tracedSku.hazardous ? "⚠️ Yes" : "No"}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Current Location & Last Movement */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" />Current Location</CardTitle></CardHeader>
                      <CardContent className="text-sm">
                        {skuMovements.length > 0 ? (
                          <div>
                            <div className="font-medium">{skuMovements[skuMovements.length - 1].to}</div>
                            <div className="text-xs text-muted-foreground">WH000001 — Main Distribution Center</div>
                          </div>
                        ) : <span className="text-muted-foreground">Unknown</span>}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Last Movement</CardTitle></CardHeader>
                      <CardContent className="text-sm">
                        {skuMovements.length > 0 ? (
                          <div>
                            <StatusBadge status={skuMovements[skuMovements.length - 1].type} className="mb-1" />
                            <div className="text-xs text-muted-foreground">
                              {skuMovements[skuMovements.length - 1].from} → {skuMovements[skuMovements.length - 1].to} · {new Date(skuMovements[skuMovements.length - 1].timestamp).toLocaleString()}
                            </div>
                          </div>
                        ) : <span className="text-muted-foreground">No movements</span>}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Movement Timeline */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Movement Timeline</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {skuMovements.map((m, i) => (
                          <div key={m.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={cn("h-3 w-3 rounded-full border-2",
                                i === skuMovements.length - 1 ? "bg-primary border-primary" : "bg-muted border-muted-foreground/30"
                              )} />
                              {i < skuMovements.length - 1 && <div className="w-px h-full bg-border min-h-[20px]" />}
                            </div>
                            <div className="text-xs pb-3">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={m.type} />
                                <span className="text-muted-foreground">{new Date(m.timestamp).toLocaleString()}</span>
                              </div>
                              <div className="mt-0.5">{m.from} → {m.to} · Qty: {m.qty} · Doc: <span className="font-mono">{m.docRef}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Related Documents */}
                  <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4" />Related Documents</CardTitle></CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {[...new Set(skuMovements.map(m => m.docRef))].map(doc => (
                          <Button key={doc} variant="outline" size="sm" className="text-xs font-mono h-7">{doc}</Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Exceptions */}
                  {skuExceptions.length > 0 && (
                    <Card className="border-orange-200">
                      <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-orange-600" />Exceptions</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {skuExceptions.map(e => (
                            <div key={e.id} className="flex items-start gap-2 text-xs p-2 rounded border">
                              <StatusBadge status={e.status} />
                              <div>
                                <span className="font-medium capitalize">{e.type.replace(/_/g, " ")}</span>
                                <p className="text-muted-foreground">{e.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1"><ShieldAlert className="h-3.5 w-3.5" /> Create Exception Ticket</Button>
                    <Button variant="outline" size="sm" className="gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Move to Quarantine</Button>
                    <Button variant="outline" size="sm" className="gap-1"><Printer className="h-3.5 w-3.5" /> Print Label</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Movement History Search</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div><Label className="text-xs">SKU ID</Label><Input placeholder="SKU000001" className="h-8 text-xs" /></div>
                <div><Label className="text-xs">EPC / Tag ID</Label><Input placeholder="EPC:3008..." className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Document</Label><Input placeholder="GRN000143" className="h-8 text-xs" /></div>
                <div><Label className="text-xs">Location</Label><Input placeholder="A-01-001" className="h-8 text-xs" /></div>
              </div>
              <DataTable columns={historyColumns} data={movementHistory} pageSize={8} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default TracePage;

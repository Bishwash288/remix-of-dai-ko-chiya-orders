import { QRCodeSVG } from "qrcode.react";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Download, Copy, Info, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import JSZip from "jszip";

export default function QRCodesPage() {
  const { settings } = useStore();
  const baseUrl = window.location.origin;

  const tables = Array.from({ length: settings.numberOfTables }, (_, i) => i + 1);

  const copyLink = (tableNumber: number) => {
    const url = `${baseUrl}/menu?table=${tableNumber}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied!",
      description: `Table ${tableNumber} link copied to clipboard`,
    });
  };

  const downloadQR = (tableNumber: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const svg = document.getElementById(`qr-${tableNumber}`);
      if (!svg) {
        reject(new Error("QR not found"));
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new window.Image();

      img.onload = () => {
        canvas.width = img.width * 2;
        canvas.height = img.height * 2;
        ctx?.scale(2, 2);
        ctx?.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to create blob"));
          }
        }, "image/png");
      };

      img.onerror = reject;
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  const downloadSingleQR = async (tableNumber: number) => {
    try {
      const blob = await downloadQR(tableNumber);
      const url = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.download = `table-${tableNumber}-qr.png`;
      downloadLink.href = url;
      downloadLink.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const downloadAllQRCodes = async () => {
    try {
      toast({
        title: "Preparing download...",
        description: "Creating ZIP file with all QR codes",
      });

      const zip = new JSZip();
      const folder = zip.folder("dai-ko-chiya-qr-codes");

      for (const tableNumber of tables) {
        try {
          const blob = await downloadQR(tableNumber);
          folder?.file(`table-${tableNumber}-qr.png`, blob);
        } catch (error) {
          console.error(`Failed to add QR for table ${tableNumber}`, error);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const downloadLink = document.createElement("a");
      downloadLink.download = "dai-ko-chiya-qr-codes.zip";
      downloadLink.href = url;
      downloadLink.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Download complete!",
        description: `${tables.length} QR codes downloaded as ZIP`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR codes",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">QR Codes</h1>
          <p className="text-muted-foreground">Customized QR codes for each table</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">{settings.numberOfTables} Tables</Button>
          <Button variant="accent" onClick={downloadAllQRCodes}>
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-border bg-card p-4">
          <Info className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Print-ready QR codes</p>
            <p className="text-sm text-muted-foreground">
              Each QR code includes your shop logo and is styled for a professional look. Click "Save" to download individual QR codes or "Download All" to get all at once as a ZIP file.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/10 p-4">
          <Image className="mt-0.5 h-5 w-5 text-accent" />
          <div>
            <p className="font-medium text-accent">Using default logo</p>
            <p className="text-sm text-accent/80">
              Upload your shop logo in Settings to personalize your QR codes with your brand.
            </p>
          </div>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables.map((tableNumber) => (
          <div
            key={tableNumber}
            className="flex flex-col items-center rounded-xl border border-border bg-card p-4 transition-all hover:shadow-card"
          >
            <div className="rounded-lg bg-background p-3">
              <QRCodeSVG
                id={`qr-${tableNumber}`}
                value={`${baseUrl}/menu?table=${tableNumber}`}
                size={120}
                level="H"
                fgColor="hsl(25, 60%, 35%)"
                includeMargin={false}
              />
            </div>

            <div className="mt-3 text-center">
              <p className="font-heading font-semibold text-primary">Table {tableNumber}</p>
              <p className="text-xs text-muted-foreground">/menu?table={tableNumber}</p>
            </div>

            <div className="mt-3 flex gap-2">
              <Button variant="outline" size="sm" onClick={() => copyLink(tableNumber)}>
                <Copy className="h-3 w-3" />
                Copy
              </Button>
              <Button variant="accent" size="sm" onClick={() => downloadSingleQR(tableNumber)}>
                <Download className="h-3 w-3" />
                Save
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

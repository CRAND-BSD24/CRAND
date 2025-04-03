import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AbsensiSantriTable } from "@/components/absensi/absensi-santri-table"
import { AbsensiUstadzTable } from "@/components/absensi/absensi-ustadz-table"
import { QrCode, ScanLine } from "lucide-react"

export const metadata: Metadata = {
  title: "Absensi | Pesantren Management System",
  description: "Manajemen absensi santri dan ustadz",
}

export default function AbsensiPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Absensi" text="Kelola absensi santri dan ustadz.">
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline">
            <QrCode className="mr-2 h-4 w-4" />
            Generate QR Code
          </Button>
          <Button>
            <ScanLine className="mr-2 h-4 w-4" />
            Scan Absensi
          </Button>
        </div>
      </DashboardHeader>
      <Tabs defaultValue="santri" className="space-y-4">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="santri" className="flex-1 sm:flex-initial">
            Santri
          </TabsTrigger>
          <TabsTrigger value="ustadz" className="flex-1 sm:flex-initial">
            Ustadz
          </TabsTrigger>
        </TabsList>
        <TabsContent value="santri" className="space-y-4">
          <AbsensiSantriTable />
        </TabsContent>
        <TabsContent value="ustadz" className="space-y-4">
          <AbsensiUstadzTable />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}


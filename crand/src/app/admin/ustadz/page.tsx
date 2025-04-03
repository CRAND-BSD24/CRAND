import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UstadzTable } from "@/components/ustadz/ustadz-table"
import { PlusCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Ustadz | Pesantren Management System",
  description: "Manajemen data ustadz",
}

export default function UstadzPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Ustadz" text="Kelola data dan aktivitas ustadz.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Ustadz
        </Button>
      </DashboardHeader>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input placeholder="Cari ustadz..." className="h-9 w-[150px] lg:w-[250px]" />
          <Button variant="outline" size="sm" className="h-9">
            Filter
          </Button>
        </div>
      </div>
      <UstadzTable />
    </DashboardShell>
  )
}


import type { Metadata } from "next"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HafalanTable } from "@/components/hafalan/hafalan-table"
import { HafalanChart } from "@/components/hafalan/hafalan-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Hafalan | Pesantren Management System",
  description: "Manajemen capaian hafalan santri",
}

export default function HafalanPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Hafalan" text="Kelola dan pantau capaian hafalan santri.">
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Capaian
        </Button>
      </DashboardHeader>
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input placeholder="Cari santri..." className="h-9 w-[150px] lg:w-[250px]" />
          <Button variant="outline" size="sm" className="h-9">
            Filter
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Perkembangan Hafalan</CardTitle>
          <CardDescription>Rata-rata capaian hafalan santri per minggu</CardDescription>
        </CardHeader>
        <CardContent>
          <HafalanChart />
        </CardContent>
      </Card>
      <HafalanTable />
    </DashboardShell>
  )
}


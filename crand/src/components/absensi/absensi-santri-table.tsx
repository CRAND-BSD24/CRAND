import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays } from "lucide-react"

const absensiSantriData = [
  {
    id: 1,
    name: "Ahmad Farhan",
    class: "10A",
    date: "2025-03-26",
    time: "07:15",
    status: "Hadir",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Fatimah Azzahra",
    class: "11B",
    date: "2025-03-26",
    time: "07:10",
    status: "Hadir",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Muhammad Rizky",
    class: "12A",
    date: "2025-03-26",
    time: "07:05",
    status: "Hadir",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Aisyah Putri",
    class: "10B",
    date: "2025-03-26",
    time: "07:30",
    status: "Terlambat",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Zaki Rahman",
    class: "11A",
    date: "2025-03-26",
    time: "-",
    status: "Izin",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
]

export function AbsensiSantriTable() {
  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between p-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Rabu, 26 Maret 2025</span>
        </div>
        <Badge variant="outline">Total: 245 santri</Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absensiSantriData.map((absensi) => (
              <TableRow key={absensi.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={absensi.avatarUrl} alt={absensi.name} />
                      <AvatarFallback>{absensi.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {absensi.name}
                  </div>
                </TableCell>
                <TableCell>{absensi.class}</TableCell>
                <TableCell>{absensi.date}</TableCell>
                <TableCell>{absensi.time}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      absensi.status === "Hadir" ? "default" : absensi.status === "Terlambat" ? "secondary" : "outline"
                    }
                  >
                    {absensi.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


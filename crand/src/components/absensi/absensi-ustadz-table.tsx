import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, QrCode } from "lucide-react"

const absensiUstadzData = [
  {
    id: 1,
    name: "Ustadz Mahmud",
    subject: "Tahfidz Al-Quran",
    date: "2025-03-26",
    time: "06:45",
    method: "QR Code",
    status: "Hadir",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Ustadzah Aisyah",
    subject: "Fiqih",
    date: "2025-03-26",
    time: "06:50",
    method: "Face Recognition",
    status: "Hadir",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Ustadz Ahmad",
    subject: "Bahasa Arab",
    date: "2025-03-26",
    time: "06:55",
    method: "QR Code",
    status: "Hadir",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Ustadzah Fatimah",
    subject: "Akidah Akhlak",
    date: "2025-03-26",
    time: "-",
    method: "-",
    status: "Izin",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Ustadz Yusuf",
    subject: "Hadits",
    date: "2025-03-26",
    time: "07:10",
    method: "Face Recognition",
    status: "Terlambat",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
]

export function AbsensiUstadzTable() {
  return (
    <div className="rounded-md border">
      <div className="flex items-center justify-between p-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Rabu, 26 Maret 2025</span>
        </div>
        <Badge variant="outline">Total: 32 ustadz</Badge>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Mata Pelajaran</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {absensiUstadzData.map((absensi) => (
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
                <TableCell>{absensi.subject}</TableCell>
                <TableCell>{absensi.date}</TableCell>
                <TableCell>{absensi.time}</TableCell>
                <TableCell>
                  {absensi.method === "QR Code" ? (
                    <div className="flex items-center gap-1">
                      <QrCode className="h-4 w-4" />
                      <span>QR Code</span>
                    </div>
                  ) : absensi.method === "Face Recognition" ? (
                    <span>Face Recognition</span>
                  ) : (
                    absensi.method
                  )}
                </TableCell>
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


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Edit, Trash } from "lucide-react"

const hafalanData = [
  {
    id: 1,
    name: "Ahmad Farhan",
    class: "10A",
    surah: "Al-Baqarah",
    page: "5-7",
    date: "2025-03-26",
    ustadz: "Ustadz Mahmud",
    status: "Lancar",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Fatimah Azzahra",
    class: "11B",
    surah: "Ali Imran",
    page: "3-5",
    date: "2025-03-26",
    ustadz: "Ustadzah Aisyah",
    status: "Lancar",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Muhammad Rizky",
    class: "12A",
    surah: "An-Nisa",
    page: "1-5",
    date: "2025-03-25",
    ustadz: "Ustadz Ahmad",
    status: "Lancar",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Aisyah Putri",
    class: "10B",
    surah: "Al-Maidah",
    page: "2-3",
    date: "2025-03-25",
    ustadz: "Ustadzah Fatimah",
    status: "Perlu Perbaikan",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Zaki Rahman",
    class: "11A",
    surah: "Al-An'am",
    page: "1-2",
    date: "2025-03-24",
    ustadz: "Ustadz Yusuf",
    status: "Perlu Perbaikan",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
]

export function HafalanTable() {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Surat</TableHead>
              <TableHead>Halaman</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Ustadz</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {hafalanData.map((hafalan) => (
              <TableRow key={hafalan.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={hafalan.avatarUrl} alt={hafalan.name} />
                      <AvatarFallback>{hafalan.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {hafalan.name}
                  </div>
                </TableCell>
                <TableCell>{hafalan.class}</TableCell>
                <TableCell>{hafalan.surah}</TableCell>
                <TableCell>{hafalan.page}</TableCell>
                <TableCell>{hafalan.date}</TableCell>
                <TableCell>{hafalan.ustadz}</TableCell>
                <TableCell>
                  <Badge variant={hafalan.status === "Lancar" ? "default" : "secondary"}>{hafalan.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 md:gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:flex">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hidden md:flex">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}


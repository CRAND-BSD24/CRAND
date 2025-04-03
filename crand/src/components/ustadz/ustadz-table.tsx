import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Edit, Trash, QrCode } from "lucide-react"

const ustadzData = [
  {
    id: 1,
    name: "Ustadz Mahmud",
    subject: "Tahfidz Al-Quran",
    gender: "Laki-laki",
    phone: "081234567890",
    email: "mahmud@pesantren.ac.id",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Ustadzah Aisyah",
    subject: "Fiqih",
    gender: "Perempuan",
    phone: "081234567891",
    email: "aisyah@pesantren.ac.id",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Ustadz Ahmad",
    subject: "Bahasa Arab",
    gender: "Laki-laki",
    phone: "081234567892",
    email: "ahmad@pesantren.ac.id",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Ustadzah Fatimah",
    subject: "Akidah Akhlak",
    gender: "Perempuan",
    phone: "081234567893",
    email: "fatimah@pesantren.ac.id",
    status: "Izin",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Ustadz Yusuf",
    subject: "Hadits",
    gender: "Laki-laki",
    phone: "081234567894",
    email: "yusuf@pesantren.ac.id",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
]

export function UstadzTable() {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Mata Pelajaran</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Telepon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ustadzData.map((ustadz) => (
              <TableRow key={ustadz.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={ustadz.avatarUrl} alt={ustadz.name} />
                      <AvatarFallback>{ustadz.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {ustadz.name}
                  </div>
                </TableCell>
                <TableCell>{ustadz.subject}</TableCell>
                <TableCell>{ustadz.gender}</TableCell>
                <TableCell>{ustadz.phone}</TableCell>
                <TableCell>{ustadz.email}</TableCell>
                <TableCell>
                  <Badge variant={ustadz.status === "Aktif" ? "default" : "outline"}>{ustadz.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1 md:gap-2">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hidden sm:flex">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hidden md:flex">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8 hidden lg:flex">
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


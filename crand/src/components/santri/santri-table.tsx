import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Eye, Edit, Trash } from "lucide-react"

const santriData = [
  {
    id: 1,
    name: "Ahmad Farhan",
    class: "10A",
    gender: "Laki-laki",
    address: "Bandung, Jawa Barat",
    parent: "Budi Santoso",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Fatimah Azzahra",
    class: "11B",
    gender: "Perempuan",
    address: "Jakarta Selatan, DKI Jakarta",
    parent: "Ahmad Hidayat",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Muhammad Rizky",
    class: "12A",
    gender: "Laki-laki",
    address: "Surabaya, Jawa Timur",
    parent: "Hendra Wijaya",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    name: "Aisyah Putri",
    class: "10B",
    gender: "Perempuan",
    address: "Medan, Sumatera Utara",
    parent: "Dian Purnama",
    status: "Aktif",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    name: "Zaki Rahman",
    class: "11A",
    gender: "Laki-laki",
    address: "Makassar, Sulawesi Selatan",
    parent: "Rahmat Hidayat",
    status: "Izin",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
]

export function SantriTable() {
  return (
    <div className="rounded-md border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kelas</TableHead>
              <TableHead>Jenis Kelamin</TableHead>
              <TableHead>Alamat</TableHead>
              <TableHead>Orang Tua</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {santriData.map((santri) => (
              <TableRow key={santri.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={santri.avatarUrl} alt={santri.name} />
                      <AvatarFallback>{santri.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {santri.name}
                  </div>
                </TableCell>
                <TableCell>{santri.class}</TableCell>
                <TableCell>{santri.gender}</TableCell>
                <TableCell>{santri.address}</TableCell>
                <TableCell>{santri.parent}</TableCell>
                <TableCell>
                  <Badge variant={santri.status === "Aktif" ? "default" : "outline"}>{santri.status}</Badge>
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


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award } from "lucide-react"

const topPerformers = [
  {
    id: 1,
    name: "Ahmad Farhan",
    class: "10A",
    achievement: "7 halaman hafalan",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Fatimah Azzahra",
    class: "11B",
    achievement: "Nilai ujian 98",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "Muhammad Rizky",
    class: "12A",
    achievement: "5 halaman hafalan",
    avatarUrl: "/placeholder.svg?height=40&width=40",
  },
]

export function TopPerformers() {
  return (
    <div className="space-y-8">
      {topPerformers.map((performer) => (
        <div key={performer.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={performer.avatarUrl} alt={performer.name} />
            <AvatarFallback>{performer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{performer.name}</p>
            <p className="text-sm text-muted-foreground">Kelas {performer.class}</p>
          </div>
          <div className="ml-auto flex items-center gap-1 font-medium">
            <Award className="h-4 w-4 text-amber-500" />
            {performer.achievement}
          </div>
        </div>
      ))}
    </div>
  )
}


import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: 1,
    user: "Ahmad Farhan",
    userType: "santri",
    action: "menyelesaikan hafalan",
    target: "Surat Al-Baqarah halaman 5",
    time: "10 menit yang lalu",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 2,
    user: "Ustadz Mahmud",
    userType: "ustadz",
    action: "mengupdate nilai",
    target: "kelas 10A",
    time: "30 menit yang lalu",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 3,
    user: "Fatimah Azzahra",
    userType: "santri",
    action: "mengumpulkan tugas",
    target: "Fiqih Muamalah",
    time: "1 jam yang lalu",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 4,
    user: "Ustadzah Aisyah",
    userType: "ustadz",
    action: "membuat pengumuman",
    target: "untuk kelas 11B",
    time: "2 jam yang lalu",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
  {
    id: 5,
    user: "Muhammad Rizky",
    userType: "santri",
    action: "absen masuk",
    target: "kelas pagi",
    time: "3 jam yang lalu",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={activity.avatarUrl} alt={activity.user} />
            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              <span className="font-semibold">{activity.user}</span> {activity.action}{" "}
              <span className="font-medium">{activity.target}</span>
            </p>
            <p className="text-sm text-muted-foreground">{activity.time}</p>
          </div>
          <div className="ml-auto text-xs">
            <span
              className={`rounded-full px-2 py-1 ${activity.userType === "santri" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
            >
              {activity.userType === "santri" ? "Santri" : "Ustadz"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}


import { MainNav } from "@/components/layout/main-nav"
import { UserNav } from "@/components/layout/user-nav"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
} from "@/components/ui/sidebar"

export function SidebarNav() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2 font-semibold">
            <div className="h-6 w-6 rounded-full bg-primary" />
            <span className="truncate">Pesantren Management</span>
          </div>
        </SidebarHeader>
        <SidebarContent className="px-2 py-4">
          <MainNav />
        </SidebarContent>
        <SidebarFooter className="border-t p-4">
          <UserNav />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    </SidebarProvider>
  )
}


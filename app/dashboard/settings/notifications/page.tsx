import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export default function NotificationsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Choose what updates you want to receive and where.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h3 className="font-semibold text-lg mb-4">Email Notifications</h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-base">Product Updates</Label>
                <p className="text-sm text-muted-foreground">Receive emails about new features, AI models, and improvements.</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-base">Usage Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when you have consumed 80% and 100% of your daily credits.</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-base">Security Alerts</Label>
                <p className="text-sm text-muted-foreground">Receive critical notifications about sign-ins from new devices.</p>
              </div>
              <Switch defaultChecked disabled />
            </div>
          </div>
        </div>

        <div className="p-6 bg-muted/20">
          <h3 className="font-semibold text-lg mb-4">Marketing & Newsletter</h3>
          
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-base">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">A weekly summary of your generated projects and community highlights.</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>
    </div>
  )
}

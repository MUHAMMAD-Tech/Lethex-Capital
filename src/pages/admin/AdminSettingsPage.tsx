// LETHEX Admin Settings Page - Change Admin Access Code
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { updateAdminAccessCode } from '@/db/api';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Key, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [newAccessCode, setNewAccessCode] = useState('');
  const [confirmAccessCode, setConfirmAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newAccessCode.trim()) {
      toast.error('Please enter a new access code');
      return;
    }

    if (newAccessCode.length < 6) {
      toast.error('Access code must be at least 6 characters');
      return;
    }

    if (newAccessCode !== confirmAccessCode) {
      toast.error('Access codes do not match');
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmChange = async () => {
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      const success = await updateAdminAccessCode(newAccessCode);

      if (success) {
        toast.success('Admin access code updated successfully');
        setNewAccessCode('');
        setConfirmAccessCode('');
      } else {
        toast.error('Failed to update access code');
      }
    } catch (error) {
      console.error('Error updating access code:', error);
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl xl:text-4xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage system configuration and security
        </p>
      </div>

      {/* Change Access Code Card */}
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Change Admin Access Code</CardTitle>
              <CardDescription>
                Update the access code used to log in to the admin panel
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="newAccessCode">New Access Code</Label>
              <Input
                id="newAccessCode"
                type="password"
                placeholder="Enter new access code"
                value={newAccessCode}
                onChange={(e) => setNewAccessCode(e.target.value)}
                disabled={loading}
                className="h-11"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 characters. Use a strong, unique code.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmAccessCode">Confirm Access Code</Label>
              <Input
                id="confirmAccessCode"
                type="password"
                placeholder="Re-enter new access code"
                value={confirmAccessCode}
                onChange={(e) => setConfirmAccessCode(e.target.value)}
                disabled={loading}
                className="h-11"
              />
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <p className="text-sm text-warning-foreground font-medium">⚠️ Important</p>
              <p className="text-sm text-muted-foreground mt-1">
                After changing the access code, you will need to use the new code to log in.
                Make sure to save it securely.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-11"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              Update Access Code
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        title="Confirm Access Code Change"
        description="Are you sure you want to change the admin access code? You will need to use the new code for future logins."
        confirmText="Yes, Update Code"
        cancelText="Cancel"
        onConfirm={handleConfirmChange}
      />
    </div>
  );
}

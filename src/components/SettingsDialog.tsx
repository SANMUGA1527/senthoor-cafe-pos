import { useState } from 'react';
import { Settings, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from './ui/dialog';
import { toast } from 'sonner';

const SettingsDialog = () => {
    const { lastPasswordReset, changePassword } = useAuth();
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        const result = changePassword(currentPassword, newPassword);

        if (result.success) {
            toast.success('Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setOpen(false);
        } else {
            toast.error(result.error || 'Failed to change password');
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:bg-white/20"
                    title="Settings"
                >
                    <Settings className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Security Settings
                    </DialogTitle>
                    <DialogDescription>
                        Change your password and view security information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Last Password Reset Info */}
                    <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">Last Password Reset</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(lastPasswordReset)}
                        </p>
                    </div>

                    {/* Change Password Form */}
                    <form onSubmit={handleChangePassword} className="space-y-3">
                        <div className="space-y-2">
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                                id="current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                                id="new-password"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                            <p className="text-xs text-muted-foreground">
                                Minimum 8 characters
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Change Password
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SettingsDialog;

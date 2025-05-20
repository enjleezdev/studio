
'use client';

import * as React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { UserProfile } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Eye, EyeOff } from 'lucide-react';

const USER_PROFILE_LS_KEY = 'userProfileData';

export default function ProfilePage() {
  const { toast } = useToast();
  const [userProfile, setUserProfile] = React.useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Username change state
  const [newUsername, setNewUsername] = React.useState('');
  const [usernameMessage, setUsernameMessage] = React.useState('');

  // Password change state
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
  const [passwordMessage, setPasswordMessage] = React.useState('');
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = React.useState(false);


  React.useEffect(() => {
    setIsLoading(true);
    try {
      const storedProfileString = localStorage.getItem(USER_PROFILE_LS_KEY);
      if (storedProfileString) {
        const profile = JSON.parse(storedProfileString) as UserProfile;
        setUserProfile(profile);
        setNewUsername(profile.username); // Initialize with current username
      } else {
        // Initialize a default profile if none exists
        const defaultProfile: UserProfile = {
          id: 'default-user',
          username: 'Admin',
          password: 'password123', // Default password for simulation
          usernameChanged: false,
        };
        localStorage.setItem(USER_PROFILE_LS_KEY, JSON.stringify(defaultProfile));
        setUserProfile(defaultProfile);
        setNewUsername(defaultProfile.username);
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
      toast({
        title: 'Error',
        description: 'Could not load user profile. Using defaults.',
        variant: 'destructive',
      });
      // Fallback to default if loading fails
      const fallbackProfile: UserProfile = {
        id: 'default-user',
        username: 'Admin',
        password: 'password123',
        usernameChanged: false,
      };
      setUserProfile(fallbackProfile);
      setNewUsername(fallbackProfile.username);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const handleUsernameChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameMessage('');
    if (!userProfile) return;

    if (userProfile.usernameChanged) {
      setUsernameMessage('Username has already been changed and cannot be changed again.');
      return;
    }

    if (!newUsername.trim()) {
      setUsernameMessage('Username cannot be empty.');
      return;
    }

    const updatedProfile: UserProfile = { ...userProfile, username: newUsername.trim(), usernameChanged: true };
    try {
      localStorage.setItem(USER_PROFILE_LS_KEY, JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile);
      toast({ title: 'Success', description: 'Username updated successfully.' });
      setUsernameMessage('Username updated. You cannot change it again.');
    } catch (error) {
      console.error('Failed to save username:', error);
      toast({ title: 'Error', description: 'Could not save username.', variant: 'destructive' });
    }
  };

  const handlePasswordChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPasswordMessage('');
    if (!userProfile) return;

    if (currentPassword !== (userProfile.password || '')) {
      setPasswordMessage('Current password does not match.');
      return;
    }
    if (!newPassword) {
      setPasswordMessage('New password cannot be empty.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('New passwords do not match.');
      return;
    }

    const updatedProfile: UserProfile = { ...userProfile, password: newPassword };
    try {
      localStorage.setItem(USER_PROFILE_LS_KEY, JSON.stringify(updatedProfile));
      setUserProfile(updatedProfile); // Update local state, though password isn't directly displayed
      toast({ title: 'Success', description: 'Password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordMessage('Password changed successfully.');
    } catch (error) {
      console.error('Failed to save password:', error);
      toast({ title: 'Error', description: 'Could not save password.', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><p>Loading profile...</p></div>;
  }

  if (!userProfile) {
    return <div className="flex justify-center items-center h-screen"><p>Could not load profile.</p></div>;
  }

  return (
    <>
      <PageHeader title="User Profile" description="Manage your account settings." />
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Username Settings</CardTitle>
            <CardDescription>
              {userProfile.usernameChanged
                ? 'Your username has been set and cannot be changed again.'
                : 'You can change your username once. This action is permanent.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUsernameChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={userProfile.usernameChanged}
                  className={userProfile.usernameChanged ? 'cursor-not-allowed' : ''}
                />
              </div>
              {usernameMessage && (
                <p className={`text-sm ${usernameMessage.includes('successfully') || usernameMessage.includes('updated') ? 'text-green-600' : 'text-destructive'}`}>
                  {usernameMessage}
                </p>
              )}
              {!userProfile.usernameChanged && (
                <Button type="submit">Change Username</Button>
              )}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password Settings</CardTitle>
            <CardDescription>Change your account password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                 <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                 <div className="relative">
                    <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                 <div className="relative">
                    <Input
                        id="confirmNewPassword"
                        type={showConfirmNewPassword ? "text" : "password"}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="Confirm new password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                        onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    >
                        {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                </div>
              </div>
              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.includes('successfully') ? 'text-green-600' : 'text-destructive'}`}>
                  {passwordMessage}
                </p>
              )}
              <Button type="submit">Change Password</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { LogIn, Leaf } from 'lucide-react';

const Login = () => {
  const [staffName, setStaffName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = signIn(staffName);

    if (result.success) {
      toast.success(`Welcome, ${staffName.trim()}!`);
      navigate('/');
    } else {
      toast.error(result.error || 'Please enter your name');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-xl">
              <Leaf className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Hotel Sri Senthoor</CardTitle>
          <CardDescription>& Cafe 77 - Billing System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="staffName">Your Name</Label>
              <Input
                id="staffName"
                type="text"
                placeholder="Enter your name"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !staffName.trim()}>
              {isLoading ? 'Please wait...' : (<><LogIn className="w-4 h-4 mr-2" />Continue</>)}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

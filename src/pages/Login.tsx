import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (showResetPassword) {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Password reset email sent! Check your inbox.');
          setShowResetPassword(false);
        }
      } else if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Logged in successfully!');
          navigate('/');
        }
      } else {
        if (!employeeName.trim()) {
          toast.error('Please enter your name');
          setIsLoading(false);
          return;
        }
        const { error } = await signUp(email, password, employeeName.trim());
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created successfully! You can now login.');
          setIsLogin(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">SRI SENTHOOR</CardTitle>
          <CardDescription>
            {showResetPassword 
              ? 'Reset your password' 
              : isLogin 
                ? 'Login to access the billing system' 
                : 'Create a new employee account'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !showResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="employeeName">Employee Name</Label>
                <Input
                  id="employeeName"
                  type="text"
                  placeholder="Enter your name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {!showResetPassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                'Please wait...'
              ) : showResetPassword ? (
                'Send Reset Email'
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            {!showResetPassword && (
              <>
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary hover:underline"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
                </button>
                <br />
              </>
            )}
            <button
              type="button"
              onClick={() => {
                setShowResetPassword(!showResetPassword);
                if (!showResetPassword) setIsLogin(true);
              }}
              className="text-sm text-muted-foreground hover:underline"
            >
              {showResetPassword ? 'Back to login' : 'Forgot password?'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

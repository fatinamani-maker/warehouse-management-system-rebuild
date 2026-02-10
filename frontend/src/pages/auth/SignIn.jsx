import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
const SignIn = () => {
    const [email, setEmail] = useState("john@acme.com");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const handleSubmit = (e) => {
        e.preventDefault();
        if (signIn(email, password)) {
            navigate("/select-tenant");
        }
        else {
            toast({ title: "Sign in failed", description: "Invalid email or password", variant: "destructive" });
        }
    };
    return (<div className="min-h-screen flex items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-2">
            <Lock className="h-5 w-5 text-primary-foreground"/>
          </div>
          <CardTitle className="text-xl">Sign in to WMS</CardTitle>
          <CardDescription>Enter your credentials to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-9" placeholder="you@company.com" required/>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                <Input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="pl-9 pr-9" placeholder="••••••••" required/>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
            <div className="flex justify-between text-xs">
              <button type="button" onClick={() => navigate("/forgot-password")} className="text-primary hover:underline">Forgot password?</button>
              <button type="button" onClick={() => navigate("/sign-up")} className="text-primary hover:underline">Create account</button>
            </div>
          </form>
          <p className="text-[10px] text-muted-foreground text-center mt-4">Demo: use john@acme.com (any password)</p>
        </CardContent>
      </Card>
    </div>);
};
export default SignIn;

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogOut, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface UserInfo {
  name: string;
  phone: string;
}

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    checkStatus();
    
    const interval = setInterval(() => {
      checkConnectionStatus();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch("/api/whatsapp/user");
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Received HTML instead of JSON, redirecting to home");
        navigate("/");
        return;
      }

      if (!response.ok) {
        navigate("/");
        return;
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (err) {
      toast({
        title: "خطا",
        description: "خطا در دریافت اطلاعات کاربری",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const response = await fetch("/api/whatsapp/status");
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Received HTML instead of JSON during status check");
        return;
      }

      const data = await response.json();
      
      if (!data.connected) {
        toast({
          title: "اتصال قطع شد",
          description: "اتصال شما به واتساپ قطع شد",
          variant: "destructive",
        });
        navigate("/");
      }
    } catch (err) {
      console.error("Error checking connection status:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/whatsapp/disconnect", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("خطا در قطع اتصال");
      }

      toast({
        title: "موفق",
        description: "اتصال با موفقیت قطع شد",
      });

      navigate("/");
    } catch (err) {
      toast({
        title: "خطا",
        description: err instanceof Error ? err.message : "خطای ناشناخته",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-green-500/10 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">پنل کاربری واتساپ</CardTitle>
            <CardDescription className="text-base">
              شما با موفقیت به واتساپ وب متصل شدید
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>وضعیت:</strong> متصل
              </AlertDescription>
            </Alert>

            {userInfo && (
              <div className="space-y-4">
                <div className="p-6 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">اطلاعات حساب کاربری</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">نام:</span>
                      <span className="font-medium">{userInfo.name}</span>
                    </div>
                    {userInfo.phone && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">شماره تلفن:</span>
                        <span className="font-medium" dir="ltr">{userInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    شما می‌توانید از این پنل برای مدیریت اتصال واتساپ خود استفاده کنید. 
                    برای قطع اتصال، روی دکمه زیر کلیک کنید.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleDisconnect}
                  variant="destructive"
                  className="w-full"
                  disabled={isLoading}
                >
                  <LogOut className="w-4 h-4 ml-2" />
                  قطع اتصال از واتساپ
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center py-8">
                <div className="animate-pulse text-muted-foreground">
                  در حال بارگذاری...
                </div>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                اتصال شما از طریق Puppeteer به واتساپ وب برقرار است
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

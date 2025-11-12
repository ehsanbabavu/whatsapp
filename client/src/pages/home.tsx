import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, RefreshCw, QrCode, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Home() {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForLogin, setIsWaitingForLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  useEffect(() => {
    checkInitialStatus();
  }, []);

  const checkInitialStatus = async () => {
    try {
      const response = await fetch("/api/whatsapp/status");
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Received HTML instead of JSON, skipping status check");
        return;
      }

      const data = await response.json();
      
      if (data.connected) {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Error checking initial status:", err);
    }
  };

  const fetchQRCode = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/whatsapp/qr");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "خطا در دریافت QR Code" }));
        throw new Error(errorData.message || "خطا در دریافت QR Code");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setQrImage(imageUrl);
      
      toast({
        title: "موفق",
        description: "QR Code با موفقیت دریافت شد",
      });

      waitForUserLogin();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطای ناشناخته";
      setError(errorMessage);
      toast({
        title: "خطا",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const waitForUserLogin = async () => {
    setIsWaitingForLogin(true);
    
    try {
      const response = await fetch("/api/whatsapp/wait-login", {
        method: "POST",
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("پاسخ نامعتبر از سرور دریافت شد");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "خطا در انتظار برای ورود" }));
        throw new Error(errorData.error || "خطا در انتظار برای ورود");
      }

      const data = await response.json();
      
      toast({
        title: "موفق",
        description: `خوش آمدید ${data.userInfo?.name || ""}!`,
      });

      navigate("/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطای ناشناخته";
      console.error("Login wait error:", err);
      
      toast({
        title: "خطا در ورود",
        description: errorMessage,
        variant: "destructive",
      });
      
      setIsWaitingForLogin(false);
      setError(errorMessage);
    }
  };

  const handleRefresh = () => {
    if (qrImage) {
      URL.revokeObjectURL(qrImage);
    }
    fetchQRCode();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <QrCode className="w-12 h-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">اتصال به واتساپ وب</CardTitle>
            <CardDescription className="text-base">
              برای اتصال به واتساپ، کد QR را با تلفن همراه خود اسکن کنید
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" data-testid="alert-error">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!qrImage && !isLoading && (
              <div className="text-center space-y-4" data-testid="container-initial">
                <p className="text-sm text-muted-foreground">
                  برای شروع، روی دکمه زیر کلیک کنید تا کد QR دریافت شود
                </p>
                <Button 
                  onClick={fetchQRCode} 
                  size="lg"
                  className="w-full"
                  data-testid="button-get-qr"
                >
                  دریافت کد QR
                </Button>
              </div>
            )}

            {isLoading && (
              <div 
                className="flex flex-col items-center justify-center py-12 space-y-4"
                data-testid="container-loading"
              >
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">
                  در حال دریافت کد QR از واتساپ وب...
                </p>
                <p className="text-xs text-muted-foreground">
                  این ممکن است چند ثانیه طول بکشد
                </p>
              </div>
            )}

            {isWaitingForLogin && qrImage && !isLoading && (
              <Alert className="bg-blue-50 border-blue-200">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <AlertDescription className="text-blue-800">
                  <strong>در انتظار اسکن QR Code...</strong>
                  <p className="text-sm mt-1">لطفاً کد QR را با تلفن همراه خود اسکن کنید</p>
                </AlertDescription>
              </Alert>
            )}

            {qrImage && !isLoading && (
              <div className="space-y-4" data-testid="container-qr-display">
                <div className="flex justify-center">
                  <div className="border-2 border-border rounded-xl p-6 bg-white">
                    <img 
                      src={qrImage} 
                      alt="WhatsApp QR Code" 
                      className="w-full max-w-md"
                      data-testid="img-qr-code"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Alert data-testid="alert-instructions">
                    <AlertDescription className="text-sm">
                      <strong>مراحل اتصال:</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>واتساپ را روی تلفن خود باز کنید</li>
                        <li>به تنظیمات بروید و "دستگاه‌های متصل" را انتخاب کنید</li>
                        <li>این کد را اسکن کنید</li>
                      </ol>
                    </AlertDescription>
                  </Alert>

                  <Alert variant="default" data-testid="alert-expiry-warning">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                      توجه: این کد QR پس از چند دقیقه منقضی می‌شود. در صورت نیاز، روی دکمه رفرش کلیک کنید.
                    </AlertDescription>
                  </Alert>

                  <Button 
                    onClick={handleRefresh}
                    variant="outline"
                    className="w-full"
                    disabled={isLoading || isWaitingForLogin}
                    data-testid="button-refresh-qr"
                  >
                    <RefreshCw className="w-4 h-4 ml-2" />
                    به‌روزرسانی کد QR
                  </Button>
                </div>
              </div>
            )}

            <div className="text-center pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                این ابزار از طریق Puppeteer به صفحه واتساپ وب متصل می‌شود و تصویر کد QR را دریافت می‌کند
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

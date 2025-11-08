'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface QuizCodeDisplayProps {
  code: string;
  title?: string;
  description?: string;
  showQRCode?: boolean;
}

export function QuizCodeDisplay({ 
  code, 
  title = 'Quiz Access Code',
  description = 'Share this code with students to access the quiz',
  showQRCode = false,
}: QuizCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard!');
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy code');
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Large Code Display */}
          <div className="relative">
            <div 
              className="
                flex items-center justify-center
                bg-gradient-to-br from-primary/10 to-primary/5
                border-2 border-primary/30 rounded-xl
                p-8 sm:p-12
              "
            >
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                  Access Code
                </p>
                <p 
                  className="
                    text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
                    font-bold font-mono tracking-wider
                    text-primary
                  "
                  aria-label={`Quiz access code: ${code.split('').join(' ')}`}
                >
                  {code}
                </p>
              </div>
            </div>
            
            {/* Copy Button */}
            <Button
              onClick={handleCopy}
              size="lg"
              className="w-full mt-4"
              variant={copied ? 'secondary' : 'default'}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-5 w-5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" />
                  Copy Code
                </>
              )}
            </Button>
          </div>

          {/* QR Code Placeholder */}
          {showQRCode && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-sm text-gray-500 text-center px-4">
                    QR Code
                    <br />
                    <span className="text-xs">(Feature coming soon)</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Students can scan this QR code to quickly access the quiz
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-2">How to share:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Copy the access code using the button above</li>
              <li>Share it with your students via email, chat, or announcement</li>
              <li>Students can enter the code at the quiz join page</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

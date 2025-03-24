
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { addLog } from '@/services/localStorage';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const EmailTester = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  const handleSendTestEmail = async () => {
    if (!email) {
      toast.error("Vnesite e-poštni naslov");
      return;
    }
    
    setLoading(true);
    setLogs([`[${new Date().toISOString()}] Simulating test email to ${email}...`]);
    
    try {
      // Simulate sending
      setLogs(prev => [...prev, `[${new Date().toISOString()}] Client-side email simulation starting...`]);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const simulatedLogId = `sim_${Date.now()}`;
      
      setLogs(prev => [
        ...prev, 
        `[${new Date().toISOString()}] Email simulated successfully (ID: ${simulatedLogId})`,
        `[${new Date().toISOString()}] Subject: Test Email ${new Date().toLocaleTimeString()}`,
        `[${new Date().toISOString()}] Body: This is a test email sent at ${new Date().toLocaleString()}`
      ]);
      
      addLog('info', 'Test email simulated', {
        recipient: email,
        simulationId: simulatedLogId
      });
      
      toast.success("E-pošta je simulirana", {
        description: "V produkcijskem okolju bi bila e-pošta poslana."
      });
    } catch (error) {
      console.error('Error simulating email:', error);
      
      const errorMessage = String(error);
      
      setLogs(prev => [...prev, `[${new Date().toISOString()}] ERROR: ${errorMessage}`]);
      
      addLog('error', 'Test email simulation failed', {
        recipient: email,
        error: errorMessage
      });
      
      toast.error("Napaka pri simulaciji", {
        description: "Preverite konzolo za podrobnosti."
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white">
      <h2 className="text-xl font-bold">Test pošiljanja e-pošte</h2>
      
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Omejitve storitve</AlertTitle>
        <AlertDescription>
          PHP mail() funkcije niso dostopne v tem okolju. E-pošta bo simulirana, ne bo pa dejansko poslana.
        </AlertDescription>
      </Alert>
      
      <div className="flex gap-2">
        <Input
          placeholder="E-poštni naslov"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSendTestEmail} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Simuliraj pošiljanje
        </Button>
      </div>
      
      <div className="mt-4">
        <h3 className="font-medium mb-2">Rezultati simulacije</h3>
        <div className="bg-gray-100 p-2 rounded h-[300px] overflow-y-auto font-mono text-xs">
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div key={index} className="pb-1">
                {log}
              </div>
            ))
          ) : (
            <p className="text-gray-500">Ni razultatov. Kliknite "Simuliraj pošiljanje" za simulacijo testne e-pošte.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailTester;

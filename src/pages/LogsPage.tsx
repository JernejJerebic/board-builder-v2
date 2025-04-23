
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogEntry, getLogs, clearLogs } from '@/services/localStorage';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const LogsPage = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const loadLogs = () => {
    const allLogs = getLogs();
    setLogs(allLogs);
    applyFilters(allLogs, filter, search);
  };

  useEffect(() => {
    loadLogs();
    // Refresh logs every 5 seconds
    const interval = setInterval(loadLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const applyFilters = (logList: LogEntry[], levelFilter: string, searchText: string) => {
    let filtered = logList;
    
    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(log => log.level === levelFilter);
    }
    
    // Apply search filter
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(lowerSearch) || 
        (log.details && JSON.stringify(log.details).toLowerCase().includes(lowerSearch))
      );
    }
    
    setFilteredLogs(filtered);
  };

  const handleFilterChange = (value: string) => {
    setFilter(value);
    applyFilters(logs, value, search);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    applyFilters(logs, filter, value);
  };

  const handleClearLogs = () => {
    clearLogs();
    setLogs([]);
    setFilteredLogs([]);
    toast({
      title: "Logs cleared",
      description: "All log entries have been removed.",
    });
  };

  const handleRefreshLogs = () => {
    loadLogs();
    toast({
      title: "Logs refreshed",
      description: "Log entries have been updated.",
    });
  };

  const downloadLogs = () => {
    const logsJson = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `woodboard_logs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Logs downloaded",
      description: "Log file has been downloaded to your device.",
    });
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-red-500 bg-red-50';
      case 'warning': return 'text-amber-500 bg-amber-50';
      case 'info': return 'text-blue-500 bg-blue-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <Card className="w-full dark:bg-background-dark dark:border-gray-800">
      <CardHeader>
        <CardTitle className="flex justify-between items-center text-foreground dark:text-foreground-dark">
          <span>Application Logs</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="dark:text-foreground-dark dark:border-gray-600 dark:hover:bg-gray-700" onClick={handleRefreshLogs}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="dark:text-foreground-dark dark:border-gray-600 dark:hover:bg-gray-700" onClick={downloadLogs}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Logs
            </Button>
          </div>
        </CardTitle>
        <CardDescription className="dark:text-gray-400">
          View and analyze application logs. Total entries: {logs.length}
        </CardDescription>
        <div className="flex gap-4 mt-4">
          <div className="flex-1">
            <Input
              placeholder="Search logs..."
              value={search}
              onChange={handleSearchChange}
            />
          </div>
          <div className="w-40">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border dark:border-gray-800">
          <div className="bg-muted dark:bg-gray-900 px-4 py-2 font-medium flex items-center text-foreground dark:text-foreground-dark">
            <div className="w-48">Timestamp</div>
            <div className="w-24">Level</div>
            <div className="flex-1">Message</div>
          </div>
          <div className="max-h-[600px] overflow-auto">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log, index) => (
                <div 
                  key={index} 
                  className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 flex items-start hover:bg-muted/50 dark:hover:bg-gray-900/50"
                >
                  <div className="w-48 text-xs text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </div>
                  <div className="w-24">
                    <span className={`text-xs rounded-full px-2 py-1 font-medium ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div>{log.message}</div>
                    {log.details && (
                      <pre className="mt-1 text-xs bg-muted p-2 rounded whitespace-pre-wrap">
                        {typeof log.details === 'object' 
                          ? JSON.stringify(log.details, null, 2) 
                          : log.details}
                      </pre>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground dark:text-foreground-dark/70">
                No logs found. {search || filter !== 'all' ? 'Try adjusting your filters.' : ''}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LogsPage;

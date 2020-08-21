using System;

namespace Jayculator.Webapi.Model
{
    public class LogEntry
    {
        public LogEntry(string remoteIp)
        {
            from = remoteIp;
            when = DateTime.Now;
        }

        public int id { get; private set; }
        public string from { get; private set; }
        public DateTime when { get; private set; }
    }
}
